import { applicationService } from '../services/application.service.js';
import { jobDiscoveryService } from '../services/job-discovery.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const applicationController = {
  getPipeline: asyncHandler(async (req, res) => {
    const items = await jobDiscoveryService.getPipelineForCandidate(req.user!.id);
    success(res, items);
  }),

  createApplication: asyncHandler(async (req, res) => {
    const application = await applicationService.createApplication(req.user!.id, req.body);
    success(res, application, 201);
  }),

  bulkCreateApplications: asyncHandler(async (req, res) => {
    const results = await applicationService.bulkCreateApplications(req.user!.id, req.body.applications);
    success(res, results, 201);
  }),

  getApplications: asyncHandler(async (req, res) => {
    const applications = await applicationService.getApplications(req.user!.id);
    success(res, applications);
  }),

  getApplicationById: asyncHandler(async (req, res) => {
    const application = await applicationService.getApplicationById(req.user!.id, req.params.id);
    success(res, application);
  }),

  updateApplication: asyncHandler(async (req, res) => {
    const application = await applicationService.updateApplication(
      req.user!.id,
      req.params.id,
      req.body,
    );
    success(res, application);
  }),

  deleteApplication: asyncHandler(async (req, res) => {
    await applicationService.deleteApplication(req.user!.id, req.params.id);
    success(res, { message: 'Application deleted successfully' });
  }),
};
