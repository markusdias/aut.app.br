import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { webhook_events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await Promise.resolve(params);

  try {
    console.log('🔍 Buscando detalhes do webhook:', { id });

    const event = await db
      .select()
      .from(webhook_events)
      .where(eq(webhook_events.id, id))
      .limit(1);

    if (!event.length) {
      console.log('⚠️ Webhook não encontrado:', { id });
      return NextResponse.json(
        { error: "Evento não encontrado" },
        { status: 404 }
      );
    }

    const webhookEvent = event[0];

    // Formata os dados para melhor visualização
    const formattedEvent = {
      // Informações básicas
      id: webhookEvent.id,
      event_id: webhookEvent.event_id,
      event_type: webhookEvent.event_type,
      provider: webhookEvent.provider,
      status: webhookEvent.status,
      
      // Datas
      created_time: webhookEvent.created_time,
      processed_time: webhookEvent.processed_time,
      last_retry_time: webhookEvent.last_retry_time,
      
      // Contadores e status
      retry_count: webhookEvent.retry_count,
      error: webhookEvent.error,
      
      // Dados detalhados
      payload: webhookEvent.raw_data,
      metadata: webhookEvent.metadata,

      // Informações de processamento
      processing: {
        attempts: webhookEvent.retry_count,
        last_attempt: webhookEvent.last_retry_time,
        error_details: webhookEvent.error,
        duration: webhookEvent.processed_time ? 
          new Date(webhookEvent.processed_time).getTime() - new Date(webhookEvent.created_time).getTime() : 
          null
      }
    };

    console.log('✅ Webhook encontrado e formatado:', {
      id,
      type: webhookEvent.event_type,
      status: webhookEvent.status
    });

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do webhook:', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do webhook" },
      { status: 500 }
    );
  }
} 