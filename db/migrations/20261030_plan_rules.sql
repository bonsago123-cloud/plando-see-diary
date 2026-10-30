CREATE TABLE IF NOT EXISTS plan_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 160),
 description text NOT NULL DEFAULT '' CHECK(length(description)<=1000),
 priority text NOT NULL DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 deleted_at timestamptz,
 version integer NOT NULL DEFAULT 1,
 history jsonb NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_plan_rules_plan ON plan_rules(plan_id);
