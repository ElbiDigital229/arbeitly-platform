import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../errors/HttpError.js';
import { planRepository } from '../repositories/plan.repository.js';
import { activityService } from './activity.service.js';

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export const stripeCheckoutService = {
  async createCheckoutSession(userId: string, planId: string, successUrl: string, cancelUrl: string) {
    if (!stripe) throw HttpError.badRequest('Stripe is not configured');

    const plan = await planRepository.findById(planId);
    if (!plan) throw HttpError.notFound('Plan not found');
    if (!plan.isActive) throw HttpError.badRequest('This plan is no longer available');
    if (plan.price === 0) throw HttpError.badRequest('Free plans do not require payment');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw HttpError.notFound('User not found');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: plan.currency || 'eur',
          unit_amount: Math.round(plan.price * 100), // cents
          product_data: {
            name: `Arbeitly ${plan.name} Plan`,
            description: `${plan.applicationLimit} job applications`,
          },
        },
        quantity: 1,
      }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    });

    // Store pending checkout
    await prisma.pendingCheckout.create({
      data: {
        userId,
        planId,
        stripeSessionId: session.id,
        status: 'pending',
      },
    });

    return { url: session.url, sessionId: session.id };
  },

  async verifyAndActivate(sessionId: string) {
    if (!stripe) throw HttpError.badRequest('Stripe is not configured');

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      throw HttpError.badRequest('Payment not completed');
    }

    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (!userId || !planId) throw HttpError.badRequest('Invalid session metadata');

    // Check if already processed
    const pending = await prisma.pendingCheckout.findFirst({
      where: { stripeSessionId: sessionId },
    });
    if (pending?.status === 'completed') {
      return { message: 'Already activated' };
    }

    const plan = await planRepository.findById(planId);
    if (!plan) throw HttpError.notFound('Plan not found');

    // Activate plan
    await prisma.candidateProfile.update({
      where: { userId },
      data: { planId: plan.id, applicationLimitUsed: 0 },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency || 'eur',
        method: 'stripe',
        status: 'paid',
        stripeSessionId: sessionId,
      },
    });

    // Mark checkout as completed
    if (pending) {
      await prisma.pendingCheckout.update({
        where: { id: pending.id },
        data: { status: 'completed' },
      });
    }

    activityService.log(userId, 'plan', 'Purchased plan via Stripe', `${plan.name} — €${plan.price}`);
    return { message: 'Plan activated', plan };
  },

  async handleWebhook(payload: Buffer, signature: string) {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return;

    const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.verifyAndActivate(session.id);
    }
  },
};
