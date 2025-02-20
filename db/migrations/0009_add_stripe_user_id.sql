-- Migration: Add stripe_user_id to users
-- Dependencies: 0008_add_plans_sync_field.sql
-- Impact: Adiciona campo para armazenar o ID do cliente no Stripe
-- Decision: Campo necessário para integração com Stripe
-- Validation: Verificar se o campo foi adicionado corretamente
-- Precautions: Executar após a migração anterior

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_user_id" text;

---- ROLLBACK ----
ALTER TABLE "users" DROP COLUMN IF EXISTS "stripe_user_id"; 