-- Adicionando campos na tabela invoices
ALTER TABLE invoices
ADD COLUMN period_start timestamp,
ADD COLUMN period_end timestamp,
ADD COLUMN payment_intent text;

-- Adicionando campos na tabela subscriptions
ALTER TABLE subscriptions
ADD COLUMN current_period_start timestamp,
ADD COLUMN current_period_end timestamp; 