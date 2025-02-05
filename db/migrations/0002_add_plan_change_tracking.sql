-- Migration: add_plan_change_tracking
-- Created at: 2024-02-02T18:52:53.955Z
-- Description: Adiciona campos para rastreamento de mudanças de plano na tabela subscriptions

DO $$ 
BEGIN 
    -- Adiciona campo previous_plan_id se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'previous_plan_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN previous_plan_id TEXT;
    END IF;

    -- Adiciona campo plan_changed_at se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'plan_changed_at'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN plan_changed_at TIMESTAMP;
    END IF;
END $$;

---- ROLLBACK ----
ALTER TABLE subscriptions DROP COLUMN IF EXISTS plan_changed_at;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS previous_plan_id; 