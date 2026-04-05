import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { subscriptionRepository } from '../repositories/subscription.repository.js';
import { HttpError } from '../errors/HttpError.js';
import type { CreateCheckoutDtoType } from '../dtos/payment.dto.js';
import type Stripe from 'stripe';

const PRICE_MAP: Record<string, string> = {
  STARTER: env.STRIPE_PRICE_STARTER,
  PROFESSIONAL: env.STRIPE_PRICE_PROFESSIONAL,
  ENTERPRISE: env.STRIPE_PRICE_ENTERPRISE,
};

export const paymentService = {
  async createCheckoutSession(userId: string, email: string, dto: CreateCheckoutDtoType) {
    const priceId = PRICE_MAP[dto.tier];
    if (!priceId || priceId === 'price_placeholder') {
      throw HttpError.badRequest('Stripe is not configured yet. Set STRIPE_PRICE_* env vars.');
    }

    // Find or create Stripe customer
    const sub = await subscriptionRepository.findByUserId(userId);
    let customerId: string;

    if (sub?.stripeCustomerId) {
      customerId = sub.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;

      await subscriptionRepository.upsertByUserId(userId, {
        user: { connect: { id: userId } },
        stripeCustomerId: customerId,
        planTier: 'FREE',
        status: 'ACTIVE',
      });
    }

    const baseUrl = env.NODE_ENV === 'production' ? 'https://arbeitly.com' : 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout-cancel`,
      metadata: { userId, tier: dto.tier },
    });

    return { url: session.url };
  },

  async createPortalSession(userId: string) {
    const sub = await subscriptionRepository.findByUserId(userId);
    if (!sub?.stripeCustomerId) {
      throw HttpError.badRequest('No active subscription found');
    }

    const baseUrl = env.NODE_ENV === 'production' ? 'https://arbeitly.com' : 'http://localhost:5173';

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${baseUrl}/portal/settings`,
    });

    return { url: session.url };
  },

  async getSubscription(userId: string) {
    const sub = await subscriptionRepository.findByUserId(userId);
    return sub ?? { planTier: 'FREE', status: 'ACTIVE' };
  },

  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      throw HttpError.badRequest(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as string;
        if (!userId) break;

        const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;

        await subscriptionRepository.upsertByUserId(userId, {
          user: { connect: { id: userId } },
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: stripeSub.items?.data?.[0]?.price?.id,
          planTier: tier as any,
          status: 'ACTIVE',
          currentPeriodStart: stripeSub.current_period_start
            ? new Date(stripeSub.current_period_start * 1000)
            : undefined,
          currentPeriodEnd: stripeSub.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : undefined,
        });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const existing = await subscriptionRepository.findByStripeSubscriptionId(sub.id);
        if (!existing) break;

        const statusMap: Record<string, string> = {
          active: 'ACTIVE',
          past_due: 'PAST_DUE',
          canceled: 'CANCELED',
          trialing: 'TRIALING',
          unpaid: 'UNPAID',
        };

        await subscriptionRepository.update(existing.id, {
          status: (statusMap[sub.status] ?? 'ACTIVE') as any,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          currentPeriodStart: sub.current_period_start
            ? new Date(sub.current_period_start * 1000)
            : undefined,
          currentPeriodEnd: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : undefined,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const existing = await subscriptionRepository.findByStripeSubscriptionId(sub.id);
        if (!existing) break;

        await subscriptionRepository.update(existing.id, {
          status: 'CANCELED',
          planTier: 'FREE',
        });
        break;
      }
    }

    return { received: true };
  },
};
