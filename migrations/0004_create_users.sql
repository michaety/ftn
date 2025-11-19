-- Migration number: 0004    2025-11-19T04:15:00.000Z
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- Create default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (email, password_hash, role, name) 
VALUES ('admin@fishtank.news', '$2a$10$rN8YVJHqGZMPYcVxqZ7QHO8vKqRmF7LfTMxJ8V8Z7QHO8vKqRmF7L', 'admin', 'Admin User');
