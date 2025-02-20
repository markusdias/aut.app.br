import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { webhook_events, users } from "@/db/schema";
import { desc, sql, and, eq, like, between, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const provider = searchParams.get("provider");
    const status = searchParams.get("status");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const offset = (page - 1) * limit;

    // Debug: Log dos parâmetros recebidos
    console.log('📥 Parâmetros recebidos:', {
      page,
      limit,
      search,
      provider,
      status,
      startDate,
      endDate,
      offset,
      url: request.url
    });

    // Construir condições de filtro
    let conditions = [];

    if (search) {
      conditions.push(like(webhook_events.event_type, `%${search}%`));
      console.log('🔍 Adicionado filtro de busca:', search);
    }

    if (provider) {
      conditions.push(eq(webhook_events.provider, provider));
      console.log('🏢 Adicionado filtro de provider:', provider);
    }

    if (status) {
      conditions.push(eq(webhook_events.status, status));
      console.log('📊 Adicionado filtro de status:', status);
    }

    // Ajuste na lógica de datas para considerar o dia completo
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      conditions.push(gte(webhook_events.created_time, start));
      console.log('📅 Adicionado filtro de data inicial:', start.toISOString());
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(webhook_events.created_time, end));
      console.log('📅 Adicionado filtro de data final:', end.toISOString());
    }

    console.log('🔍 Total de condições:', conditions.length);

    // Busca os eventos com paginação, filtros e JOIN com users
    const events = await db
      .select({
        id: webhook_events.id,
        event_id: webhook_events.event_id,
        event_type: webhook_events.event_type,
        provider: webhook_events.provider,
        status: webhook_events.status,
        raw_data: webhook_events.raw_data,
        error: webhook_events.error,
        retry_count: webhook_events.retry_count,
        last_retry_time: webhook_events.last_retry_time,
        created_time: webhook_events.created_time,
        processed_time: webhook_events.processed_time,
        metadata: webhook_events.metadata,
        user_id: webhook_events.user_id,
        user_resolution_metadata: webhook_events.user_resolution_metadata,
        user_email: users.email,
        user_name: sql<string>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), '')`
      })
      .from(webhook_events)
      .leftJoin(users, eq(webhook_events.user_id, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(webhook_events.created_time))
      .limit(limit)
      .offset(offset);

    // Debug: Log detalhado dos eventos
    console.log('🔍 Detalhes dos eventos:', events.map(event => ({
      id: event.id,
      user_id: event.user_id,
      user_email: event.user_email,
      user_name: event.user_name,
      raw_data_excerpt: event.raw_data ? JSON.stringify(event.raw_data).slice(0, 100) + '...' : null
    })));

    // Conta total de registros com os mesmos filtros
    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(webhook_events)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Debug: Log do resultado
    console.log('📦 Resultado da query:', {
      totalRegistros: total[0].count,
      registrosRetornados: events.length,
      pagina: page,
      filtrosAplicados: conditions.length
    });

    return NextResponse.json({
      events,
      pagination: {
        total: total[0].count,
        page,
        limit,
        totalPages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar logs de webhooks:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Erro ao buscar logs de webhooks" },
      { status: 500 }
    );
  }
} 