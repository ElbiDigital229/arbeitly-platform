import { prisma } from '../config/prisma.js';
import { planRepository } from '../repositories/plan.repository.js';
import { HttpError } from '../errors/HttpError.js';

export const paymentService = {
  async purchasePlan(userId: string, planId: string) {
    const plan = await planRepository.findById(planId);
    if (!plan) throw HttpError.notFound('Plan not found');
    if (!plan.isActive) throw HttpError.badRequest('This plan is no longer available');

    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw HttpError.notFound('Candidate profile not found');
    if (profile.planId) throw HttpError.badRequest('You already have an active plan');

    const updated = await prisma.candidateProfile.update({
      where: { userId },
      data: { planId: plan.id, applicationLimitUsed: 0 },
      include: { plan: true },
    });

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
