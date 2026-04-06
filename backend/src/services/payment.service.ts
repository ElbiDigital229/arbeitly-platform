import { prisma } from '../config/prisma.js';
import { planRepository } from '../repositories/plan.repository.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';

export const paymentService = {
  async purchasePlan(userId: string, planId: string) {
    const plan = await planRepository.findById(planId);
    if (!plan) throw HttpError.notFound('Plan not found');
    if (!plan.isActive) throw HttpError.badRequest('This plan is no longer available');

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw HttpError.notFound('Candidate profile not found');

    // Allow plan changes — reset usage when switching plans
    const updated = await prisma.candidateProfile.update({
      where: { userId },
      data: { planId: plan.id, applicationLimitUsed: profile.planId === plan.id ? undefined : 0 },
      include: { plan: true },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        method: 'platform',
        status: 'paid',
      },
    });

    activityService.log(userId, 'plan', 'Purchased plan', `${plan.name} — €${plan.price}`);
    return {
      message: 'Plan purchased successfully',
      plan: updated.plan,
    };
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
