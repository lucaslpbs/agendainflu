-- Adiciona estados necessários para os fluxos de cancelamento e reembolso
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'CANCELLATION_REQUESTED';
