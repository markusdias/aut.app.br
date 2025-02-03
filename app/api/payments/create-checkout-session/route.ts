import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

console.log('DEBUG - Environment check:', {
  stripeKey: {
    exists: !!process.env.STRIPE_SECRET_KEY,
    length: process.env.STRIPE_SECRET_KEY.length,
    prefix: process.env.STRIPE_SECRET_KEY.substring(0, 7)
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// URL base para redirecionamentos
const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, priceId, subscription } = await req.json();

    console.log("DEBUG - Create Checkout Session - Input:", {
      userId,
      email,
      priceId,
      subscription,
      baseUrl
    });

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (subscription) {
      try {
        // Verifica se o usuário já tem uma assinatura ativa
        const existingSubscription = await db
          .select()
          .from(subscriptions)
          .where(and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, "active")
          ))
          .limit(1);

        console.log("DEBUG - Existing Subscription:", existingSubscription[0] ? {
          id: existingSubscription[0].id,
          userId: existingSubscription[0].userId,
          status: existingSubscription[0].status,
          stripeUserId: existingSubscription[0].stripeUserId
        } : "None");

        let sessionParams: Stripe.Checkout.SessionCreateParams;

        if (existingSubscription.length > 0 && existingSubscription[0].stripeUserId) {
          // Se tem assinatura ativa, cria uma sessão de upgrade
          sessionParams = {
            payment_method_types: ["card"],
            mode: "subscription",
            metadata: { userId, email, subscription, isUpgrade: "true" },
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel`,
            allow_promotion_codes: true,
            customer: existingSubscription[0].stripeUserId,
            subscription_data: {
              metadata: { userId, email, isUpgrade: "true" }
            },
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
          };

          console.log("DEBUG - Creating upgrade session with params:", JSON.stringify(sessionParams, null, 2));
        } else {
          // Se não tem assinatura, cria uma nova
          sessionParams = {
            payment_method_types: ["card"],
            mode: "subscription",
            metadata: { userId, email, subscription },
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cancel`,
            allow_promotion_codes: true,
            customer_email: email,
            line_items: [
              {
                price: priceId,
                quantity: 1,
              },
            ],
          };

          console.log("DEBUG - Creating new subscription session with params:", JSON.stringify(sessionParams, null, 2));
        }

        try {
          const session = await stripe.checkout.sessions.create(sessionParams);

          console.log("DEBUG - Created session successfully:", {
            sessionId: session.id,
            url: session.url
          });

          return NextResponse.json({ sessionId: session.id });
        } catch (stripeError: any) {
          console.error("Stripe Error:", {
            type: stripeError.type,
            message: stripeError.message,
            code: stripeError.code,
            param: stripeError.param,
            raw: stripeError.raw
          });

          return NextResponse.json({ 
            error: stripeError.message || "Failed to create checkout session",
            details: stripeError.raw
          }, { status: 500 });
        }
      } catch (dbError) {
        console.error("Database Error:", dbError);
        return NextResponse.json({ error: "Database error while checking subscription" }, { status: 500 });
      }
    } else {
      try {
        const params: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ["card"],
          mode: "payment",
          metadata: { userId, email, subscription },
          success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/cancel`,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
        };

        console.log("DEBUG - Creating one-time payment session with params:", JSON.stringify(params, null, 2));

        const session = await stripe.checkout.sessions.create(params);

        console.log("DEBUG - Created one-time session successfully:", {
          sessionId: session.id,
          url: session.url
        });

        return NextResponse.json({ sessionId: session.id });
      } catch (stripeError: any) {
        console.error("Stripe Error:", {
          type: stripeError.type,
          message: stripeError.message,
          code: stripeError.code,
          param: stripeError.param,
          raw: stripeError.raw
        });

        return NextResponse.json({ 
          error: stripeError.message || "Failed to create checkout session",
          details: stripeError.raw
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
