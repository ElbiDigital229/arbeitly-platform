import { applicationRepository } from '../repositories/application.repository.js';
import { HttpError } from '../errors/HttpError.js';
import type { CreateApplicationDtoType, UpdateApplicationDtoType } from '../dtos/application.dto.js';

export const applicationService = {
  async createApplication(userId: string, dto: CreateApplicationDtoType) {
    return applicationRepository.create({
      ...dto,
      user: { connect: { id: userId } },
    });
  },

  async bulkCreateApplications(userId: string, dtos: CreateApplicationDtoType[]) {
    const results = [];
    for (const dto of dtos) {
      const app = await applicationRepository.create({
        ...dto,
        user: { connect: { id: userId } },
      });
      results.push(app);
    }
    return results;
  },

  async getApplications(userId: string) {
    return applicationRepository.findAllByUserId(userId);
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
