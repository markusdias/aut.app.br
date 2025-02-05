-- Migration: add_canceled_at
-- Created at: 2024-02-02T22:18:23.852Z
-- Description: Adiciona campo canceled_at na tabela subscriptions para rastreamento de cancelamentos

DO $$ 
BEGIN 
    -- Adiciona campo canceled_at se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'canceled_at'
    ) THEN
        ALTER TABLE "subscriptions" ADD COLUMN "canceled_at" timestamp;
    END IF;
END $$;

---- ROLLBACK ----
ALTER TABLE subscriptions DROP COLUMN IF EXISTS canceled_at; 