import { db } from "@/db/drizzle";
import { webhook_events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WebhookUserResolutionService } from "../../../src/webhooks/services/user-resolution.service";
import { WebhookMetadata } from "../../../src/types/webhooks/stripe";
import { WebhookPayload, WebhookPayloadObject } from "../../../src/types/webhooks/payload";

// Feature flag para controle de logging
const ENABLE_WEBHOOK_LOGGING = process.env.ENABLE_WEBHOOK_LOGGING === 'true';

/**
 * Registra um evento de webhook no banco de dados
 * Não bloqueia o fluxo principal em caso de erro
 */
export async function logWebhookEvent(
  provider: 'stripe' | 'clerk',
  eventId: string,
  eventType: string,
  payload: WebhookPayloadObject,
  headers?: Record<string, string>
) {
  if (!ENABLE_WEBHOOK_LOGGING) return;

  console.log('📝 Iniciando registro de webhook:', {
    provider,
    eventId,
    eventType,
    hasHeaders: !!headers
  });

  const userResolutionService = new WebhookUserResolutionService();

  try {
    // Construir payload no formato correto
    const formattedPayload: WebhookPayload = {
      type: eventType,
      data: {
        object: payload
      }
    };

    // Resolver usuário
    const { userId, metadata: resolutionMetadata } = 
      await userResolutionService.resolveUserId(provider, formattedPayload);

    console.log('👤 Resolução de usuário:', {
      eventId,
      userId: userId || 'não encontrado',
      success: resolutionMetadata.success
    });

    const metadata: WebhookMetadata = {
      headers,
      received_at: new Date().toISOString(),
      debug_info: {
        initial_status: 'pending',
        feature_flag: ENABLE_WEBHOOK_LOGGING
      }
    };

    await db.insert(webhook_events).values({
      event_id: eventId,
      event_type: eventType,
      provider,
      status: 'pending',
      raw_data: payload,
      user_id: userId,
      metadata,
      user_resolution_metadata: resolutionMetadata
    });

    console.log('✅ Webhook registrado com sucesso:', { 
      eventId, 
      status: 'pending',
      userId: userId || 'não encontrado'
    });
  } catch (error) {
    console.error('❌ Falha ao registrar webhook:', {
      error,
      provider,
      eventId,
      eventType
    });
  }
}

/**
 * Atualiza o status de um evento de webhook
 * Não bloqueia o fluxo principal em caso de erro
 */
export async function updateWebhookStatus(
  eventId: string,
  status: 'processing' | 'completed' | 'failed',
  error?: string
) {
  if (!ENABLE_WEBHOOK_LOGGING) return;

  console.log('🔄 Atualizando status do webhook:', {
    eventId,
    newStatus: status,
    hasError: !!error,
    timestamp: new Date().toISOString()
  });

  try {
    // Primeiro, busca o status atual para logging
    const currentEvent = await db
      .select()
      .from(webhook_events)
      .where(eq(webhook_events.event_id, eventId))
      .limit(1);

    const currentStatus = currentEvent[0]?.status;
    const currentMetadata = currentEvent[0]?.metadata as WebhookMetadata;

    console.log('📊 Status atual do webhook:', {
      eventId,
      currentStatus,
      changingTo: status
    });

    // Prepara os metadados atualizados com base no status
    let updatedMetadata: WebhookMetadata = { ...currentMetadata };

    if (status === 'completed') {
      updatedMetadata = {
        ...updatedMetadata,
        completed_at: new Date().toISOString(),
        processing_duration: currentEvent[0]?.created_time 
          ? `${new Date().getTime() - new Date(currentEvent[0].created_time).getTime()}ms`
          : undefined
      };
    } else if (status === 'processing') {
      updatedMetadata = {
        ...updatedMetadata,
        processing_started_at: new Date().toISOString()
      };
    }

    if (error) {
      updatedMetadata = {
        ...updatedMetadata,
        last_error: error,
        error_time: new Date().toISOString()
      };
    }

    // Prepara os dados de atualização
    const updateData = {
      status,
      ...(status === 'completed' ? { processed_time: new Date() } : {}),
      ...(error ? { error } : {}),
      metadata: updatedMetadata
    };

    // Atualiza o status
    const result = await db
      .update(webhook_events)
      .set(updateData)
      .where(eq(webhook_events.event_id, eventId))
      .returning();

    console.log('✅ Status do webhook atualizado:', {
      eventId,
      oldStatus: currentStatus,
      newStatus: status,
      timestamp: new Date().toISOString(),
      success: !!result.length
    });

    // Se a atualização falhou (nenhuma linha atualizada)
    if (!result.length) {
      console.warn('⚠️ Webhook não encontrado ou não atualizado:', {
        eventId,
        attemptedStatus: status
      });
    }
  } catch (error) {
    console.error('❌ Falha ao atualizar status do webhook:', {
      eventId,
      attemptedStatus: status,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

/**
 * Verifica o status atual de um webhook
 * Útil para debugging
 */
export async function checkWebhookStatus(eventId: string) {
  if (!ENABLE_WEBHOOK_LOGGING) return null;

  try {
    const event = await db
      .select()
      .from(webhook_events)
      .where(eq(webhook_events.event_id, eventId))
      .limit(1);

    if (!event.length) {
      console.warn('⚠️ Webhook não encontrado:', { eventId });
      return null;
    }

    console.log('🔍 Status atual do webhook:', {
      eventId,
      status: event[0].status,
      created: event[0].created_time,
      processed: event[0].processed_time,
      metadata: event[0].metadata
    });

    return event[0];
  } catch (error) {
    console.error('❌ Erro ao verificar status do webhook:', {
      eventId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
} 