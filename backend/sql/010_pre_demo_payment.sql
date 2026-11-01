BEGIN;
ALTER TABLE vip_transactions DROP CONSTRAINT IF EXISTS vip_transactions_status_check;
ALTER TABLE vip_transactions ADD CONSTRAINT vip_transactions_status_check
 CHECK (status IN ('pending','paid','failed','cancelled','refunded','simulated'));
ALTER TABLE vip_transactions ADD COLUMN IF NOT EXISTS demo_completed_at timestamptz;
CREATE INDEX IF NOT EXISTS vip_transactions_account_date_idx ON vip_transactions(account_id,created_at DESC);
COMMIT;
