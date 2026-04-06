import type { RequestHandler } from 'express';
import { onboardingService } from '../services/onboarding.service.js';
import { success } from '../utils/response.js';

export const onboardingController = {
  completeOnboarding: (async (req, res, next) => {
    try {
      const profile = await onboardingService.completeOnboarding(req.user!.id, req.body);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
