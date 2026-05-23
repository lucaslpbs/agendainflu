-- US-050: Mercado Pago payment integration
-- Adds payment fields to bookings and creates payment_transactions audit table

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
  'PENDING_PAYMENT',
  'PAID',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED'
);

-- Add payment columns to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_status     payment_status  NOT NULL DEFAULT 'PENDING_PAYMENT',
  ADD COLUMN IF NOT EXISTS price_original     DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS price_client       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS platform_fee       DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS mp_fee             DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS mp_payment_id      VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mp_preference_id   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mp_merchant_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS paid_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS influencer_mp_id   VARCHAR(100);

-- Migrate existing records: map old booking_status → payment_status
UPDATE bookings SET payment_status = 'CANCELLED'  WHERE status = 'cancelado';
UPDATE bookings SET payment_status = 'COMPLETED'  WHERE status = 'concluido';
UPDATE bookings SET payment_status = 'PAID'       WHERE status IN ('confirmado', 'pendente') AND pagamento_confirmado = true;

-- Audit table for all payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id              SERIAL PRIMARY KEY,
  booking_id      UUID REFERENCES bookings(id) ON DELETE CASCADE,
  mp_payment_id   VARCHAR(100),
  type            VARCHAR(30)     NOT NULL, -- 'charge', 'release', 'refund'
  amount          DECIMAL(10,2)   NOT NULL,
  status          VARCHAR(30)     NOT NULL,
  mp_response     JSONB,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_mp_payment_id ON payment_transactions(mp_payment_id);

-- RLS for payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_payment_transactions"
  ON payment_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_mp_payment_id  ON bookings(mp_payment_id);
