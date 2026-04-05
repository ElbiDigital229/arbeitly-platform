import { applicationRepository } from '../repositories/application.repository.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { HttpError } from '../errors/HttpError.js';
import type { CreateApplicationDtoType, UpdateApplicationDtoType } from '../dtos/application.dto.js';

async function checkAndIncrementAppQuota(userId: string) {
  const profile = await profileRepository.findByUserId(userId);
  if (!profile || !profile.planId) return; // free users — no plan-based limit
  const plan = await (await import('../config/prisma.js')).prisma.plan.findUnique({ where: { id: profile.planId } });
  if (!plan) return;
  if (plan.applicationLimit > 0 && profile.applicationLimitUsed >= plan.applicationLimit) {
    throw HttpError.forbidden(`Application limit reached (${plan.applicationLimit}). Upgrade your plan to add more applications.`);
  }
  await (await import('../config/prisma.js')).prisma.candidateProfile.update({
    where: { userId },
    data: { applicationLimitUsed: { increment: 1 } },
  });
}

export const applicationService = {
  async createApplication(userId: string, dto: CreateApplicationDtoType) {
    await checkAndIncrementAppQuota(userId);
    return applicationRepository.create({
      ...dto,
      user: { connect: { id: userId } },
    });
  },

  async bulkCreateApplications(userId: string, dtos: CreateApplicationDtoType[]) {
    const results = [];
    for (const dto of dtos) {
      await checkAndIncrementAppQuota(userId);
      const app = await applicationRepository.create({
        ...dto,
        user: { connect: { id: userId } },
      });
      results.push(app);
    }
    return results;
  },

  async getApplications(userId: string) {
    // Only return self-added applications — employee-added ones (source: 'platform') are hidden from candidate
    return applicationRepository.findSelfAddedByUserId(userId);
  },

  async getApplicationById(userId: string, applicationId: string) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw HttpError.notFound('Application not found');
    }
    if (application.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this application');
    }
    return application;
  },

  async updateApplication(userId: string, applicationId: string, dto: UpdateApplicationDtoType) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw HttpError.notFound('Application not found');
    }
    if (application.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this application');
    }
    return applicationRepository.update(applicationId, dto);
  },

  async deleteApplication(userId: string, applicationId: string) {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw HttpError.notFound('Application not found');
    }
    if (application.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this application');
    }
    return applicationRepository.delete(applicationId);
  },
};
