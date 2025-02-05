import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { subscriptions, users, subscriptionPlans, invoices } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  sendSubscriptionCancelledNotification,
  sendPaymentFailedNotification,
  sendPlanChangedNotification
} from '@/utils/notifications/sendNotifications';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type CheckoutMetadata = {
  userId: string;
  email: string;
  subscription: string;
  isUpgrade?: string;
};

type SubscriptionData = {
  subscriptionId: string;
  userId: string | undefined;
  email: string | undefined;
  status: string | undefined;
  stripeUserId: string | undefined;
  planId: string | undefined;
  currentPeriodStart: Date | undefined;
  currentPeriodEnd: Date | undefined;
  defaultPaymentMethodId: string | undefined;
  startDate: string | undefined;
  createdTime: Date;
  previousPlanId: string | undefined;
  planChangedAt: Date | undefined;
  canceledAt: Date | undefined;
};

type InvoiceData = {
  invoiceId: string;
  subscriptionId: string | undefined;
  amountPaid: string | undefined;
  amountDue: string | undefined;
  currency: string | undefined;
  status: string | undefined;
  userId: string | undefined;
  email: string | undefined;
  periodStart: Date | undefined;
  periodEnd: Date | undefined;
  paymentIntent: string | undefined;
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed.", err);
      return new NextResponse("Webhook error", { status: 400 });
    }

    const relevantEvents = new Set([
      "product.updated",
      "product.deleted",
      "price.updated",
      "price.deleted",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "checkout.session.completed",
    ]);

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case "product.updated": {
            try {
              const product = event.data.object as Stripe.Product;
              console.log("🔄 Webhook product.updated recebido:", {
                productId: product.id,
                productMetadata: product.metadata
              });
              
              // Busca todos os preços associados a este produto
              const prices = await stripe.prices.list({
                product: product.id,
                active: true,
              });

              console.log("📦 Preços encontrados:", prices.data.length);

              // Atualiza ou cria os planos para cada preço
              for (const price of prices.data) {
                const existingPlan = await db
                  .select()
                  .from(subscriptionPlans)
                  .where(eq(subscriptionPlans.planId, price.id))
                  .limit(1);

                console.log("🔍 Plano no banco:", existingPlan[0] || "Não encontrado");

                if (existingPlan.length === 0) {
                  // Plano não existe, vamos criar
                  console.log("📝 Criando novo plano para:", price.id);
                  const insertResult = await db
                    .insert(subscriptionPlans)
                    .values({
                      planId: price.id,
                      active: product.active && price.active,
                      name: product.name,
                      description: product.description || "",
                      amount: String(price.unit_amount! / 100),
                      currency: price.currency,
                      interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
                      metadata: Object.keys(product.metadata).length > 0 ? product.metadata : null
                    })
                    .returning();

                  console.log("✅ Plano criado:", {
                    planoCriado: insertResult[0],
                    metadatosInseridos: insertResult[0]?.metadata
                  });
                } else {
                  // Plano existe, vamos atualizar
                  const updateResult = await db
                    .update(subscriptionPlans)
                    .set({
                      active: product.active && price.active,
                      name: product.name,
                      description: product.description || "",
                      metadata: Object.keys(product.metadata).length > 0 ? product.metadata : null
                    })
                    .where(eq(subscriptionPlans.planId, price.id))
                    .returning();

                  console.log("✅ Plano atualizado:", {
                    planoAtualizado: updateResult[0],
                    metadatosAtualizados: updateResult[0]?.metadata
                  });
                }
              }
              
              return NextResponse.json({
                received: true,
                message: "Product updated successfully"
              });
            } catch (error) {
              console.error("❌ Erro ao processar product.updated:", error);
              throw error;
            }
          }

          case "product.deleted": {
            const product = event.data.object as Stripe.Product;
            
            // Busca todos os preços associados a este produto
            const prices = await stripe.prices.list({
              product: product.id,
              active: true,
            });

            // Marca como inativo todos os planos relacionados
            for (const price of prices.data) {
              await db
                .update(subscriptionPlans)
                .set({ active: false })
                .where(eq(subscriptionPlans.planId, price.id));
            }
            break;
          }

          case "price.updated": {
            try {
              const price = event.data.object as Stripe.Price;
              console.log("🔄 Webhook price.updated recebido:", {
                priceId: price.id,
                productId: price.product,
                priceMetadata: price.metadata
              });
              
              // Busca o produto relacionado
              const product = await stripe.products.retrieve(price.product as string);
              console.log("📦 Produto encontrado:", {
                name: product.name,
                id: product.id,
                metadata: product.metadata,
                hasMetadata: Object.keys(product.metadata).length > 0
              });

              // Verifica se o plano existe antes de atualizar
              const existingPlan = await db
                .select()
                .from(subscriptionPlans)
                .where(eq(subscriptionPlans.planId, price.id))
                .limit(1);

              console.log("🔍 Plano no banco:", existingPlan[0] || "Não encontrado");

              const updateResult = await db
                .update(subscriptionPlans)
                .set({
                  active: product.active && price.active,
                  amount: String(price.unit_amount! / 100),
                  currency: price.currency,
                  interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
                  name: product.name,
                  description: product.description || "",
                  metadata: Object.keys(price.metadata).length > 0 ? price.metadata : null
                })
                .where(eq(subscriptionPlans.planId, price.id))
                .returning();

              console.log("✅ Resultado da atualização:", {
                planoAtualizado: updateResult[0],
                metadatosAtualizados: updateResult[0]?.metadata
              });

              return NextResponse.json({
                received: true,
                updated: updateResult[0]
              });
            } catch (error) {
              console.error("❌ Erro ao processar price.updated:", error);
              throw error;
            }
          }

          case "price.deleted": {
            const price = event.data.object as Stripe.Price;
            
            await db
              .update(subscriptionPlans)
              .set({ active: false })
              .where(eq(subscriptionPlans.planId, price.id));
            break;
          }

          case "customer.subscription.created":
            return handleSubscriptionEvent(event, "created");
          case "customer.subscription.updated":
            return handleSubscriptionEvent(event, "updated");
          case "customer.subscription.deleted":
            return handleSubscriptionEvent(event, "deleted");
          case "invoice.payment_succeeded":
            return handleInvoiceEvent(event, "succeeded");
          case "invoice.payment_failed":
            return handleInvoiceEvent(event, "failed");
          case "checkout.session.completed":
            return handleCheckoutSessionCompleted(event);
          default:
            console.log(`⚠️ Unhandled event type: ${event.type}`);
            return NextResponse.json({
              received: true,
              message: `Unhandled event type: ${event.type}`,
            });
        }

        return NextResponse.json({ received: true });
      } catch (error) {
        console.error("❌ Webhook handler failed.", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook failed.", error);
    return new NextResponse("Webhook failed", { status: 500 });
  }
}

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return (customer as Stripe.Customer).email;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

