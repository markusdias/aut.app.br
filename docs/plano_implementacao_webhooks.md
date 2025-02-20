# Plano de Implementação - Registro de Webhooks

Este documento detalha o plano de implementação para adicionar registro de webhooks na tabela `webhook_events`, preservando toda a funcionalidade existente.

## 1. Análise do Código Existente

### Clerk Webhook (`app/api/auth/webhook/route.ts`)
- **Funcionalidades Existentes a Preservar:**
  - Verificação de assinatura SVIX
  - Handlers específicos para eventos de usuário
  - Integração com banco de dados (users, subscriptions)
  - Sistema de notificações
  - Cancelamento de assinaturas via Stripe

### Stripe Webhook (`app/api/payments/webhook/route.ts`)
- **Funcionalidades Existentes a Preservar:**
  - Verificação de assinatura Stripe
  - Gestão de produtos e preços
  - Sistema completo de assinaturas
  - Processamento de faturas
  - Checkout e migração de planos
  - Notificações

## 2. Implementação do Logger

### 2.1. Logger Middleware (`lib/webhooks/logger/webhook-logger.ts`)

```typescript
import { db } from "@/db/drizzle";

export async function logWebhookEvent(
  provider: 'stripe' | 'clerk',
  eventId: string,
  eventType: string,
  payload: unknown,
  headers?: Record<string, string>
) {
  try {
    await db.insert(webhook_events).values({
      event_id: eventId,
      event_type: eventType,
      provider,
      status: 'pending',
      raw_data: payload,
      metadata: {
        headers,
        received_at: new Date().toISOString()
      }
    });
  } catch (error) {
    // Apenas loga o erro, não interrompe o fluxo principal
    console.error('Falha ao registrar webhook:', error);
  }
}

export async function updateWebhookStatus(
  eventId: string,
  status: 'processing' | 'completed' | 'failed',
  error?: string
) {
  try {
    const updateData: any = {
      status,
      ...(status === 'completed' ? { processed_time: new Date() } : {}),
      ...(error ? { error } : {})
    };

    await db.update(webhook_events)
      .set(updateData)
      .where({ event_id: eventId });
  } catch (error) {
    // Apenas loga o erro, não interrompe o fluxo principal
    console.error('Falha ao atualizar status do webhook:', error);
  }
}
```

## 3. Modificações nos Endpoints

### 3.1. Clerk Webhook
```typescript
// app/api/auth/webhook/route.ts

export async function POST(req: Request) {
  try {
    // Código existente de verificação do webhook...
    const payload = await req.json();
    
    // Adicionar logging do evento (não bloqueia em caso de erro)
    await logWebhookEvent(
      'clerk',
      evt.data.id,
      eventType,
      payload,
      {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      }
    );

    // Atualizar status (não bloqueia em caso de erro)
    await updateWebhookStatus(evt.data.id, 'processing');

    // Manter todo o código existente de processamento...
    let response: Response;
    switch (eventType) {
      case "user.created":
        response = await handleUserCreated(payload);
        break;
      // ... outros casos
    }

    // Atualizar status após processamento (não bloqueia em caso de erro)
    await updateWebhookStatus(evt.data.id, 'completed');

    return response;
  } catch (error) {
    // Se houver ID do evento, registra a falha (não bloqueia)
    if (evt?.data?.id) {
      await updateWebhookStatus(evt.data.id, 'failed', error.message);
    }
    // Mantém o tratamento de erro existente
    console.error('❌ Error processing webhook:', error);
    return new Response("Error occured", { status: 500 });
  }
}
```

### 3.2. Stripe Webhook
```typescript
// app/api/payments/webhook/route.ts

export async function POST(req: Request) {
  try {
    // Código existente de verificação...
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Adicionar logging do evento (não bloqueia em caso de erro)
    await logWebhookEvent(
      'stripe',
      event.id,
      event.type,
      event.data.object,
      { 'stripe-signature': signature }
    );

    // Atualizar status (não bloqueia em caso de erro)
    await updateWebhookStatus(event.id, 'processing');

    // Manter todo o código existente de processamento...
    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "product.updated":
            // ... código existente
          // ... outros casos
        }
      } catch (error) {
        // Se houver erro no processamento, registra (não bloqueia)
        await updateWebhookStatus(event.id, 'failed', error.message);
        throw error;
      }
    }

    // Atualizar status após processamento (não bloqueia em caso de erro)
    await updateWebhookStatus(event.id, 'completed');

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook failed.", error);
    return new NextResponse("Webhook failed", { status: 500 });
  }
}
```

## 4. Feature Flags e Controles

### 4.1. Configuração
```typescript
// lib/config.ts
export const ENABLE_WEBHOOK_LOGGING = process.env.ENABLE_WEBHOOK_LOGGING === 'true';

// Uso no logger
export async function logWebhookEvent(...) {
  if (!ENABLE_WEBHOOK_LOGGING) return;
  // ... resto do código
}
```

### 4.2. Rollback
Em caso de problemas:
1. Desativar `ENABLE_WEBHOOK_LOGGING`
2. Verificar logs de erro
3. Corrigir sem afetar funcionalidade principal

## 5. Pontos Críticos para Teste pela Equipe

> Nota: Esta seção é apenas um guia para a equipe implementar os testes adequadamente.

### 5.1. Funcionalidades Críticas
- Preservação de todas as funcionalidades existentes
- Funcionamento do feature flag
- Integridade dos dados registrados
- Performance e não-bloqueio
- Tratamento de erros

### 5.2. Cenários Importantes
1. **Clerk**
   - Fluxos de autenticação
   - Gestão de usuários
   - Integrações dependentes

2. **Stripe**
   - Fluxos de pagamento
   - Gestão de assinaturas
   - Processamento de faturas

## 6. Estratégia de Deploy

### 6.1. Fase 1: Implementação Base
- Deploy do logger
- Feature flag desativado
- Monitoramento ativo

### 6.2. Fase 2: Ativação Gradual
- Ativação para 5% dos requests
- Monitoramento de métricas
- Verificação de impacto

### 6.3. Fase 3: Expansão
- Aumento gradual da cobertura
- Monitoramento contínuo
- Ajustes conforme necessário

## 7. Monitoramento

### 7.1. Métricas Principais
- Taxa de sucesso/falha do logging
- Impacto na performance dos webhooks
- Volume de eventos registrados
- Erros no processamento

### 7.2. Alertas
- Falhas consecutivas no logging
- Degradação de performance
- Erros críticos no processamento
- Inconsistências nos dados 