-- Migration: Add plans sync field
-- Dependencies: 0007_add_subscription_cancel_fields.sql
-- Impact: Adiciona campo para controle de sincronização de planos
-- Decision: Campo necessário para controle de cache e atualização automática
-- Validation: Verificar se o campo foi adicionado corretamente
-- Precautions: Executar após a migração anterior

ALTER TABLE "subscriptions_plans" ADD COLUMN IF NOT EXISTS "last_sync" timestamp DEFAULT now();

---- ROLLBACK ----
ALTER TABLE "subscriptions_plans" DROP COLUMN IF EXISTS "last_sync"; 