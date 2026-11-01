CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text UNIQUE,
  grade smallint CHECK (grade IN (10,11,12)),
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','locked','disabled')),
  failed_logins integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  consent_terms_version text NOT NULL,
  consent_privacy_version text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
 );
CREATE TABLE IF NOT EXISTS roles (
  id text PRIMARY KEY,
  is_system boolean NOT NULL DEFAULT false
);
INSERT INTO roles(id,is_system) VALUES ('student',true),('qtnd',true),('qtv',true)
ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS account_roles (
  account_id uuid NOT NULL REFERENCES accounts(id),
  role_id text NOT NULL REFERENCES roles(id),
  PRIMARY KEY(account_id,role_id)
);
CREATE TABLE IF NOT EXISTS permissions (id text PRIMARY KEY, description text);
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id text REFERENCES roles(id),
  permission_id text REFERENCES permissions(id),
  PRIMARY KEY(role_id, permission_id)
);
CREATE TABLE IF NOT EXISTS one_time_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  purpose text NOT NULL CHECK (purpose IN ('activate','reset')),
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  token_hash text UNIQUE NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS student_profiles (
  account_id uuid PRIMARY KEY REFERENCES accounts(id),
  school text, province text, avatar_url text, selected_subjects text[] NOT NULL DEFAULT '{}',
  target_scores jsonb NOT NULL DEFAULT '{}'::jsonb, target_exam_date date,
  ai_personalization boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  handled_at timestamptz
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id bigserial PRIMARY KEY,
  actor_id uuid REFERENCES accounts(id),
  action text NOT NULL,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs(created_at DESC);
-- Future phase: plan_catalog, vip_entitlements, transactions, refunds, discounts.
-- Never store raw card details or enable VIP from an unverified payment callback.
