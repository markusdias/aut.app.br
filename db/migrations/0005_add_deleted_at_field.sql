-- Migration: add_deleted_at_field
-- Created at: 2024-02-03T23:50:00.000Z
-- Description: Adiciona campo deleted_at na tabela users para rastreamento de deleção de usuários

-- Adicionar campo na tabela users
ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp;

---- ROLLBACK ----
ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at"; 