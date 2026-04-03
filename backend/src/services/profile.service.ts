import { profileRepository } from '../repositories/profile.repository.js';
import { HttpError } from '../errors/HttpError.js';
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
    return profileRepository.update(userId, dto);
  },
};
