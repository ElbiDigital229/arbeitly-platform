import type { RequestHandler } from 'express';
import { planRepository } from '../repositories/plan.repository.js';
import { success } from '../utils/response.js';

export const planController = {
  getActivePlans: (async (_req, res, next) => {
    try { success(res, await planRepository.findActive()); } catch (err) { next(err); }
  }) as RequestHandler,
};
