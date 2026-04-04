import { profileRepository } from '../repositories/profile.repository.js';
import type { OnboardingDtoType } from '../dtos/onboarding.dto.js';

export const onboardingService = {
  async completeOnboarding(userId: string, dto: OnboardingDtoType) {
    const updateData = {
      ...dto,
      onboardingCompleted: true,
    };

    return profileRepository.upsert(
      userId,
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        location: dto.location,
        bio: dto.bio,
        onboardingCompleted: true,
      },
      updateData,
    );
  },
};
