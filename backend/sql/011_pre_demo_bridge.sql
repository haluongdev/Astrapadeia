BEGIN;
CREATE TABLE IF NOT EXISTS pre_demo_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id),
  client_reference text NOT NULL CHECK(client_reference ~ '^TXN-[0-9]{6}$'),
  plan_code text NOT NULL,
  plan_name text NOT NULL,
  amount_vnd bigint NOT NULL CHECK(amount_vnd >= 0),
  payment_method text NOT NULL CHECK(payment_method IN ('vietqr','momo','zalopay','vnpay')),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','simulated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(account_id,client_reference)
);
CREATE INDEX IF NOT EXISTS pre_demo_transactions_created_idx ON pre_demo_transactions(created_at DESC);
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='scholyx_user') THEN
   GRANT SELECT,INSERT,UPDATE ON TABLE pre_demo_transactions TO scholyx_user;
 ELSE
   RAISE EXCEPTION 'Database role scholyx_user not found; stop to avoid unsafe grants';
 END IF;
END $$;
COMMIT;
