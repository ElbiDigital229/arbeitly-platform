import { profileService } from '../services/profile.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const profileController = {
  getProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.getProfile(req.user!.id);
    success(res, profile);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const profile = await profileService.updateProfile(req.user!.id, req.body);
    success(res, profile);
  }),
};
