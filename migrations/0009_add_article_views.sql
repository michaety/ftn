-- Migration number: 0009    2025-11-25T22:00:00.000Z
-- Add view_count column to articles table for tracking article views

ALTER TABLE articles ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Create index for faster sorting by view count
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);
