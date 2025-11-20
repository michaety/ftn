-- Migration number: 0008    2025-11-20T04:50:00.000Z
-- Add category field to articles table

ALTER TABLE articles ADD COLUMN category VARCHAR(50) CHECK (category IN ('breaking', 'rumor', 'opinion', 'fake news'));

-- Update existing articles to have a default category (optional, can be left NULL for now)
-- UPDATE articles SET category = 'rumor' WHERE category IS NULL;
