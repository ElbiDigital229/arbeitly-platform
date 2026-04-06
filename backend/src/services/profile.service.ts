import { profileRepository } from '../repositories/profile.repository.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';
import type { UpdateProfileDtoType } from '../dtos/profile.dto.js';

export const profileService = {
  async getProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw HttpError.notFound('Profile not found');
    }
    return profile;
  },

  async updateProfile(userId: string, dto: UpdateProfileDtoType) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw HttpError.notFound('Profile not found');
    }
    const updated = await profileRepository.update(userId, dto);
    activityService.log(userId, 'profile', 'Updated profile');
    return updated;
  },
};
