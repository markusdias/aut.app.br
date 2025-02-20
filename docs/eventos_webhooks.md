# Eventos Webhook

Este documento detalha todos os eventos webhook que são atualmente tratados em nossa aplicação, incluindo suas funcionalidades e implementações.

## Estrutura de Eventos

Nossa aplicação utiliza uma estrutura unificada para tratamento de eventos através da tabela `webhook_events`:

```sql
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
```

## Provedores e Eventos

### 1. Stripe (Pagamentos)

#### Eventos de Produto
- `product.updated`: Atualização de informações do produto
- `product.deleted`: Remoção de produto

#### Eventos de Preço
- `price.updated`: Atualização de preço
- `price.deleted`: Remoção de preço

#### Eventos de Assinatura
- `customer.subscription.created`: Nova assinatura
- `customer.subscription.updated`: Atualização de assinatura
- `customer.subscription.deleted`: Cancelamento de assinatura

#### Eventos de Fatura
- `invoice.payment_succeeded`: Pagamento bem-sucedido
- `invoice.payment_failed`: Falha no pagamento

#### Eventos de Checkout
- `checkout.session.completed`: Conclusão de checkout

### 2. Clerk (Autenticação)

#### Eventos de Usuário
- `user.created`: Criação de novo usuário
- `user.updated`: Atualização de dados do usuário
- `user.deleted`: Remoção de usuário
- `user.banned`: Usuário banido
- `user.blocked`: Usuário bloqueado

#### Eventos de Sessão
- `session.created`: Nova sessão iniciada
- `session.ended`: Sessão encerrada
- `session.removed`: Sessão removida

### 3. Supabase (Banco de Dados)

#### Eventos de Dados
- `db.changes`: Alterações em tabelas monitoradas
- `db.sync`: Sincronização de dados
- `db.error`: Erros de banco de dados

## Processamento de Eventos

### Estados de Processamento
- `pending`: Evento recebido, aguardando processamento
- `processing`: Em processamento
- `completed`: Processado com sucesso
- `failed`: Falha no processamento
- `retrying`: Em processo de retry

### Sistema de Retry
- Retry automático para eventos falhos
- Backoff exponencial entre tentativas
- Máximo de 3 tentativas por evento
- Notificação em caso de falhas persistentes

## Monitoramento e Logging

### Campos Monitorados
- `event_id`: Identificador único do evento
- `event_type`: Tipo do evento
- `provider`: Provedor do evento
- `status`: Estado atual do processamento
- `retry_count`: Número de tentativas
- `error`: Detalhes de erro (se houver)
- `processed_time`: Tempo de processamento

### Metadados
- Informações adicionais específicas do evento
- Dados de rastreamento
- Contexto do processamento

## Implementação de Novos Eventos

Para adicionar suporte a novos eventos:

1. **Registro do Evento**
   ```typescript
   await db.insert(webhook_events).values({
     event_id: "evt_123",
     event_type: "new.event",
     provider: "new_provider",
     status: "pending",
     raw_data: eventData
   });
   ```

2. **Processamento**
   ```typescript
   async function processEvent(event: WebhookEvent) {
     try {
       // Lógica de processamento
       await markEventAsCompleted(event.id);
     } catch (error) {
       await handleEventError(event.id, error);
     }
   }
   ```

## Boas Práticas

1. **Validação de Eventos**
   - Verificar assinatura do webhook
   - Validar formato dos dados
   - Confirmar origem do evento

2. **Idempotência**
   - Verificar processamento duplicado
   - Manter registro de eventos processados
   - Usar identificadores únicos

3. **Tratamento de Erros**
   - Logging detalhado
   - Retry automático
   - Notificação de falhas

4. **Performance**
   - Processamento assíncrono
   - Timeout adequado
   - Monitoramento de tempo de resposta

## Monitoramento e Alertas

1. **Métricas Principais**
   - Taxa de sucesso/falha
   - Tempo de processamento
   - Volume de eventos
   - Taxa de retry

2. **Alertas**
   - Falhas consecutivas
   - Eventos pendentes
   - Erros críticos
   - Latência alta

## Manutenção

1. **Limpeza de Dados**
   - Arquivamento de eventos antigos
   - Limpeza de logs
   - Manutenção de índices

2. **Verificações Periódicas**
   - Consistência de dados
   - Performance de queries
   - Estado do sistema

## Segurança

1. **Proteção de Dados**
   - Criptografia de dados sensíveis
   - Validação de origem
   - Controle de acesso

2. **Auditoria**
   - Logging de acesso
   - Trilha de auditoria
   - Monitoramento de segurança 