type SubscriptionEventData = {
  previous_attributes?: {
    items?: {
      data: Array<{ price: { id: string } }>;
    };
  };
  object: Stripe.Subscription & {
    items: {
      data: Array<{ price: { id: string } }>;
    };
  };
};

// Helper function to safely get price ID from subscription items
function getPriceIdFromSubscription(subscription: Stripe.Subscription): string | undefined {
  return subscription.items?.data?.[0]?.price?.id ?? undefined;
}

async function handleSubscriptionEvent(
  event: Stripe.Event,
  type: "created" | "updated" | "deleted"
) {
  const subscription = (event.data as any).object as Stripe.Subscription;
  const customerEmail = await getCustomerEmail(subscription.customer as string);

  console.log('📝 Subscription event details:', {
    type,
    subscriptionId: subscription.id,
    customer: subscription.customer,
    metadata: subscription.metadata,
    email: customerEmail,
    defaultPaymentMethod: subscription.default_payment_method
  });

  // IMPORTANTE: Se for parte de uma migração de plano, não processa aqui
  if (subscription.metadata?.isUpgrade === "true") {
    console.log('⏭️ Ignorando evento de subscription pois é parte de uma migração de plano');
    return NextResponse.json({
      status: 200,
      message: "Subscription event ignored - part of plan migration"
    });
  }

  if (!customerEmail) {
    console.error('❌ Customer email not found:', subscription.customer);
    return NextResponse.json({
      status: 500,
      error: "Customer email could not be fetched",
    });
  }

  // Se não tiver userId nos metadados da assinatura, busca na tabela users pelo email
  let userId = subscription.metadata?.userId || "";
  if (!userId) {
    console.log('⚠️ No userId in metadata, searching by email');
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail || ""))
      .limit(1);

    if (user.length > 0 && user[0].userId) {
      const userIdString = user[0].userId;
      userId = userIdString;
      console.log('✅ Found userId by email:', userId);
      
      // Atualiza os metadados da assinatura no Stripe com o userId
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, userId: userIdString }
      });
    }
  }

  const subscriptionData: SubscriptionData = {
    subscriptionId: subscription.id,
    userId: userId || undefined,
    email: customerEmail || undefined,
    status: subscription.status || undefined,
    stripeUserId: subscription.customer as string || undefined,
    planId: getPriceIdFromSubscription(subscription) ?? undefined,
    currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : undefined,
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
    defaultPaymentMethodId: subscription.default_payment_method as string || undefined,
    startDate: subscription.start_date ? new Date(subscription.start_date * 1000).toISOString() : undefined,
    createdTime: new Date(),
    previousPlanId: type === "updated" && (event.data as SubscriptionEventData).previous_attributes?.items?.data?.[0]?.price?.id || undefined,
    planChangedAt: type === "updated" && (event.data as SubscriptionEventData).previous_attributes?.items ? new Date() : undefined,
    canceledAt: undefined
  };

  try {
    // Verifica se a assinatura já existe
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, subscription.id))
      .limit(1);

    // Se for uma assinatura nova ou atualização
    if (type === "created" || type === "updated") {
      // Busca o usuário atual para verificar o status
      const currentUser = await db
        .select()
        .from(users)
        .where(eq(users.email, customerEmail))
        .limit(1);

      // Se o usuário estiver bloqueado/banido/deletado, cancela a assinatura
      if (currentUser[0]?.status === "blocked" || 
          currentUser[0]?.status === "banned" || 
          currentUser[0]?.status === "deleted") {
        
        // Cancela a assinatura no Stripe
        await stripe.subscriptions.cancel(subscription.id);
        
        // Atualiza o status da assinatura no banco
        await db
          .update(subscriptions)
          .set({
            status: "cancelled",
            canceledAt: new Date()
          })
          .where(eq(subscriptions.subscriptionId, subscription.id));

        return NextResponse.json({
          status: 200,
          message: "Subscription cancelled - user is blocked/banned/deleted"
        });
      }

      // Se o usuário estiver ativo, atualiza normalmente
      await db
        .update(users)
        .set({ 
          subscription: subscription.status,
          status: "active"
        })
        .where(eq(users.email, customerEmail));

      console.log('✅ Updated user subscription status:', subscription.status);
    }

    // Se for um cancelamento
    if (type === "deleted") {
      // Update subscriptions table
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          email: customerEmail,
          canceledAt: new Date()
        })
        .where(eq(subscriptions.subscriptionId, subscription.id));

      // Update user table to remove subscription
      await db
        .update(users)
        .set({ subscription: null })
        .where(eq(users.email, customerEmail));

      // Verifica se é uma migração de plano
      const isUpgrade = subscription.metadata?.isUpgrade === "true";
      const hasNewPlan = subscription.metadata?.newPlanId != null;

      // Só envia notificação de cancelamento se não for uma migração
      if (userId && !isUpgrade && !hasNewPlan) {
        await sendSubscriptionCancelledNotification({
          userId,
          email: customerEmail || "",
          planId: getPriceIdFromSubscription(subscription) || ""
        });
      }

      return NextResponse.json({
        status: 200,
        message: "Subscription cancelled successfully",
      });
    }

    // Se a assinatura não existe e é um evento "created", insere
    if (!existingSubscription.length && type === "created") {
      console.log('📝 Creating new subscription record');
      const insertedData = await db
        .insert(subscriptions)
        .values(subscriptionData)
        .returning();

      return NextResponse.json({
        status: 200,
        message: "Subscription created successfully",
        data: insertedData,
      });
    } else {
      // Se já existe, atualiza
      console.log('📝 Updating existing subscription record');
      const updatedData = await db
        .update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.subscriptionId, subscription.id))
        .returning();

      return NextResponse.json({
        status: 200,
        message: "Subscription updated successfully",
        data: updatedData,
      });
    }
  } catch (error) {
    console.error(`Error during subscription ${type}:`, error);
    return NextResponse.json({
      status: 500,
      error: `Error during subscription ${type}`,
    });
  }
}

