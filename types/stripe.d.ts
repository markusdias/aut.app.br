import Stripe from 'stripe';

declare global {
  namespace StripeTypes {
    interface SubscriptionWithItems extends Stripe.Subscription {
      items: {
        data: Array<{
          price: {
            id: string;
          };
        }>;
      };
    }
  }
}

export {}; 