-- Migration: add_webhook_user_association
-- Created at: 2024-02-20T12:00:00Z
-- Description: Adiciona colunas para associar webhooks a usuários
-- Impact: Requer migração de dados existentes
-- Decision: Optado por referência direta à tabela users para manter integridade referencial

-- Adicionar coluna user_id com foreign key
ALTER TABLE webhook_events 
ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Criar índice para otimizar queries
CREATE INDEX idx_webhook_events_user_id ON webhook_events(user_id);

-- Adicionar coluna para rastreamento
ALTER TABLE webhook_events
ADD COLUMN user_resolution_metadata jsonb;

-- Rollback
-- Em caso de problemas, reverter alterações
-- ALTER TABLE webhook_events DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE webhook_events DROP COLUMN IF EXISTS user_resolution_metadata;
-- DROP INDEX IF EXISTS idx_webhook_events_user_id;
