# MongoDB to MySQL Local Migration Walkthrough

This guide explains how to move the current `UniVerse-core` backend from MongoDB to a local MySQL server without guessing how the existing code behaves.

## What the repo does today

The backend still runs on MongoDB through `mongoose`.

- `src/app/database.ts` opens the database connection with `process.env.MONGO_URI` and loads data with `UserSchema.find()` and `HotspotSchema.find()`.
- `src/structures/User.ts` writes and updates users through `UserSchema.create()` and `UserSchema.updateOne()`.
- `src/structures/University.ts` creates hotspots through `HotspotSchema.save()`.
- `src/schemas/UserSchema.ts` and `src/schemas/HotspotSchema.ts` define the current MongoDB document shape.

Important: `schema/universe_mysql_schema.sql` is a useful start, but it does not match the current Mongo models one-to-one yet.

- The code currently stores `User` documents with nested `handles` and a `picture`.
- The code currently stores `Hotspot` documents with `id`, `type`, and `location`.
- The SQL schema file currently defines `campus`, `student`, `admin`, `community`, `post`, and `resource`, but it does not yet define a `hotspot` table.
- The SQL `student` table also requires a `campus_id`, which does not exist in the current Mongo `User` model.

Because of that mismatch, the safest first migration is:

1. Move the data into MySQL tables that mirror the current Mongo shape.
2. Switch the runtime code from `mongoose` to MySQL queries.
3. Normalize further into `campus`, `student`, `community`, and the other relational tables after the app is stable.

## Recommended migration plan

### 1. Back up the MongoDB data first

Run a full backup before changing anything:

```bash
mongodump --uri="mongodb://127.0.0.1:27017" --db=core --out=./mongo-backup
```

If your connection string or database name is different, replace them with the values currently used in `.env`.

The code defaults `DB_NAME` to `core` in `src/app/database.ts`.

### 2. Start your local MySQL server

Make sure MySQL is installed and running locally, then open a shell:

```bash
mysql -u root -p
```

If you want to load the existing relational schema draft first, run:

```bash
mysql -u root -p < schema/universe_mysql_schema.sql
```

That creates `universe_core`, but you still need compatibility tables for the current `User` and `Hotspot` models.

### 3. Create compatibility tables for the current backend

The current code will be easier to migrate if MySQL first mirrors the Mongo document structure.

Run this inside MySQL:

```sql
CREATE DATABASE IF NOT EXISTS universe_core;
USE universe_core;

CREATE TABLE IF NOT EXISTS user_profile (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(120) NOT NULL,
    batch INT NOT NULL,
    instagram VARCHAR(255) NOT NULL DEFAULT '',
    github VARCHAR(255) NOT NULL DEFAULT '',
    facebook VARCHAR(255) NOT NULL DEFAULT '',
    linkedin VARCHAR(255) NOT NULL DEFAULT '',
    picture VARCHAR(512) NOT NULL DEFAULT 'https://insights2techinfo.com/wp-content/uploads/2022/01/za.png'
);

CREATE TABLE IF NOT EXISTS hotspot (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(120) NOT NULL,
    location VARCHAR(255) NOT NULL
);
```

Why this helps:

- It matches `src/schemas/UserSchema.ts` closely.
- It matches `src/schemas/HotspotSchema.ts` closely.
- It avoids forcing a fake `campus_id` into every migrated user before the app is ready for it.

### 4. Export the current Mongo collections

The repo does not override collection names, so the default Mongoose collection names are likely `users` and `hotspots`.

Export them as JSON:

```bash
mongoexport --uri="mongodb://127.0.0.1:27017" --db=core --collection=users --out=./users.json --jsonArray
mongoexport --uri="mongodb://127.0.0.1:27017" --db=core --collection=hotspots --out=./hotspots.json --jsonArray
```

If your Mongo database name is not `core`, use the value from `.env`.

### 5. Map Mongo fields into MySQL columns

