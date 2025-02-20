-- Migration: Add unique constraints
-- Dependencies: 0010_add_last_sync_field.sql
-- Impact: Adiciona constraints UNIQUE para prevenir duplicações
-- Decision: Necessário para garantir integridade dos dados
-- Validation: Verificar se as constraints foram adicionadas corretamente
-- Precautions: Executar após remover duplicatas

-- Primeiro, remover duplicatas mantendo apenas o registro mais recente
DELETE FROM subscriptions a USING subscriptions b
WHERE a.id < b.id 
AND a.subscription_id = b.subscription_id;

DELETE FROM invoices a USING invoices b
WHERE a.id < b.id 
AND a.invoice_id = b.invoice_id;

-- Adicionar constraints UNIQUE
ALTER TABLE subscriptions 
ADD CONSTRAINT subscriptions_subscription_id_unique UNIQUE (subscription_id);

ALTER TABLE invoices 
ADD CONSTRAINT invoices_invoice_id_unique UNIQUE (invoice_id);

---- ROLLBACK ----
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS invoices_invoice_id_unique;

ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_subscription_id_unique; 