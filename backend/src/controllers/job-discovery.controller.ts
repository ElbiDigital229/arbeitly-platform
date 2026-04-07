import { jobDiscoveryService } from '../services/job-discovery.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const jobDiscoveryController = {
  getJobs: asyncHandler(async (_req, res) => {
    success(res, await jobDiscoveryService.getJobs());
  }),

  getJob: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.getJob(req.params.id));
  }),

  createJob: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.createJob(req.body, req.user!.id), 201);
  }),

  bulkCreate: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.bulkCreate(req.body.jobs, req.user!.id), 201);
  }),

  deleteJob: asyncHandler(async (req, res) => {
    await jobDiscoveryService.deleteJob(req.params.id);
    success(res, { message: 'Job deleted' });
  }),

  scoreRelevance: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.scoreRelevance(req.params.id, req.params.candidateId));
  }),

  addToQueue: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.addToQueue(req.params.id, req.params.candidateId, req.user!.id), 201);
  }),
};
