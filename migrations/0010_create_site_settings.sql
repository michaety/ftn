-- Migration number: 0010    2025-11-25T23:00:00.000Z
-- Create site_settings table for storing admin configuration options

CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Insert default trending settings
INSERT INTO site_settings (setting_key, setting_value) VALUES 
    ('trending_mode', 'automatic'),
    ('trending_manual_articles', '[]');
