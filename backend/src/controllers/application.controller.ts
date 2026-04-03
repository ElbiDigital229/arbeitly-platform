import type { RequestHandler } from 'express';
import { applicationService } from '../services/application.service.js';
import { success } from '../utils/response.js';
import { invalidateUserCache } from '../utils/cache.js';

export const applicationController = {
  createApplication: (async (req, res, next) => {
    try {
      const application = await applicationService.createApplication(req.user!.id, req.body);
      await invalidateUserCache(req.user!.id, '/api/applications');
      success(res, application, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  bulkCreateApplications: (async (req, res, next) => {
    try {
      const results = await applicationService.bulkCreateApplications(req.user!.id, req.body.applications);
      await invalidateUserCache(req.user!.id, '/api/applications');
      success(res, results, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getApplications: (async (req, res, next) => {
    try {
      const applications = await applicationService.getApplications(req.user!.id);
      success(res, applications);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getApplicationById: (async (req, res, next) => {
    try {
      const application = await applicationService.getApplicationById(req.user!.id, req.params.id);
      success(res, application);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateApplication: (async (req, res, next) => {
    try {
      const application = await applicationService.updateApplication(
        req.user!.id,
        req.params.id,
        req.body,
      );
      await invalidateUserCache(req.user!.id, '/api/applications');
      success(res, application);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  deleteApplication: (async (req, res, next) => {
    try {
      await applicationService.deleteApplication(req.user!.id, req.params.id);
      await invalidateUserCache(req.user!.id, '/api/applications');
      success(res, { message: 'Application deleted successfully' });
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
