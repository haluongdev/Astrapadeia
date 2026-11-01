BEGIN;
CREATE TABLE IF NOT EXISTS vip_promo_codes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE CHECK (length(code) BETWEEN 3 AND 40),
 discount_type text NOT NULL CHECK (discount_type IN ('percent','fixed')),
 discount_value bigint NOT NULL CHECK (discount_value > 0),
 starts_at timestamptz,
 ends_at timestamptz,
 usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
 used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
 plan_id uuid REFERENCES vip_plans(id),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (discount_type <> 'percent' OR discount_value <= 100),
 CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS vip_manual_grants_expiry_idx ON vip_manual_grants(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS vip_promo_codes_status_idx ON vip_promo_codes(active,ends_at);
COMMIT;
