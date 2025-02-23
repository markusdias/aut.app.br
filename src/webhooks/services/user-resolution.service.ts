import { db } from "@/db/drizzle";
import { users, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Interfaces para os payloads
interface ClerkWebhookPayload {
  type: string;
  data?: {
    id?: string;
    user_id?: string;
  };
}

interface StripeWebhookPayload {
  type: string;
  data?: {
    object?: {
      metadata?: {
        userId?: string;
      };
      customer_details?: {
        email?: string;
      };
      customer_email?: string;
      email?: string;
      subscription?: string;
      object?: string;
    };
  };
}

type WebhookPayload = ClerkWebhookPayload | StripeWebhookPayload;

interface ResolutionMetadata {
  resolution_start: string;
  resolution_end?: string;
  resolution_time_ms?: number;
  provider: string;
  success?: boolean;
  error?: string;
  attempts: Array<{
    type: 'clerk_direct' | 'stripe_session_metadata' | 'stripe_customer_email' | 'stripe_subscription';
    identifier: string;
    timestamp: string;
  }>;
}

export class WebhookUserResolutionService {
  async resolveUserId(provider: string, payload: WebhookPayload): Promise<{
    userId: number | null;
    metadata: ResolutionMetadata;
  }> {
    const startTime = Date.now();
    let userId: number | null = null;
    const metadata: ResolutionMetadata = {
      resolution_start: new Date(startTime).toISOString(),
      provider,
      attempts: []
    };

    console.log('🔍 Iniciando resolução de usuário:', {
      provider,
      payloadType: payload?.type,
      hasData: !!payload?.data,
      hasObject: payload?.data && 'object' in payload.data && !!payload.data.object
    });

    try {
      switch (provider) {
        case 'clerk':
          userId = await this.resolveClerkUserId(payload as ClerkWebhookPayload, metadata);
          break;
        case 'stripe':
          userId = await this.resolveStripeUserId(payload as StripeWebhookPayload, metadata);
          break;
      }

      metadata.resolution_end = new Date().toISOString();
      metadata.resolution_time_ms = Date.now() - startTime;
      metadata.success = userId !== null;

      console.log('✅ Resolução finalizada:', {
        success: metadata.success,
        userId,
        timeMs: metadata.resolution_time_ms,
        attempts: metadata.attempts.length
      });

      return { userId, metadata };
    } catch (error) {
      console.error('❌ Erro na resolução:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      metadata.error = error instanceof Error ? error.message : 'Unknown error';
      metadata.resolution_end = new Date().toISOString();
      metadata.resolution_time_ms = Date.now() - startTime;
      metadata.success = false;

      return { userId: null, metadata };
    }
  }

  private async resolveClerkUserId(payload: ClerkWebhookPayload, metadata: ResolutionMetadata): Promise<number | null> {
    const clerkId = payload.data?.id || payload.data?.user_id;
    console.log('👤 Tentando resolver Clerk ID:', { clerkId });

    metadata.attempts.push({
      type: 'clerk_direct',
      identifier: clerkId || '',
      timestamp: new Date().toISOString()
    });

    if (!clerkId) {
      console.log('⚠️ Clerk ID não encontrado no payload');
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, clerkId))
      .limit(1);

    console.log('🔍 Resultado busca Clerk:', {
      clerkId,
      encontrado: !!user[0],
      userId: user[0]?.id
    });

    return user[0]?.id || null;
  }

  private async resolveStripeUserId(payload: StripeWebhookPayload, metadata: ResolutionMetadata): Promise<number | null> {
    console.log('💳 Iniciando resolução Stripe:', {
      payloadType: payload?.type,
      hasMetadata: !!payload?.data?.object?.metadata,
      objectType: payload?.data?.object?.object,
      rawPayload: JSON.stringify(payload).slice(0, 200) + '...'
    });

    // 1. Primeiro tentar pelo userId no metadata do session/checkout
    const sessionMetadata = payload?.data?.object?.metadata;
    if (sessionMetadata?.userId) {
        console.log('🔍 Tentando resolver por metadata.userId:', sessionMetadata.userId);
        
        metadata.attempts.push({
            type: 'stripe_session_metadata',
            identifier: sessionMetadata.userId,
            timestamp: new Date().toISOString()
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.userId, sessionMetadata.userId))
            .limit(1);

        if (user[0]) {
            console.log('✅ Usuário encontrado por metadata.userId:', {
                clerkId: sessionMetadata.userId,
                dbId: user[0].id
            });
            return user[0].id;
        }
    }

    // 2. Tentar pelo customer_details.email
    const customerEmail = payload?.data?.object?.customer_details?.email || 
                        payload?.data?.object?.customer_email ||
                        payload?.data?.object?.email;
    if (customerEmail) {
        console.log('🔍 Tentando resolver por email:', customerEmail);
        
        metadata.attempts.push({
            type: 'stripe_customer_email',
            identifier: customerEmail,
            timestamp: new Date().toISOString()
        });

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, customerEmail))
            .limit(1);

        if (user[0]) {
            console.log('✅ Usuário encontrado por email:', {
                email: customerEmail,
                dbId: user[0].id
            });
            return user[0].id;
        }
    }

    // 3. Tentar pela subscription
    const subscriptionId = payload?.data?.object?.subscription;
    if (subscriptionId) {
        console.log('🔍 Tentando resolver por subscription:', subscriptionId);
        
        metadata.attempts.push({
            type: 'stripe_subscription',
            identifier: subscriptionId,
            timestamp: new Date().toISOString()
        });

        const subscription = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscriptionId))
            .limit(1);

        if (subscription[0]?.userId) {
            const user = await db
                .select()
                .from(users)
                .where(eq(users.userId, subscription[0].userId))
                .limit(1);

            if (user[0]) {
                console.log('✅ Usuário encontrado por subscription:', {
                    subscriptionId,
                    userId: subscription[0].userId,
                    dbId: user[0].id
                });
                return user[0].id;
            }
        }
    }

    console.log('⚠️ Nenhum método de resolução teve sucesso');
    return null;
  }
} 