-- Run once in Neon SQL Editor BEFORE deploying the edit/delete UI and API.
-- Safe, idempotent migration. Existing work sessions and generated durations stay unchanged.
BEGIN;
ALTER TABLE work_sessions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_sessions_active_task
  ON work_sessions(task_id) WHERE deleted_at IS NULL;
COMMIT;
