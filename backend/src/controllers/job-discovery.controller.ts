import type { RequestHandler } from 'express';
import { jobDiscoveryService } from '../services/job-discovery.service.js';
import { success } from '../utils/response.js';

export const jobDiscoveryController = {
  getJobs: (async (_req, res, next) => {
    try { success(res, await jobDiscoveryService.getJobs()); } catch (err) { next(err); }
  }) as RequestHandler,

  getJob: (async (req, res, next) => {
    try { success(res, await jobDiscoveryService.getJob(req.params.id)); } catch (err) { next(err); }
  }) as RequestHandler,

  createJob: (async (req, res, next) => {
    try { success(res, await jobDiscoveryService.createJob(req.body, req.user!.id), 201); } catch (err) { next(err); }
  }) as RequestHandler,

  deleteJob: (async (req, res, next) => {
    try { await jobDiscoveryService.deleteJob(req.params.id); success(res, { message: 'Job deleted' }); } catch (err) { next(err); }
  }) as RequestHandler,

  scoreRelevance: (async (req, res, next) => {
    try { success(res, await jobDiscoveryService.scoreRelevance(req.params.id, req.params.candidateId)); } catch (err) { next(err); }
  }) as RequestHandler,

  addToQueue: (async (req, res, next) => {
    try { success(res, await jobDiscoveryService.addToQueue(req.params.id, req.params.candidateId, req.user!.id), 201); } catch (err) { next(err); }
  }) as RequestHandler,
};
