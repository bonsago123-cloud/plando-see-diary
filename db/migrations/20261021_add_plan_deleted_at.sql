-- Run ONCE in Neon SQL Editor BEFORE uploading the updated Next.js files.
-- Existing plans, tasks, reviews, version history and sessions are preserved.
ALTER TABLE plans ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
