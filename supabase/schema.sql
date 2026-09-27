-- Umbra Escrow Tables
-- Run this in your Supabase SQL editor to create the schema.

CREATE TABLE IF NOT EXISTS escrows (
  id TEXT PRIMARY KEY,
  contract_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  condition TEXT NOT NULL,
  state INTEGER NOT NULL DEFAULT 0,
  state_label TEXT NOT NULL DEFAULT 'Created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  funded_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  transaction_hash TEXT,
  deposit_coin_index TEXT,
  buyer_secret TEXT NOT NULL,
  seller_secret TEXT NOT NULL,
  salt TEXT NOT NULL
);

-- Append-only event log for every real on-chain transition
CREATE TABLE IF NOT EXISTS escrow_events (
  id BIGSERIAL PRIMARY KEY,
  escrow_id TEXT NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  from_state INTEGER,
  to_state INTEGER NOT NULL,
  transaction_hash TEXT,
  block_height BIGINT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_escrows_state ON escrows(state);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer ON escrows(buyer_address);
CREATE INDEX IF NOT EXISTS idx_escrows_seller ON escrows(seller_address);
CREATE INDEX IF NOT EXISTS idx_escrows_created ON escrows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_events_escrow ON escrow_events(escrow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_events_created ON escrow_events(created_at DESC);

-- Row Level Security
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (auth can be added later)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'escrows' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON escrows FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'escrow_events' AND policyname = 'Allow all operations'
  ) THEN
    CREATE POLICY "Allow all operations" ON escrow_events FOR ALL USING (true);
  END IF;
END $$;

-- Realtime: stream row changes to subscribed frontend clients
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS escrows;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS escrow_events;
ALTER TABLE escrows REPLICA IDENTITY FULL;
ALTER TABLE escrow_events REPLICA IDENTITY FULL;
