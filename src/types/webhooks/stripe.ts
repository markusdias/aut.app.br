import { Stripe } from 'stripe';

export type WebhookMetadata = {
  headers?: Record<string, string>;
  received_at: string;
  debug_info: {
    initial_status: string;
    feature_flag: boolean;
  };
  completed_at?: string;
  processing_duration?: string;
  processing_started_at?: string;
  last_error?: string;
  error_time?: string;
};

export type WebhookUserResolutionMetadata = {
  success: boolean;
  method: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

export type StripePlanMigrationData = {
  oldSubscription: Stripe.Subscription;
  newSubscriptionId: string;
  metadata: {
    userId: string;
    email: string;
    subscription: string;
    isUpgrade?: string;
  };
};

export type StripeWebhookHandlerResponse = {
  status: number;
  message?: string;
  data?: unknown;
}; 