import type { RequestHandler } from 'express';
import { profileService } from '../services/profile.service.js';
import { success } from '../utils/response.js';

export const profileController = {
  getProfile: (async (req, res, next) => {
    try {
      const profile = await profileService.getProfile(req.user!.id);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  updateProfile: (async (req, res, next) => {
    try {
      const profile = await profileService.updateProfile(req.user!.id, req.body);
      success(res, profile);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
