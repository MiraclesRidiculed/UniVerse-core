CREATE DATABASE IF NOT EXISTS universe_core;
USE universe_core;

CREATE TABLE campus (
    campus_id VARCHAR(50) PRIMARY KEY,
    campus_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE student (
    student_id VARCHAR(50) PRIMARY KEY,
    campus_id VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(120) NOT NULL,
    batch INT NOT NULL,
    instagram VARCHAR(255) DEFAULT '',
    github VARCHAR(255) DEFAULT '',
    linkedin VARCHAR(255) DEFAULT '',
    CONSTRAINT fk_student_campus
        FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
        ON DELETE CASCADE
);

CREATE TABLE admin (
    admin_id VARCHAR(50) PRIMARY KEY,
    campus_id VARCHAR(50) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    CONSTRAINT fk_admin_campus
        FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
        ON DELETE CASCADE
);

CREATE TABLE community (
    community_id VARCHAR(50) PRIMARY KEY,
    campus_id VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    CONSTRAINT fk_community_campus
        FOREIGN KEY (campus_id) REFERENCES campus(campus_id)
        ON DELETE CASCADE
);

CREATE TABLE post (
    post_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    community_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_post_community
        FOREIGN KEY (community_id) REFERENCES community(community_id)
        ON DELETE CASCADE
);

CREATE TABLE resource (
    resource_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    community_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_student
        FOREIGN KEY (student_id) REFERENCES student(student_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_resource_community
        FOREIGN KEY (community_id) REFERENCES community(community_id)
        ON DELETE CASCADE
);
