import { onboardingService } from '../services/onboarding.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const onboardingController = {
  completeOnboarding: asyncHandler(async (req, res) => {
    const profile = await onboardingService.completeOnboarding(req.user!.id, req.body);
    success(res, profile);
  }),
};
