import { userCreate } from "@/utils/data/user/userCreate";
import { userUpdate } from "@/utils/data/user/userUpdate";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/db/drizzle";
import { users, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { sendAccountBlockedNotification } from '@/utils/notifications/sendNotifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Extende o tipo WebhookEvent para incluir os eventos adicionais
type ExtendedWebhookEvent = WebhookEvent & {
  type: WebhookEvent["type"] | "user.banned" | "user.blocked";
};

export async function POST(req: Request) {
  try {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    console.log('📨 Webhook received');

    if (!WEBHOOK_SECRET) {
      console.error('❌ CLERK_WEBHOOK_SECRET not found in environment');
      throw new Error(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
      );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing Svix headers:', { svix_id, svix_timestamp, svix_signature });
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const payload = await req.json();
    console.log('📦 Webhook payload received:', {
      type: payload.type,
      userId: payload?.data?.id,
      email: payload?.data?.email_addresses?.[0]?.email_address
    });
    
    const body = JSON.stringify(payload);

    // Create a new SVIX instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
      console.log('✅ Webhook signature verified');
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return new Response("Error occured", {
        status: 400,
      });
    }

    // Get the ID and type
    const { id } = evt.data;
    // TODO: Remover any quando o Clerk adicionar os tipos user.banned e user.blocked
    const eventType = (evt as any).type;

    console.log('🎯 Processing webhook event:', { type: eventType, userId: id });

    let response: Response;

    switch (eventType) {
      case "user.created":
        response = await handleUserCreated(payload);
        break;
      case "user.updated":
        response = await handleUserUpdated(payload);
        break;
      case "user.deleted":
        response = await handleUserDeleted(payload);
        break;
      default:
        console.warn('⚠️ Unhandled event type:', eventType);
        response = new Response("Error occured -- unhandeled event type", {
          status: 400,
        });
    }

    return response;
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return new Response("Error occured", {
      status: 500,
    });
  }
}

// Handler functions
async function handleUserCreated(payload: any): Promise<Response> {
  try {
    const email = payload?.data?.email_addresses?.[0]?.email_address;
    const userId = payload?.data?.id;

    // Log para debugging
    console.log('👤 User creation event received:', {
      email,
      userId,
      firstName: payload?.data?.first_name,
      lastName: payload?.data?.last_name
    });

    if (!email || !userId) {
      console.error('❌ Missing required fields in user.created event');
      return NextResponse.json({
        status: 400,
        message: "Missing required fields"
      });
    }

    // Primeiro busca por email
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('🔄 Updating existing user with new Clerk ID:', {
        email,
        oldUserId: existingUser[0].userId,
        newUserId: userId
      });

      // Atualiza o usuário existente com o novo userId
      await db
        .update(users)
        .set({
          userId: userId,
          firstName: payload?.data?.first_name || existingUser[0].firstName,
          lastName: payload?.data?.last_name || existingUser[0].lastName,
          profileImageUrl: payload?.data?.profile_image_url || existingUser[0].profileImageUrl,
          status: existingUser[0].status || 'active'
        })
        .where(eq(users.email, email));

      // Atualiza também todas as assinaturas relacionadas com o novo userId
      await db
        .update(subscriptions)
        .set({
          userId: userId
        })
        .where(eq(subscriptions.email, email));

      return NextResponse.json({
        status: 200,
        message: "User info and subscriptions updated with new Clerk ID"
      });
    }

    // Se não encontrou, cria novo usuário
    console.log('📝 Creating new user:', { email, userId });
    await userCreate({
      email,
      first_name: payload?.data?.first_name,
      last_name: payload?.data?.last_name,
      profile_image_url: payload?.data?.profile_image_url,
      user_id: userId,
    });

    return NextResponse.json({
      status: 200,
      message: "User info inserted"
    });
  } catch (error: any) {
    console.error('❌ Error processing user.created webhook:', error);
    return NextResponse.json({
      status: 400,
      message: error.message
    });
  }
}

