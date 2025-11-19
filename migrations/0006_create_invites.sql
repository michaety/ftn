-- Migration number: 0006    2025-11-19T04:15:00.000Z
DROP TABLE IF EXISTS invites;

CREATE TABLE invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_by INTEGER NOT NULL,
    used BOOLEAN NOT NULL DEFAULT 0,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_used ON invites(used);
