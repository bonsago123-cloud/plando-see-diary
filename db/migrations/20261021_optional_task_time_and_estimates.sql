-- Required before deploying the optional time/estimate controls.
-- Preserves all existing records and all previously stored integer estimates.
BEGIN;
ALTER TABLE plans ALTER COLUMN estimated_minutes DROP NOT NULL;
ALTER TABLE plans ALTER COLUMN estimated_minutes DROP DEFAULT;
ALTER TABLE plan_revisions ALTER COLUMN estimated_minutes DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN estimated_minutes DROP NOT NULL;
ALTER TABLE tasks ALTER COLUMN estimated_minutes DROP DEFAULT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time time without time zone;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_time time without time zone;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='tasks'::regclass AND conname='tasks_time_slot_valid') THEN
  ALTER TABLE tasks ADD CONSTRAINT tasks_time_slot_valid CHECK (
   (start_time IS NULL AND end_time IS NULL)
   OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  );
 END IF;
END $$;
COMMIT;
