import { planRepository } from '../repositories/plan.repository.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const planController = {
  getActivePlans: asyncHandler(async (_req, res) => {
    success(res, await planRepository.findActive());
  }),
};
