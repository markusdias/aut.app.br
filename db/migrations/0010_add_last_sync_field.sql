-- Migration: Add last_sync field to all tables
-- Dependencies: 0009_add_stripe_user_id.sql
-- Impact: Adiciona campo para controle de última sincronização em todas as tabelas
-- Decision: Campo necessário para monitoramento e cache
-- Validation: Verificar se o campo foi adicionado corretamente
-- Precautions: Executar após a migração anterior

-- Adiciona campo last_sync nas tabelas que não o possuem
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_sync" timestamp DEFAULT now();
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "last_sync" timestamp DEFAULT now();
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "last_sync" timestamp DEFAULT now();

-- Atualiza o valor inicial do campo
UPDATE "users" SET "last_sync" = now() WHERE "last_sync" IS NULL;
UPDATE "subscriptions" SET "last_sync" = now() WHERE "last_sync" IS NULL;
UPDATE "invoices" SET "last_sync" = now() WHERE "last_sync" IS NULL;

-- Adiciona índices para otimização de queries
CREATE INDEX IF NOT EXISTS idx_users_last_sync ON users(last_sync);
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_sync ON subscriptions(last_sync);
CREATE INDEX IF NOT EXISTS idx_invoices_last_sync ON invoices(last_sync);

---- ROLLBACK ----
DROP INDEX IF EXISTS idx_invoices_last_sync;
DROP INDEX IF EXISTS idx_subscriptions_last_sync;
DROP INDEX IF EXISTS idx_users_last_sync;

ALTER TABLE "invoices" DROP COLUMN IF EXISTS "last_sync";
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "last_sync";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_sync"; 