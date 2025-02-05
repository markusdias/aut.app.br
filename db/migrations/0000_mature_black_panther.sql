-- Migration: initial_schema
-- Created at: 2024-02-02T13:41:54.133Z
-- Description: Cria as tabelas iniciais do sistema: invoices, subscriptions_plans, subscriptions e users

DO $$ 
BEGIN 
    -- Criar tabela invoices se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        CREATE TABLE "invoices" (
            "id" serial PRIMARY KEY NOT NULL,
            "created_time" timestamp DEFAULT now(),
            "invoice_id" text,
            "subscription_id" text,
            "amount_paid" text,
            "amount_due" text,
            "currency" text,
            "status" text,
            "email" text,
            "user_id" text
        );
    END IF;
--> statement-breakpoint

    -- Criar tabela subscriptions_plans se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions_plans') THEN
        CREATE TABLE "subscriptions_plans" (
            "id" serial PRIMARY KEY NOT NULL,
            "created_time" timestamp DEFAULT now(),
            "plan_id" text,
            "name" text,
            "description" text,
            "amount" text,
            "currency" text,
            "interval" text,
            "active" boolean DEFAULT true,
            "metadata" jsonb,
            CONSTRAINT "subscriptions_plans_plan_id_unique" UNIQUE("plan_id")
        );
    END IF;
--> statement-breakpoint

    -- Criar tabela subscriptions se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        CREATE TABLE "subscriptions" (
            "id" serial PRIMARY KEY NOT NULL,
            "created_time" timestamp DEFAULT now(),
            "subscription_id" text,
            "stripe_user_id" text,
            "status" text,
            "start_date" text,
            "end_date" text,
            "plan_id" text,
            "default_payment_method_id" text,
            "email" text,
            "user_id" text
        );
    END IF;
--> statement-breakpoint

    -- Criar tabela users se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE "users" (
            "id" serial PRIMARY KEY NOT NULL,
            "created_time" timestamp DEFAULT now(),
            "email" text,
            "first_name" text,
            "last_name" text,
            "gender" text,
            "profile_image_url" text,
            "user_id" text,
            "subscription" text,
            "credits" text,
            CONSTRAINT "users_email_unique" UNIQUE("email"),
            CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
        );
    END IF;
END $$;

---- ROLLBACK ----
DROP TABLE IF EXISTS "invoices";
DROP TABLE IF EXISTS "subscriptions";
DROP TABLE IF EXISTS "subscriptions_plans";
DROP TABLE IF EXISTS "users";
