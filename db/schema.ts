import { pgTable, serial, text, timestamp, boolean, jsonb, pgEnum, uuid, integer } from "drizzle-orm/pg-core";

// Define o enum para status do usuário
export const userStatusEnum = pgEnum('user_status', ['active', 'blocked', 'banned', 'deleted']);

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
  status: userStatusEnum("status").default('active').notNull(),
  deletedAt: timestamp("deleted_at"),
});


export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  subscriptionId: text("subscription_id").notNull(),
  userId: text("user_id"),
  email: text("email"),
  status: text("status"),
  stripeUserId: text("stripe_user_id"),
  planId: text("plan_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  defaultPaymentMethodId: text("default_payment_method_id"),
  startDate: text("start_date"),
  createdTime: timestamp("created_time"),
  previousPlanId: text("previous_plan_id"),
  planChangedAt: timestamp("plan_changed_at"),
  canceledAt: timestamp("canceled_at"),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  cancellationReason: text('cancellation_reason'),
  cancelRequestedAt: timestamp('cancel_requested_at'),
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

export const webhook_events = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_id: text("event_id").notNull(),
  event_type: text("event_type").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default('pending'),
  raw_data: jsonb("raw_data"),
  error: text("error"),
  retry_count: serial("retry_count").default(0),
  last_retry_time: timestamp("last_retry_time"),
  created_time: timestamp("created_time").notNull().defaultNow(),
  processed_time: timestamp("processed_time"),
  metadata: jsonb("metadata"),
  user_id: integer("user_id").references(() => users.id),
  user_resolution_metadata: jsonb("user_resolution_metadata")
});