Use this mapping when you load the exported data:

| MongoDB field | MySQL table | MySQL column |
| --- | --- | --- |
| `User.id` | `user_profile` | `id` |
| `User.name` | `user_profile` | `name` |
| `User.email` | `user_profile` | `email` |
| `User.department` | `user_profile` | `department` |
| `User.batch` | `user_profile` | `batch` |
| `User.handles.instagram` | `user_profile` | `instagram` |
| `User.handles.github` | `user_profile` | `github` |
| `User.handles.facebook` | `user_profile` | `facebook` |
| `User.handles.linkedin` | `user_profile` | `linkedin` |
| `User.picture` | `user_profile` | `picture` |
| `Hotspot.id` | `hotspot` | `id` |
| `Hotspot.type` | `hotspot` | `type` |
| `Hotspot.location` | `hotspot` | `location` |

If you prefer to migrate directly into the existing `student` table, you must decide how to populate `campus_id` for every user first.

### 6. Load the exported JSON into MySQL

You can do this with a one-off script, MySQL Workbench import tools, or manual SQL inserts.

The simplest code-driven approach is:

1. Read `users.json`.
2. Flatten `handles` into `instagram`, `github`, `facebook`, and `linkedin`.
3. Insert rows into `user_profile`.
4. Read `hotspots.json`.
5. Insert rows into `hotspot`.

If you want a quick one-off script, the SQL rows should look like this shape:

```sql
INSERT INTO user_profile (
    id, name, email, department, batch,
    instagram, github, facebook, linkedin, picture
) VALUES (
    'u_001',
    'Jane Doe',
    'jane@example.com',
    'CSE',
    2026,
    'jane_insta',
    'janehub',
    '',
    'jane-linkedin',
    'https://example.com/jane.png'
);

INSERT INTO hotspot (id, type, location)
VALUES ('h_001', 'cafe', 'North Block');
```

### 7. Replace the Mongo runtime code with MySQL code

After the data exists in MySQL, the backend still will not use it until the data-access code changes.

You will need to update at least these areas:

- `src/app/database.ts`
  - Replace `mongoose.connect(...)` with a MySQL connection or pool.
  - Replace `UserSchema.find().lean()` with `SELECT` queries.
  - Replace `HotspotSchema.find()` with `SELECT` queries.
- `src/structures/User.ts`
  - Replace `UserSchema.updateOne(...)` with `UPDATE user_profile ...`
  - Replace `UserSchema.create(...)` with `INSERT INTO user_profile ...`
- `src/structures/University.ts`
  - Replace `HotspotSchema.save()` with `INSERT INTO hotspot ...`

At that point you will also need a MySQL driver, such as `mysql2`.

### 8. Swap the environment variables

Right now the code expects:

- `MONGO_URI`
- `DB_NAME`

After the code is rewritten for MySQL, replace those with something like:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=universe_core
```

### 9. Test the migrated backend locally

After the code changes, test the app in this order:

1. Start MySQL.
2. Start the backend.
3. Confirm startup no longer references `MONGO_URI`.
4. Test `POST /admin/signup`.
5. Test `GET /students/:id`.
6. Test `PATCH /students/:id`.
7. Test hotspot creation and hotspot loading on boot.

## Known gaps to resolve during the migration

- The current SQL schema draft does not include a `hotspot` table.
- The current SQL schema draft does not include a direct equivalent for `User.picture`.
- The current SQL schema draft expects `student.campus_id`, but the current Mongo `User` model does not provide it.
- The current runtime code caches users and hotspots in memory after boot, so the migration must preserve those boot-time loads.

## Suggested end state

For the least risky rollout:

1. Migrate Mongo data into `user_profile` and `hotspot`.
2. Switch the backend code to MySQL.
3. Verify the app behaves the same way locally.
4. Only then refactor the schema further into `student`, `campus`, `community`, `post`, and `resource` if that normalization is still desired.
