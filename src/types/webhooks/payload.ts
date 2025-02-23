export type WebhookPayloadObject = {
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

export type WebhookPayload = {
  type: string;
  data: {
    object: WebhookPayloadObject;
  };
};

export type StripeWebhookPayload = WebhookPayload & {
  api_version: string;
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  id: string;
}; 