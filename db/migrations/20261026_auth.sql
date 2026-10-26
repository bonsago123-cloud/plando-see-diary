-- T07: after schema.sql and all T06 migrations. Existing unowned data stays private.
BEGIN;
CREATE TABLE IF NOT EXISTS app_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK(email=lower(email)),
 password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE IF NOT EXISTS auth_attempts (
 identifier text PRIMARY KEY,
 count integer NOT NULL,
 window_start timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES app_users(id) ON DELETE RESTRICT;
ALTER TABLE thought_topics ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES app_users(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS plans_owner ON plans(owner_id);
CREATE INDEX IF NOT EXISTS topics_owner ON thought_topics(owner_id);
-- The old global categories remain only for the one-time admin migration.
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_category_fkey;
CREATE TABLE IF NOT EXISTS user_categories (
 owner_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 50),
 PRIMARY KEY(owner_id,name)
);
COMMIT;
