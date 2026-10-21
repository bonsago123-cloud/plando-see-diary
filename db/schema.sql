-- 과제6 PostgreSQL schema / Neon SQL Editor에서 전체 실행.
-- Run once. All IDs are UUID; durations are integer minutes; dates are Seoul-local calendar dates.
BEGIN;
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 120),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  success_criteria text NOT NULL CHECK (length(btrim(success_criteria)) BETWEEN 1 AND 1000),
  estimated_minutes integer CHECK (estimated_minutes BETWEEN 0 AND 1000000),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  parent_plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  carry_over_text text NOT NULL DEFAULT '',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS plan_revisions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  version integer NOT NULL,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  priority text NOT NULL,
  success_criteria text NOT NULL,
  estimated_minutes integer,
  carry_over_text text NOT NULL DEFAULT '',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_plan_version UNIQUE (plan_id,version)
);
CREATE OR REPLACE FUNCTION record_plan_revision() RETURNS trigger AS $$
BEGIN
  INSERT INTO plan_revisions(plan_id, version, title, start_date, end_date, priority, success_criteria, estimated_minutes, carry_over_text)
  VALUES (NEW.id,NEW.version,NEW.title,NEW.start_date,NEW.end_date,NEW.priority,NEW.success_criteria,NEW.estimated_minutes,NEW.carry_over_text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_plan_revisions ON plans;
CREATE TRIGGER trg_plan_revisions AFTER INSERT OR UPDATE OF title,start_date,end_date,priority,success_criteria,estimated_minutes,carry_over_text ON plans
FOR EACH ROW EXECUTE FUNCTION record_plan_revision();

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
  tag text NOT NULL DEFAULT '',
  estimated_minutes integer CHECK(estimated_minutes BETWEEN 0 AND 1000000),
  start_time time without time zone,
  end_time time without time zone,
  CONSTRAINT tasks_time_slot_valid CHECK ((start_time IS NULL AND end_time IS NULL) OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)),
  status text NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','doing','completed')),
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_plan ON tasks(plan_id,deleted_at,due_date,id);
CREATE TABLE IF NOT EXISTS completion_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id uuid NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE RESTRICT,
  event_key text NOT NULL UNIQUE,
  completed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE RESTRICT,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL CHECK(ended_at >= started_at),
  duration_minutes integer GENERATED ALWAYS AS (round(extract(epoch FROM (ended_at-started_at))/60)::integer) STORED,
  blocked_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CHECK(length(blocked_reason) <= 1000)
);
CREATE INDEX IF NOT EXISTS idx_sessions_task ON work_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active_task ON work_sessions(task_id) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS reviews (
  plan_id uuid PRIMARY KEY REFERENCES plans(id) ON DELETE CASCADE,
  reflection text NOT NULL DEFAULT '',
  improvement text NOT NULL DEFAULT '',
  next_plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
