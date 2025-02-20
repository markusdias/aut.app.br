-- Migration: update_webhook_events_table
-- Created at: 2024-02-13T18:04:00Z
-- Description: Atualiza a estrutura da tabela webhook_events para incluir campos adicionais e melhorar performance
-- Impact: Requer migração de dados existentes
-- Decision: Optado por UUID para melhor distribuição e índice em event_id para otimização de queries

-- Backup dos dados existentes se a tabela existir
CREATE TABLE IF NOT EXISTS webhook_events_backup AS 
SELECT * FROM webhook_events WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'webhook_events'
);

-- Drop da tabela antiga se existir
DROP TABLE IF EXISTS webhook_events;

-- Criar nova tabela com schema atualizado
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    raw_data JSONB,
    error TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_time TIMESTAMP,
    created_time TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_time TIMESTAMP,
    metadata JSONB
);

-- Criar índice para melhor performance de queries
CREATE INDEX IF NOT EXISTS webhook_events_event_id_idx ON webhook_events(event_id);

-- Restaurar dados do backup se existir, mapeando os campos antigos para os novos
INSERT INTO webhook_events (
    event_id,
    event_type,
    provider,
    status,
    raw_data,
    error,
    retry_count,
    created_time,
    processed_time,
    metadata
)
SELECT 
    id::text as event_id,
    type as event_type,
    'legacy' as provider,
    status,
    details::jsonb as raw_data,
    NULL as error,
    0 as retry_count,
    created_at as created_time,
    CASE 
        WHEN processing_time > 0 THEN created_at + (processing_time || ' milliseconds')::interval
        ELSE NULL
    END as processed_time,
    jsonb_build_object(
        'migrated', true,
        'original_id', id,
        'original_type', type
    ) as metadata
FROM webhook_events_backup
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'webhook_events_backup'
);

-- Remover tabela de backup
DROP TABLE IF EXISTS webhook_events_backup;

---- ROLLBACK ----
DO $$
BEGIN
    -- Fazer backup dos dados antes do rollback
    CREATE TABLE IF NOT EXISTS webhook_events_rollback_backup AS 
    SELECT * FROM webhook_events;

    -- Remover tabela atual
    DROP TABLE IF EXISTS webhook_events;

    -- Restaurar dados do backup
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_events_rollback_backup') THEN
        CREATE TABLE webhook_events AS 
        SELECT * FROM webhook_events_rollback_backup;
        
        DROP TABLE webhook_events_rollback_backup;
    END IF;
END $$; 