import { db } from "@/db/drizzle";
import { invoices, subscriptions, users, subscriptionPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

async function handleSubscriptionEvent(
  event: Stripe.Event,
  type: "created" | "updated" | "deleted"
) {
  const subscription = event.data.object as Stripe.Subscription;
  const customerEmail = await getCustomerEmail(subscription.customer as string);

  console.log('📝 Subscription event details:', {
    type,
    subscriptionId: subscription.id,
    customer: subscription.customer,
    metadata: subscription.metadata,
    email: customerEmail,
    defaultPaymentMethod: subscription.default_payment_method
  });

  if (!customerEmail) {
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
      userId = user[0].userId;
      console.log('✅ Found userId by email:', userId);
      
      // Atualiza os metadados da assinatura no Stripe com o userId
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, userId }
      });
    }
  }

  const subscriptionData = {
    subscriptionId: subscription.id,
    stripeUserId: subscription.customer as string,
    status: subscription.status,
    startDate: new Date(subscription.start_date * 1000).toISOString(),
    planId: subscription.items.data[0]?.price.id,
    userId: userId || "",
    email: customerEmail,
    defaultPaymentMethodId: subscription.default_payment_method as string,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000)
  };

  console.log('📝 Subscription data to save:', subscriptionData);

  try {
    // Verifica se a assinatura já existe
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.subscriptionId, subscription.id))
      .limit(1);

    if (type === "deleted") {
      // Update subscriptions table
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          email: customerEmail,
        })
        .where(eq(subscriptions.subscriptionId, subscription.id));

      // Update user table to remove subscription
      await db
        .update(users)
        .set({ subscription: null })
        .where(eq(users.email, customerEmail));

      return NextResponse.json({
        status: 200,
        message: "Subscription cancelled successfully",
      });
    }

    // Se a assinatura não existe e é um evento "created", insere
    // Se já existe ou é um evento "updated", atualiza
    if (!existingSubscription.length && type === "created") {
      console.log('📝 Creating new subscription record');
      const insertedData = await db
        .insert(subscriptions)
        .values(subscriptionData)
        .returning();

      // Atualiza a tabela users com o status da assinatura
      await db
        .update(users)
        .set({ subscription: subscriptionData.status })
        .where(eq(users.email, customerEmail));

      return NextResponse.json({
        status: 200,
        message: "Subscription created successfully",
        data: insertedData,
      });
    } else {
      console.log('📝 Updating existing subscription record');
      const updatedData = await db
        .update(subscriptions)
        .set(subscriptionData)
        .where(eq(subscriptions.subscriptionId, subscription.id))
        .returning();

      // Atualiza a tabela users com o status da assinatura
      await db
        .update(users)
        .set({ subscription: subscriptionData.status })
        .where(eq(users.email, customerEmail));

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
    paymentIntent: invoice.payment_intent
  });

  if (!customerEmail) {
    return NextResponse.json({
      status: 500,
      error: "Customer email could not be fetched",
    });
  }

  const invoiceData = {
    invoiceId: invoice.id,
    subscriptionId: invoice.subscription as string,
    amountPaid: status === "succeeded" ? String(invoice.amount_paid / 100) : undefined,
    amountDue: status === "failed" ? String(invoice.amount_due / 100) : undefined,
    currency: invoice.currency,
    status,
    userId: invoice.metadata?.userId,
    email: customerEmail,
    periodStart: new Date(invoice.period_start * 1000),
    periodEnd: new Date(invoice.period_end * 1000),
    paymentIntent: invoice.payment_intent as string
  };

  try {
    // Verifica se a fatura já existe
    const existingInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceId, invoice.id))
      .limit(1);

    if (existingInvoice.length > 0) {
      console.log('✅ Invoice already exists, updating status');
      // Atualiza a fatura existente
      const updatedInvoice = await db
        .update(invoices)
        .set({
          status,
          amountPaid: invoiceData.amountPaid,
          amountDue: invoiceData.amountDue,
          paymentIntent: invoiceData.paymentIntent
        })
        .where(eq(invoices.invoiceId, invoice.id))
        .returning();

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

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata: any = session?.metadata;

  console.log('🏷️ Session metadata:', metadata);
  console.log('📦 Session details:', {
    subscription: session.subscription,
    invoice: session.invoice,
    customer: session.customer
  });

  if (metadata?.subscription === "true") {
    // This is for subscription payments
    const subscriptionId = session.subscription;
    try {
      // Update subscription metadata in Stripe
      const subscription = await stripe.subscriptions.update(subscriptionId as string, { metadata });

      // Busca a fatura no Stripe para obter period_start e period_end
      const invoice = await stripe.invoices.retrieve(session.invoice as string);
      console.log('📅 Invoice completa:', invoice);
      console.log('📅 Invoice periods:', {
        periodStart: invoice.period_start,
        periodEnd: invoice.period_end,
        billingReason: invoice.billing_reason,
        created: invoice.created,
        subscriptionProrationDate: invoice.subscription_proration_date
      });

      // Busca a subscription para obter os períodos corretos
      const subscriptionDetails = await stripe.subscriptions.retrieve(subscriptionId as string);
      console.log('🔄 Subscription periods:', {
        currentPeriodStart: subscriptionDetails.current_period_start,
        currentPeriodEnd: subscriptionDetails.current_period_end
      });

      // Verify if invoice exists before updating
      const existingInvoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceId, session.invoice as string))
        .limit(1);

      if (existingInvoice.length === 0) {
        console.log('⚠️ Invoice not found, creating new invoice record');
        // Create new invoice record if it doesn't exist
        await db
          .insert(invoices)
          .values({
            invoiceId: session.invoice as string,
            subscriptionId: session.subscription as string,
            userId: metadata?.userId,
            email: metadata?.email,
            status: 'succeeded',
            amountPaid: String(session.amount_total! / 100),
            currency: session.currency,
            periodStart: new Date(subscriptionDetails.current_period_start * 1000),
            periodEnd: new Date(subscriptionDetails.current_period_end * 1000),
            paymentIntent: invoice.payment_intent as string
          });
      } else {
        console.log('✅ Updating existing invoice');
        // Update existing invoice
        await db
          .update(invoices)
          .set({ 
            userId: metadata?.userId,
            periodStart: new Date(subscriptionDetails.current_period_start * 1000),
            periodEnd: new Date(subscriptionDetails.current_period_end * 1000),
            paymentIntent: invoice.payment_intent as string
          })
          .where(eq(invoices.invoiceId, session.invoice as string));
      }

      // Update user's subscription status
      await db
        .update(users)
        .set({ subscription: subscription.status })
        .where(eq(users.userId, metadata?.userId));

      return NextResponse.json({
        status: 200,
        message: "Subscription metadata updated successfully",
      });
    } catch (error) {
      console.error("Error updating subscription metadata:", error);
      return NextResponse.json({
        status: 500,
        error: "Error updating subscription metadata",
      });
    }
  } else {
    // This is for one-time payments
    const dateTime = new Date(session.created * 1000).toISOString();
    try {
      // Fetch user
      // const user = await db.query.users.findFirst({
      //   where: eq(users.userId, metadata?.userId),
      // });

      // if (!user) {
      //   throw new Error("User not found");
      // }

      // const paymentData = {
      //   userId: metadata?.userId,
      //   stripeId: session.id,
      //   email: metadata?.email,
      //   amount: String(session.amount_total! / 100),
      //   customerDetails: JSON.stringify(session.customer_details),
      //   paymentIntent: session.payment_intent as string,
      //   paymentTime: dateTime,
      //   currency: session.currency,
      // };

      // // Insert payment
      // const insertedPayment = await db
      //   .insert(payments)
      //   .values(paymentData)
      //   .returning();

      // // Calculate and update user credits
      // const currentCredits = Number(user.credits || 0);
      // const updatedCredits = currentCredits + (session.amount_total || 0) / 100;

      // const updatedUser = await db
      //   .update(users)
      //   .set({ credits: String(updatedCredits) })
      //   .where(eq(users.userId, metadata?.userId))
      //   .returning();

      return NextResponse.json({
        status: 200,
        message: "Payment and credits updated successfully",
        // updatedUser,
      });
    } catch (error) {
      console.error("Error handling checkout session:", error);
      return NextResponse.json({
        status: 500,
        error: String(error),
      });
    }
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