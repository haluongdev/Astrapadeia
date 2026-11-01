CREATE TABLE IF NOT EXISTS admin_account_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('invite','reset')),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid NOT NULL REFERENCES accounts(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_account_links_lookup ON admin_account_links(account_id, purpose, created_at DESC);
