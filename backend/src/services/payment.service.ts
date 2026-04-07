import { prisma } from '../config/prisma.js';
import { planRepository } from '../repositories/plan.repository.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';

interface MockCard {
  name?: string;
  last4?: string;
  expiry?: string;
}

export const paymentService = {
  async purchasePlan(userId: string, planId: string, mockCard?: MockCard) {
    const plan = await planRepository.findById(planId);
    if (!plan) throw HttpError.notFound('Plan not found');
    if (!plan.isActive) throw HttpError.badRequest('This plan is no longer available');

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw HttpError.notFound('Candidate profile not found');

    // Allow plan changes — reset usage when switching plans, bump CV export limit to plan's allowance
    const isSamePlan = profile.planId === plan.id;
    const updated = await prisma.candidateProfile.update({
      where: { userId },
      data: {
        planId: plan.id,
        applicationLimitUsed: isSamePlan ? undefined : 0,
        cvCreationLimit: plan.cvLimit,
        cvCreationsUsed: isSamePlan ? undefined : 0,
      },
      include: { plan: true },
    });

    // Record transaction
    const notes = mockCard?.last4
      ? `Test card •••• ${mockCard.last4}${mockCard.name ? ` (${mockCard.name})` : ''}`
      : null;
    await prisma.transaction.create({
      data: {
        userId,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        method: mockCard ? 'mock_card' : 'platform',
        status: 'paid',
        notes,
      },
    });

    activityService.log(userId, 'plan', 'Purchased plan', `${plan.name} — €${plan.price}`);
    return {
      message: 'Plan purchased successfully',
      plan: updated.plan,
    };
  },

  async getMyTransactions(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { plan: { select: { id: true, name: true, price: true, currency: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getMyTransaction(userId: string, id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: {
        plan: { select: { id: true, name: true, price: true, currency: true, description: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!tx || tx.userId !== userId) throw HttpError.notFound('Transaction not found');
    return tx;
  },

  async getCurrentPlan(userId: string) {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!profile) return { plan: null, status: 'FREE' };

    if (!profile.plan) {
      return { plan: null, status: 'FREE' };
    }

    return {
      plan: profile.plan,
      status: 'PAID',
      applicationLimitUsed: profile.applicationLimitUsed,
      applicationLimit: profile.plan.applicationLimit,
    };
  },
};
