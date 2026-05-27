-- Adiciona status AWAITING_TRANSFER ao enum payment_status
-- Usado quando influenciadora marca serviço como concluído e admin precisa pagar manualmente
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'AWAITING_TRANSFER';

-- Adiciona coluna completed_at para registrar quando a influenciadora marcou como concluído
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