async function handleInvoiceEvent(
  event: Stripe.Event,
  status: "succeeded" | "failed"
) {
  const invoice = event.data.object as Stripe.Invoice;
  const customerEmail = await getCustomerEmail(invoice.customer as string);

  console.log('📊 Invoice details:', {
    email: customerEmail,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    metadata: invoice.metadata,
    invoiceId: invoice.id,
    paymentIntent: invoice.payment_intent,
    subscription: invoice.subscription,
    lines: invoice.lines?.data,
    lineItemMetadata: invoice.lines?.data?.[0]?.metadata
  });

  if (!customerEmail) {
    return NextResponse.json({
      status: 500,
      error: "Customer email could not be fetched",
    });
  }

  // Busca o userId pelo email se não estiver nos metadados
  let userId = invoice.metadata?.userId;
  
  // Se não encontrou nos metadados da invoice, tenta nos metadados da linha do item
  if (!userId && invoice.lines?.data?.[0]?.metadata?.userId) {
    userId = invoice.lines.data[0].metadata.userId;
    console.log('✅ Found userId in line item metadata:', userId);
  }

  if (!userId) {
    console.log('⚠️ No userId in metadata, searching by email:', customerEmail);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, customerEmail))
      .limit(1);

    if (user.length > 0 && user[0].userId) {
      const userIdString = user[0].userId;
      userId = userIdString;
      console.log('✅ Found userId by email:', userId);
      
      // Atualiza os metadados da invoice no Stripe
      await stripe.invoices.update(invoice.id, {
        metadata: { ...invoice.metadata, userId: userIdString }
      });
      console.log('✅ Invoice metadata updated with userId');
    }
  }

  // Se ainda não encontrou o userId, tenta buscar pela subscription
  if (!userId && invoice.subscription) {
    console.log('⚠️ Searching userId by subscription:', invoice.subscription);
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, invoice.subscription as string))
      .limit(1);

    if (subscription.length > 0 && subscription[0].userId) {
      const userIdString = subscription[0].userId;
      userId = userIdString;
      console.log('✅ Found userId by subscription:', userId);
      
      // Atualiza os metadados da invoice no Stripe
      await stripe.invoices.update(invoice.id, {
        metadata: { ...invoice.metadata, userId: userIdString }
      });
      console.log('✅ Invoice metadata updated with userId from subscription');
    }
  }

  const invoiceData: InvoiceData = {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription as string ?? undefined,
    amountPaid: status === "succeeded" ? String(invoice.amount_paid / 100) : undefined,
    amountDue: status === "failed" ? String(invoice.amount_due / 100) : undefined,
    currency: invoice.currency ?? undefined,
    status: status ?? undefined,
    userId: userId || undefined,
    email: customerEmail ?? undefined,
    periodStart: invoice.lines?.data?.[0]?.period?.start ? new Date(invoice.lines.data[0].period.start * 1000) : 
                (invoice.period_start ? new Date(invoice.period_start * 1000) : undefined),
    periodEnd: invoice.lines?.data?.[0]?.period?.end ? new Date(invoice.lines.data[0].period.end * 1000) : 
              (invoice.period_end ? new Date(invoice.period_end * 1000) : undefined),
    paymentIntent: (invoice.payment_intent as string) ?? undefined
  };

  console.log('📊 Invoice periods:', {
    fromLineItem: {
      start: invoice.lines?.data?.[0]?.period?.start ? new Date(invoice.lines.data[0].period.start * 1000) : null,
      end: invoice.lines?.data?.[0]?.period?.end ? new Date(invoice.lines.data[0].period.end * 1000) : null
    },
    fromInvoice: {
      start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      end: invoice.period_end ? new Date(invoice.period_end * 1000) : null
    }
  });

  try {
    // Verifica se a fatura já existe
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceId, invoice.id))
      .limit(1);

    if (existingInvoice.length > 0) {
      console.log('✅ Invoice already exists, updating status and data');
      // Atualiza a fatura existente com todos os campos relevantes
      const updatedInvoice = await db
        .update(invoices)
        .set({
          status,
          amountPaid: invoiceData.amountPaid,
          amountDue: invoiceData.amountDue,
          paymentIntent: invoiceData.paymentIntent,
          userId: invoiceData.userId,
          email: invoiceData.email,
          subscriptionId: invoiceData.subscriptionId
        })
        .where(eq(invoices.invoiceId, invoice.id))
        .returning();

      console.log('✅ Invoice updated with data:', {
        invoiceId: invoice.id,
        updatedFields: {
          status,
          amountPaid: invoiceData.amountPaid,
          amountDue: invoiceData.amountDue,
          paymentIntent: invoiceData.paymentIntent,
          userId: invoiceData.userId,
          email: invoiceData.email,
          subscriptionId: invoiceData.subscriptionId
        }
      });

      return NextResponse.json({
        status: 200,
        message: `Invoice payment status updated to ${status}`,
        data: updatedInvoice,
      });
    }

    console.log('📝 Creating new invoice');
    // Insere nova fatura
    const insertedInvoice = await db
      .insert(invoices)
      .values(invoiceData)
      .returning();

    return NextResponse.json({
      status: 200,
      message: `Invoice payment ${status}`,
      data: insertedInvoice,
    });
  } catch (error) {
    console.error(`Error handling invoice (payment ${status}):`, error);
    return NextResponse.json({
      status: 500,
      error: `Error handling invoice (payment ${status})`,
    });
  }
}

