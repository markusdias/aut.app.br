-- Migration: add user status fields
-- Created at: 2024-02-03T21:57:00.000Z
-- Description: Adiciona campos status e active na tabela users para controle de estado do usuário

-- Criar tipo enum para status do usuário
CREATE TYPE "public"."user_status" AS ENUM('active', 'blocked', 'banned', 'deleted');

-- Adicionar campos na tabela users
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active' NOT NULL;
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL;

---- ROLLBACK ----
ALTER TABLE "users" DROP COLUMN IF EXISTS "status";
ALTER TABLE "users" DROP COLUMN IF EXISTS "active";
DROP TYPE IF EXISTS "public"."user_status";