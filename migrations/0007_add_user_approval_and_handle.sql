-- Migration number: 0007    2025-11-20T03:45:00.000Z
-- Add author_handle and approval status to users table

ALTER TABLE users ADD COLUMN author_handle VARCHAR(255);
ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing users to have approved status
UPDATE users SET status = 'approved' WHERE status = 'approved';

-- Update default admin user with new credentials
-- Password hash for 'rohypnol'
UPDATE users 
SET email = 'michaety@pm.me', 
    name = 'soon', 
    author_handle = '@5wcol',
    password_hash = '$2b$10$FFJexD1FDX3TYe7CoWKB3uWpwyZddJeMKMmE75Rp9hpTE9nAVKJX.'
WHERE email = 'admin@fishtank.news';