/**
 * Funções auxiliares para manipulação de assinaturas
 */

/**
 * Busca a assinatura ativa atual do usuário
 * @param userId ID do usuário
 * @returns A assinatura ativa ou undefined
 */
async function getCurrentActiveSubscription(userId: string) {
  const activeSubscription = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active"),
        // Garante que não está cancelada (is null em SQL)
        sql`${subscriptions.canceledAt} is null`
      )
    )
    .orderBy(sql`${subscriptions.createdTime} desc`)  // Pega a mais recente em caso de inconsistência
    .limit(1);

  return activeSubscription[0];
}

/**
 * Cancela uma assinatura tanto no Stripe quanto no banco de dados
 * @param subscriptionId ID da assinatura no Stripe
 * @param dbSubscriptionId ID da assinatura no banco de dados
 */
async function cancelSubscription(subscriptionId: string, dbSubscriptionId: number) {
  console.log('🔄 Cancelando assinatura:', { subscriptionId, dbSubscriptionId });
  
  const cancelTime = new Date();

  // Cancela no Stripe
  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (stripeSubscription.status === 'active') {
      await stripe.subscriptions.cancel(subscriptionId);
      console.log('✅ Assinatura cancelada no Stripe');
    }
  } catch (error: any) {
    if (error.code !== 'resource_missing') {
      console.error('❌ Erro ao cancelar assinatura no Stripe:', error);
      throw error;
    }
  }

  // Cancela no banco
  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      canceledAt: cancelTime
    })
    .where(eq(subscriptions.id, dbSubscriptionId));
  
  console.log('✅ Assinatura cancelada no banco de dados');
}

