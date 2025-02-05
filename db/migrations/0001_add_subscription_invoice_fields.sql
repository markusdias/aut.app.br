-- Migration: add_subscription_invoice_fields
-- Created at: 2024-02-02T15:34:14.655Z
-- Description: Adiciona campos de período e payment_intent nas tabelas invoices e subscriptions

DO $$ 
BEGIN 
    -- Adiciona campos na tabela invoices se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'period_start') THEN
        ALTER TABLE invoices ADD COLUMN period_start timestamp;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'period_end') THEN
        ALTER TABLE invoices ADD COLUMN period_end timestamp;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_intent') THEN
        ALTER TABLE invoices ADD COLUMN payment_intent text;
    END IF;

    -- Adiciona campos na tabela subscriptions se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_start') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_start timestamp;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_end timestamp;
    END IF;
END $$;

---- ROLLBACK ----
ALTER TABLE subscriptions DROP COLUMN IF EXISTS current_period_end;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS current_period_start;
ALTER TABLE invoices DROP COLUMN IF EXISTS payment_intent;
ALTER TABLE invoices DROP COLUMN IF EXISTS period_end;
ALTER TABLE invoices DROP COLUMN IF EXISTS period_start; 