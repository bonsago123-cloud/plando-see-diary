-- Latest design (6) only. Additive; execute after the existing schema.
BEGIN;
CREATE TABLE IF NOT EXISTS plan_categories (name text PRIMARY KEY CHECK(length(btrim(name)) BETWEEN 1 AND 50));
ALTER TABLE plans ADD COLUMN IF NOT EXISTS category text REFERENCES plan_categories(name);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_completed boolean NOT NULL DEFAULT false;
ALTER TABLE plan_revisions ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE plan_revisions ADD COLUMN IF NOT EXISTS is_completed boolean NOT NULL DEFAULT false;
CREATE OR REPLACE FUNCTION record_plan_revision() RETURNS trigger AS $$
BEGIN
 INSERT INTO plan_revisions(plan_id,version,title,start_date,end_date,priority,success_criteria,estimated_minutes,carry_over_text,category,is_completed)
 VALUES(NEW.id,NEW.version,NEW.title,NEW.start_date,NEW.end_date,NEW.priority,NEW.success_criteria,NEW.estimated_minutes,NEW.carry_over_text,NEW.category,NEW.is_completed);
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_plan_revisions ON plans;
CREATE TRIGGER trg_plan_revisions AFTER INSERT OR UPDATE OF title,start_date,end_date,priority,success_criteria,estimated_minutes,carry_over_text,category,is_completed ON plans
FOR EACH ROW EXECUTE FUNCTION record_plan_revision();
CREATE TABLE IF NOT EXISTS thought_topics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 120),
 start_date date NOT NULL, end_date date NOT NULL CHECK(end_date >= start_date),
 blocks jsonb NOT NULL DEFAULT '[""]'::jsonb CHECK(jsonb_typeof(blocks)='array' AND jsonb_array_length(blocks) BETWEEN 1 AND 20),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE TABLE IF NOT EXISTS thoughts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), topic_id uuid NOT NULL REFERENCES thought_topics(id),
 title text NOT NULL CHECK(length(btrim(title)) BETWEEN 1 AND 120),
 start_date date NOT NULL, end_date date NOT NULL CHECK(end_date >= start_date),
 blocks jsonb NOT NULL DEFAULT '[""]'::jsonb CHECK(jsonb_typeof(blocks)='array' AND jsonb_array_length(blocks) BETWEEN 1 AND 20),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS thoughts_topic_active ON thoughts(topic_id) WHERE deleted_at IS NULL;
COMMIT;