/**
 * Processa a migração de plano, garantindo que apenas um plano fique ativo
 * @param oldSubscription Assinatura atual
 * @param newSubscriptionId ID da nova assinatura
 * @param metadata Metadados do checkout
 */
async function handlePlanMigration(
  oldSubscription: any,
  newSubscriptionId: string,
  metadata: CheckoutMetadata
) {
  console.log('🔄 Processando migração de plano:', {
    oldSubscriptionId: oldSubscription?.subscriptionId,
    newSubscriptionId,
    isUpgrade: metadata.isUpgrade
  });

  // Verifica o status do usuário antes de prosseguir
  const currentUser = await db
    .select()
    .from(users)
    .where(eq(users.userId, metadata.userId))
    .limit(1);

  // Se o usuário estiver bloqueado/banido/deletado, cancela a nova assinatura
  if (currentUser[0]?.status === "blocked" || 
      currentUser[0]?.status === "banned" || 
      currentUser[0]?.status === "deleted") {
    
    // Cancela a nova assinatura no Stripe
    await stripe.subscriptions.cancel(newSubscriptionId);
    
    // Atualiza o status da nova assinatura no banco
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        canceledAt: new Date()
      })
      .where(eq(subscriptions.subscriptionId, newSubscriptionId));

    throw new Error(`Cannot migrate plan - user is ${currentUser[0]?.status}`);
  }

  // Inicia uma transação para garantir atomicidade
  await db.transaction(async (tx) => {
    // 1. Primeiro ativa a nova assinatura
    await tx
      .update(subscriptions)
      .set({
        status: "active",
        canceledAt: null
      })
      .where(eq(subscriptions.subscriptionId, newSubscriptionId));

    // 2. Depois cancela as antigas (exceto a nova)
    await tx
      .update(subscriptions)
      .set({
        status: "cancelled",
        canceledAt: new Date()
      })
      .where(
        and(
          eq(subscriptions.userId, metadata.userId),
          eq(subscriptions.status, "active"),
          sql`subscription_id != ${newSubscriptionId}` // Não cancela a nova
        )
      );

    // 3. Atualiza o status do usuário mantendo-o ativo
    await tx
      .update(users)
      .set({ 
        subscription: "active",
        status: "active"
      })
      .where(eq(users.userId, metadata.userId));
  });

  // Após garantir a consistência no banco, trata as assinaturas no Stripe
  const allOldSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, metadata.userId),
        eq(subscriptions.status, "cancelled"),
        sql`subscription_id != ${newSubscriptionId}`,
        sql`canceled_at >= NOW() - INTERVAL '5 minutes'`
      )
    );

  // Cancela as antigas no Stripe
  for (const subscription of allOldSubscriptions) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.subscriptionId);
      
      await stripe.subscriptions.update(subscription.subscriptionId, {
        metadata: {
          ...stripeSubscription.metadata,
          isUpgrade: metadata.isUpgrade || "true",
          newPlanId: newSubscriptionId
        }
      });

      await stripe.subscriptions.cancel(subscription.subscriptionId);
      console.log('✅ Assinatura antiga cancelada no Stripe:', subscription.subscriptionId);
    } catch (error) {
      console.error('❌ Erro ao cancelar assinatura no Stripe:', error);
    }
  }

  // Envia notificação de mudança de plano
  const newSubscription = await stripe.subscriptions.retrieve(newSubscriptionId);
  await sendPlanChangedNotification({
    userId: metadata.userId,
    email: metadata.email,
    oldPlanId: oldSubscription?.planId || "",
    newPlanId: getPriceIdFromSubscription(newSubscription) || "",
    isUpgrade: metadata.isUpgrade || "false",
    nextBillingDate: new Date(newSubscription.current_period_end * 1000)
  });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata as CheckoutMetadata;

  console.log('🔍 Checkout session completed:', {
    sessionId: session.id,
    customerId: session.customer,
    metadata
  });

  if (!metadata?.userId || !metadata?.email) {
    console.error('❌ Metadados obrigatórios ausentes:', metadata);
    throw new Error('Metadados obrigatórios ausentes');
  }

  try {
    // Busca os detalhes da nova assinatura
    const newSubscriptionDetails = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Verifica se esta assinatura já foi processada
    const processedSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, newSubscriptionDetails.id))
      .limit(1);

    if (processedSubscription.length > 0 && processedSubscription[0].status === "active") {
      console.log('⚠️ Esta assinatura já foi processada e está ativa');
      return NextResponse.json({
        status: 200,
        message: "Subscription already processed"
      });
    }
    
    // Busca assinatura ativa existente
    const currentActiveSubscription = await getCurrentActiveSubscription(metadata.userId);

    // Se for uma migração de plano e existir uma assinatura ativa
    if (metadata.isUpgrade === "true" && currentActiveSubscription) {
      await handlePlanMigration(currentActiveSubscription, newSubscriptionDetails.id, metadata);
    } else {
      // Mesmo que não seja upgrade, precisamos garantir que não há outras assinaturas ativas
      await handlePlanMigration(null, newSubscriptionDetails.id, metadata);
    }

    // Prepara os dados da nova assinatura
    const subscriptionData: SubscriptionData = {
      subscriptionId: newSubscriptionDetails.id,
      userId: metadata.userId,
      email: metadata.email,
      status: newSubscriptionDetails.status,
      stripeUserId: session.customer as string,
      planId: getPriceIdFromSubscription(newSubscriptionDetails) ?? undefined,
      currentPeriodStart: newSubscriptionDetails.current_period_start ? new Date(newSubscriptionDetails.current_period_start * 1000) : undefined,
      currentPeriodEnd: newSubscriptionDetails.current_period_end ? new Date(newSubscriptionDetails.current_period_end * 1000) : undefined,
      defaultPaymentMethodId: (newSubscriptionDetails.default_payment_method as string) ?? undefined,
      startDate: newSubscriptionDetails.start_date ? new Date(newSubscriptionDetails.start_date * 1000).toISOString() : undefined,
      createdTime: new Date(),
      // Usa o planId da assinatura atual como previousPlanId apenas se for uma migração
      previousPlanId: metadata.isUpgrade === "true" && currentActiveSubscription?.planId ? currentActiveSubscription.planId : undefined,
      planChangedAt: metadata.isUpgrade === "true" ? new Date() : undefined,
      canceledAt: undefined
    };

    // Antes de inserir, verifica se já não existe uma assinatura com este ID
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, newSubscriptionDetails.id))
      .limit(1);

    if (existingSubscription.length > 0) {
      console.log('⚠️ Assinatura já existe, atualizando dados');
      await db
        .update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.subscriptionId, newSubscriptionDetails.id));
    } else {
      console.log('📝 Criando nova assinatura');
      await db
        .insert(subscriptions)
        .values(subscriptionData);
    }

    console.log('✅ Assinatura processada com sucesso');

    return NextResponse.json({
      status: 200,
      message: "Assinatura processada com sucesso",
    });
  } catch (error) {
    console.error('❌ Erro ao processar assinatura:', error);
    throw error;
  }
}

async function handlePlanEvent(event: Stripe.Event) {
  const price = event.data.object as Stripe.Price;
  const product = await stripe.products.retrieve(price.product as string);

  try {
    await db
      .insert(subscriptionPlans)
      .values({
        planId: price.id,
        name: product.name,
        description: product.description || "",
        amount: String(price.unit_amount! / 100),
        currency: price.currency,
        interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
      })
      .onConflictDoUpdate({
        target: [subscriptionPlans.planId],
        set: {
          name: product.name,
          description: product.description || "",
          amount: String(price.unit_amount! / 100),
          currency: price.currency,
          interval: price.type === "recurring" ? price.recurring?.interval || "month" : "one_time",
        },
      });

    return NextResponse.json({
      status: 200,
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({
      status: 500,
      error: "Error updating plan",
    });
  }
}