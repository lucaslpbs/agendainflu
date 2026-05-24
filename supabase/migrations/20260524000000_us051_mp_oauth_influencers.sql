-- US-051: Mercado Pago OAuth fields for influencers (Split de Pagamentos 1:1)
ALTER TABLE influencers
  ADD COLUMN IF NOT EXISTS mp_access_token      TEXT,
  ADD COLUMN IF NOT EXISTS mp_refresh_token     TEXT,
  ADD COLUMN IF NOT EXISTS mp_user_id           VARCHAR(50),
  ADD COLUMN IF NOT EXISTS mp_token_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mp_connected_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mp_connected         BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_influencers_mp_connected ON influencers(mp_connected);