async function handleUserUpdated(payload: any): Promise<Response> {
  try {
    const userId = payload?.data?.id;
    const email = payload?.data?.email_addresses?.[0]?.email_address;
    const isLocked = payload?.data?.locked === true;
    const isBanned = payload?.data?.banned === true;
    
    // Log detalhado para debugging
    console.log('👤 User update event received:', {
      userId,
      email,
      isLocked,
      isBanned,
      lockoutExpiresIn: payload?.data?.lockout_expires_in_seconds,
      timestamp: new Date().toISOString()
    });

    // Primeiro atualiza os dados básicos do usuário
    await userUpdate({
      email: email,
      first_name: payload?.data?.first_name,
      last_name: payload?.data?.last_name,
      profile_image_url: payload?.data?.profile_image_url,
      user_id: userId,
    });

    // Se o usuário foi bloqueado ou banido
    if (isLocked || isBanned) {
      const status = isLocked ? "blocked" : "banned";
      await handleUserStatusChange(userId, status);

      // Envia notificação
      await sendAccountBlockedNotification({
        userId,
        email,
        isBanned: status === "banned",
        reason: payload?.data?.public_metadata?.block_reason
      });

      return NextResponse.json({
        status: 200,
        message: `User ${status} and subscriptions cancelled`
      });
    }

    // Se o usuário foi desbloqueado
    if (payload?.data?.locked === false && payload?.data?.banned === false) {
      await handleUserUnblock(userId);
      return NextResponse.json({
        status: 200,
        message: "User unblocked and status restored to active"
      });
    }

    return NextResponse.json({
      status: 200,
      message: "User info updated"
    });
  } catch (error: any) {
    console.error('❌ Error processing user.updated webhook:', error);
    return NextResponse.json({
      status: 400,
      message: error.message
    });
  }
}

async function handleUserDeleted(payload: any): Promise<Response> {
  try {
    const { id: userId, deleted } = payload.data;
    const timestamp = new Date(payload.timestamp);
    
    console.log('🗑️ User deletion event received:', {
      userId,
      deleted,
      timestamp,
      requestInfo: payload.event_attributes?.http_request
    });

    if (!deleted) {
      console.warn('⚠️ Received user.deleted event but deleted flag is false');
      return NextResponse.json({
        status: 400,
        message: "Invalid delete event - deleted flag is false"
      });
    }

    await handleUserStatusChange(userId, "deleted", timestamp);

    return NextResponse.json({
      status: 200,
      message: "User marked as deleted and subscriptions cancelled",
      timestamp: timestamp.toISOString()
    });
  } catch (error: any) {
    console.error('❌ Error processing user.deleted webhook:', error);
    return NextResponse.json({
      status: 500,
      message: error.message
    });
  }
}

// Helper functions
async function handleUserStatusChange(userId: string, status: "blocked" | "banned" | "deleted", timestamp?: Date) {
  // Atualiza o status do usuário
  await db
    .update(users)
    .set({ 
      status,
      subscription: null,
      ...(timestamp && { deletedAt: timestamp })
    })
    .where(eq(users.userId, userId));

  // Busca assinaturas ativas do usuário
  const activeSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    );

  // Cancela todas as assinaturas ativas
  for (const subscription of activeSubscriptions) {
    if (subscription.subscriptionId) {
      try {
        // Cancela no Stripe
        await stripe.subscriptions.cancel(subscription.subscriptionId);
        
        // Atualiza no banco
        await db
          .update(subscriptions)
          .set({
            status: "cancelled",
            canceledAt: timestamp || new Date()
          })
          .where(eq(subscriptions.subscriptionId, subscription.subscriptionId));

        console.log(`✅ Subscription ${subscription.subscriptionId} cancelled for ${status} user ${userId}`);
      } catch (error) {
        console.error(`❌ Error canceling subscription ${subscription.subscriptionId} for ${status} user:`, error);
      }
    }
  }
}

async function handleUserUnblock(userId: string) {
  // Verifica o status atual do usuário
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  // Se o usuário estava bloqueado ou banido, atualiza para active
  if (currentUser[0]?.status === "blocked" || currentUser[0]?.status === "banned") {
    await db
      .update(users)
      .set({ 
        status: "active" as const
        // Não restauramos a assinatura automaticamente
        // O usuário precisará assinar novamente
      })
      .where(eq(users.userId, userId));
  }
}
