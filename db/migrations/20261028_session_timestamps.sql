-- Existing edit timestamps are unknown: leave them NULL. Preserve created_at.
ALTER TABLE work_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz;
