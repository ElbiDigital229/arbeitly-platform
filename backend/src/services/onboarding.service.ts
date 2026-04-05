import { prisma } from '../config/prisma.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { coverLetterRepository } from '../repositories/cover-letter.repository.js';
import type { OnboardingDtoType } from '../dtos/onboarding.dto.js';

export const onboardingService = {
  async completeOnboarding(userId: string, dto: OnboardingDtoType) {
    const updateData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      location: dto.location,
      bio: dto.bio,
      baseCoverLetter: dto.baseCoverLetter,
      onboardingCompleted: true,
    };

    const profile = await profileRepository.upsert(
      userId,
      updateData,
      updateData,
    );

    // If base cover letter provided, save as CoverLetter record
    if (dto.baseCoverLetter) {
      const existing = await coverLetterRepository.findBaseByUserId(userId);
      if (existing) {
        await coverLetterRepository.update(existing.id, { content: dto.baseCoverLetter });
      } else {
        await coverLetterRepository.create({
          user: { connect: { id: userId } },
          title: 'Base Cover Letter',
          content: dto.baseCoverLetter,
          isBase: true,
        });
      }
    }

    // Mark any existing CV as base if not already
    const cvs = await prisma.cV.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, take: 1 });
    if (cvs.length > 0 && !cvs[0].isBase) {
      await prisma.cV.update({ where: { id: cvs[0].id }, data: { isBase: true } });
    }

    return profile;
  },
};
