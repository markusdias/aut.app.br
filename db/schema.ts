import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  gender: text("gender"),
  profileImageUrl: text("profile_image_url"),
  userId: text("user_id").unique(),
  subscription: text("subscription"),
  credits: text("credits"),
});


export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  subscriptionId: text("subscription_id"),
  stripeUserId: text("stripe_user_id"),
  status: text("status"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  planId: text("plan_id"),
  defaultPaymentMethodId: text("default_payment_method_id"),
  email: text("email"),
  userId: text("user_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
});

export const subscriptionPlans = pgTable("subscriptions_plans", {
  id: serial("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  planId: text("plan_id").unique(),
  name: text("name"),
  description: text("description"),
  amount: text("amount"),
  currency: text("currency"),
  interval: text("interval"),
  active: boolean("active").default(true),
  metadata: jsonb("metadata"),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  createdTime: timestamp("created_time").defaultNow(),
  invoiceId: text("invoice_id"),
  subscriptionId: text("subscription_id"),
  amountPaid: text("amount_paid"),
  amountDue: text("amount_due"),
  currency: text("currency"),
  status: text("status"),
  email: text("email"),
  userId: text("user_id"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  paymentIntent: text("payment_intent"),
});
