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

  reEnrich: asyncHandler(async (req, res) => {
    success(res, await jobDiscoveryService.reEnrichJob(req.params.id));
  }),

  listWithMatches: asyncHandler(async (req, res) => {
    const raw = (req.query.candidateIds as string) || '';
    const candidateIds = raw.split(',').map((s) => s.trim()).filter(Boolean);
    const minScore = req.query.minScore ? Number(req.query.minScore) : 0;
    const result = await jobDiscoveryService.listJobsWithMatches({
      callerId: req.user!.id,
      callerRole: req.user!.role as 'ADMIN' | 'EMPLOYEE',
      candidateIds,
      minScore: Number.isFinite(minScore) ? minScore : 0,
    });
    success(res, result);
  }),
};
