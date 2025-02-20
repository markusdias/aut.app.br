# Plano de Implantação - Migrações e Features de Sincronização Stripe

## 1. Análise da Situação Atual

### 1.1 Estrutura Existente
- Projeto já possui estrutura de migrações em `/db/migrations/`
- Utiliza Drizzle ORM para gerenciamento do banco
- Possui integração com Stripe (`@stripe/stripe-js`)
- Já possui tabelas base necessárias:
  - `users`
  - `subscriptions`
  - `subscriptions_plans`
  - `invoices`
- Interface admin existente em `/dashboard/settings` com:
  - Gerenciamento de planos
  - Histórico de pagamentos
  - Configurações de usuário

### 1.2 Migrações Existentes
- Já possui 11 migrações implementadas
- Última migração: `0011_add_unique_constraints.sql`
- Sistema de migrações documentado em `MIGRATIONS.md`

## 2. Implementação

### 2.1 Features Necessárias

#### 2.1.1 Sincronização de Planos
**Localização:** `src/features/subscription/`
**Arquivos Necessários:**
```
src/features/subscription/
├── services/
│   ├── stripe-sync.service.ts    # Serviço de sincronização
│   └── stripe-webhook.service.ts # Processamento de webhooks
├── types/
│   └── stripe.types.ts           # Tipos relacionados ao Stripe
├── utils/
│   └── stripe-helpers.ts         # Funções auxiliares
└── hooks/
    └── use-stripe-sync.ts        # Hook para sincronização
```

#### 2.1.2 Gerenciamento de Cache
**Localização:** `src/cache/`
**Arquivos Necessários:**
```
src/cache/
├── providers/
│   └── redis.ts                  # Provider Redis
└── strategies/
    └── stripe-cache.ts           # Estratégia de cache Stripe
```

### 2.2 Arquivos a Editar

#### 2.2.1 Modificações Necessárias
1. `app/api/payments/webhook/route.ts`
   - Adicionar validação de rate limiting
   - Implementar logging melhorado
   - Adicionar tratamento de retry
   - Integrar com cache Redis

2. `app/api/plans/route.ts`
   - Integrar com cache Redis
   - Adicionar endpoint de sincronização manual
   - Implementar controle de última sincronização
   - Adicionar controle de sincronização automática

3. `utils/data/plans/getSubscriptionPlans.ts`
   - Adicionar suporte a cache
   - Implementar verificação de última sincronização

4. `scripts/db-manager.ts`
   - Adicionar suporte a sincronização programada
   - Implementar logs detalhados
   - Adicionar retry com backoff exponencial

5. `app/(pages)/dashboard/settings/page.tsx`
   - Adicionar toggle para sincronização automática
   - Integrar com novo endpoint de controle

### 2.3 Configurações

#### 2.3.1 Variáveis de Ambiente
```env
# Intervalo entre sincronizações automáticas (segundos)
STRIPE_SYNC_INTERVAL=21600        # Default: 6 horas

# Configurações de retry
STRIPE_SYNC_MAX_RETRIES=3        # Default: 3 tentativas
STRIPE_SYNC_RETRY_DELAY=300      # Default: 5 minutos

# Rate limiting e Cache
STRIPE_WEBHOOK_RATE_LIMIT=100    # Requisições/minuto
STRIPE_CACHE_TTL=3600           # TTL: 1 hora

# Controle de Sincronização
STRIPE_AUTO_SYNC_ENABLED=true   # Habilita/desabilita sincronização automática
```

#### 2.3.2 Configurações de Segurança

##### Stripe Dashboard
1. **Webhook Endpoints**
   - Configurar: `${FRONTEND_URL}/api/payments/webhook`
   - Eventos: `customer.subscription.*`, `invoice.*`, `product.*`, `price.*`
   - Ativar assinatura e copiar signing secret

2. **Restrições de API**
   - Configurar restrições de IP
   - Habilitar logs detalhados
   - Configurar alertas

##### Redis (Upstash)
- Configurar TLS obrigatório
- Definir política de retenção
- Configurar limites por IP

## 3. Ordem de Implementação

1. **Fase 1: Infraestrutura e Segurança**
   - Configurar variáveis de ambiente e segurança
   - Implementar rate limiting
   - Configurar Redis e cache
   - Adicionar controle de sincronização automática

2. **Fase 2: Core Features**
   - Implementar sincronização
   - Configurar webhooks
   - Implementar retry system

3. **Fase 3: UI e Monitoramento**
   - Melhorar interface admin existente com novo toggle
   - Configurar logs e métricas

4. **Fase 4: Documentação e Testes**
   - Documentação técnica e operacional
   - Testes unitários e de integração

## 4. Monitoramento

### 4.1 Métricas Principais
- Taxa de sucesso de sincronização
- Tempo de resposta dos webhooks
- Hit rate do cache
- Erros de sincronização
- Status da sincronização automática

### 4.2 Logs Necessários
- Tentativas de sincronização
- Webhooks recebidos
- Erros de processamento
- Alterações de plano
- Mudanças no status da sincronização automática

## 5. Critérios de Aceitação

### 5.1 Requisitos
- Sincronização automática funcionando
- Controle manual de sincronização operacional
- Cache operacional
- Logs adequados
- Toggle de sincronização funcionando

### 5.2 Métricas
- Tempo de resposta < 1s
- Disponibilidade > 99.9%
- Taxa de erro < 0.1%
- Cache hit rate > 90%

## 6. Plano de Rollback

### 6.1 Procedimentos
1. Desativar sincronização automática
2. Reverter para dados locais
3. Manter webhooks em fila
4. Desativar cache se necessário 