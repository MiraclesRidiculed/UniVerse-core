# UniVerse-core
UniVerse-Core is an Express-based API server responsible for handling the backend algorithms and database operations

## Guides

- [MongoDB to MySQL local migration walkthrough](./docs/mongodb-to-mysql-local.md)
- [Current MySQL schema draft](./schema/universe_mysql_schema.sql)

## MySQL Backend Quickstart

1. Copy `.env.example` to `.env` and fill in your MySQL connection values.
2. Create the schema with `schema/universe_mysql_schema.sql`.
3. Load sample data with `schema/universe_mysql_seed.sql` if you want the new frontend-aligned records locally.
4. Install dependencies with `npm install`.
5. Build the backend with `npm run build`.
6. Start it with `npm start`.

## Schema Routes

- `GET /client/summary`
- `GET /client/campuses`
- `GET /client/students`
- `GET /client/students/:id`
- `PATCH /client/students/:id`
- `GET /client/communities`
- `GET /client/posts`
- `GET /client/resources`
- `POST /admin/signup`
