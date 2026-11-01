BEGIN;
CREATE TABLE IF NOT EXISTS system_settings (
 key text PRIMARY KEY,
 value jsonb NOT NULL,
 updated_by uuid REFERENCES accounts(id),
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO system_settings(key,value) VALUES
 ('registration_enabled','true'::jsonb),
 ('minimum_password_length','8'::jsonb),
 ('ai_enabled','true'::jsonb),
 ('vip_sales_enabled','false'::jsonb),
 ('session_idle_minutes','30'::jsonb),
 ('failed_login_threshold','5'::jsonb)
ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS vip_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 duration_days integer NOT NULL CHECK(duration_days BETWEEN 1 AND 3650),
 price_vnd bigint NOT NULL CHECK(price_vnd>=0),
 description text NOT NULL DEFAULT '',
 benefits jsonb NOT NULL DEFAULT '{}'::jsonb,
 active boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vip_manual_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES accounts(id),
 plan_id uuid REFERENCES vip_plans(id),
 valid_from timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL,
 revoked_at timestamptz,
 reason text NOT NULL,
 revoked_reason text,
 actor_id uuid NOT NULL REFERENCES accounts(id),
 revoked_by uuid REFERENCES accounts(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vip_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 account_id uuid NOT NULL REFERENCES accounts(id),
 plan_id uuid NOT NULL REFERENCES vip_plans(id),
 provider text NOT NULL,
 provider_transaction_id text,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','failed','cancelled','refunded')),
 amount_vnd bigint NOT NULL CHECK(amount_vnd>=0),
 paid_at timestamptz,
 refunded_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider,provider_transaction_id)
);
CREATE INDEX IF NOT EXISTS vip_transactions_status_date_idx ON vip_transactions(status,created_at);
CREATE INDEX IF NOT EXISTS vip_manual_grants_account_idx ON vip_manual_grants(account_id,expires_at);
COMMIT;
