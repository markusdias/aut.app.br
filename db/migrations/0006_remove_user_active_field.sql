-- Migration: remove_user_active_field
-- Created at: 2024-02-04T22:00:00.000Z
-- Description: Remove o campo active da tabela users por não estar sendo utilizado

ALTER TABLE "users" DROP COLUMN IF EXISTS "active";

---- ROLLBACK ----
ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true NOT NULL; 