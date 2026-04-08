import { prisma } from '../config/prisma.js';
import { profileRepository } from '../repositories/profile.repository.js';
import { activityService } from './activity.service.js';
import { onboardingConfigService } from './onboarding-config.service.js';
import type { OnboardingDtoType } from '../dtos/onboarding.dto.js';

/**
 * Maps from question keys in onboarding-questions.json to actual columns
 * on CandidateProfile. Anything NOT in this set falls through to
 * `onboardingData` JSON so adding a new free-text question in the config
 * works without a code change.
 */
const STRUCTURED_KEYS = new Set([
  'firstName', 'lastName', 'phone', 'preferredLanguage',
  'currentRoleId', 'yearsExperienceMin', 'yearsExperienceMax', 'skillIds',
  'targetRoleIds', 'targetIndustryIds', 'careerGoal',
  'baseLocation', 'acceptsRemote', 'willingToRelocate', 'acceptedCities',
  'salaryRange', 'candidateLanguages', 'workAuth',
]);

function toCityList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).map((s) => s.trim()).filter(Boolean);
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const onboardingService = {
  async completeOnboarding(userId: string, dto: OnboardingDtoType) {
    const data = dto as Record<string, any>;

    // Anything not in STRUCTURED_KEYS goes into onboardingData JSON.
    // This lets users add new questions in onboarding-questions.json
    // (e.g. "favoriteIDE") and have answers persisted with no code change.
    const onboardingData: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (STRUCTURED_KEYS.has(k)) continue;
      if (v === undefined || v === '' || v === null) continue;
      onboardingData[k] = v;
    }

    const update: Record<string, any> = {
      onboardingCompleted: true,
      onboardingData,
    };

    // Basics
    if (data.firstName) update.firstName = data.firstName;
    if (data.lastName) update.lastName = data.lastName;
    if (data.phone !== undefined) update.phone = data.phone || null;
    if (data.preferredLanguage) update.preferredLanguage = data.preferredLanguage;

    // Current situation
    if (data.currentRoleId !== undefined) update.currentRoleId = data.currentRoleId || null;
    if (data.yearsExperienceMin !== undefined) update.yearsExperienceMin = data.yearsExperienceMin;
    if (data.yearsExperienceMax !== undefined) update.yearsExperienceMax = data.yearsExperienceMax;
    if (Array.isArray(data.skillIds)) update.skillIds = data.skillIds;

    // Goals
    if (Array.isArray(data.targetRoleIds)) update.targetRoleIds = data.targetRoleIds;
    if (Array.isArray(data.targetIndustryIds)) update.targetIndustryIds = data.targetIndustryIds;
    if (data.careerGoal !== undefined) update.careerGoal = data.careerGoal || null;

    // Logistics
    if (data.baseLocation) {
      if (data.baseLocation.city !== undefined) update.baseCity = data.baseLocation.city || null;
      if (data.baseLocation.country !== undefined) update.baseCountry = data.baseLocation.country || null;
      // keep legacy `location` column populated for any old code that reads it
      const parts = [data.baseLocation.city, data.baseLocation.country].filter(Boolean);
      if (parts.length) update.location = parts.join(', ');
    }
    if (data.acceptsRemote !== undefined) update.acceptsRemote = !!data.acceptsRemote;
    if (data.willingToRelocate !== undefined) update.willingToRelocate = !!data.willingToRelocate;
    if (data.acceptedCities !== undefined) update.acceptedCities = toCityList(data.acceptedCities);
    if (data.salaryRange) {
      if (data.salaryRange.min !== undefined) update.salaryMin = data.salaryRange.min;
      if (data.salaryRange.max !== undefined) update.salaryMax = data.salaryRange.max;
      if (data.salaryRange.currency) update.salaryCurrency = data.salaryRange.currency;
    }
    if (Array.isArray(data.candidateLanguages)) update.candidateLanguages = data.candidateLanguages;
    if (Array.isArray(data.workAuth)) update.workAuth = data.workAuth;

    // For new candidates we need firstName/lastName for the create branch.
    const create = {
      ...update,
      firstName: update.firstName ?? '',
      lastName: update.lastName ?? '',
    };

    const profile = await profileRepository.upsert(userId, create, update);

    // Mark first CV as base if any
    const cvs = await prisma.cV.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, take: 1 });
    if (cvs.length > 0 && !cvs[0].isBase) {
      await prisma.cV.update({ where: { id: cvs[0].id }, data: { isBase: true } });
    }

    activityService.log(userId, 'onboarding', 'Completed onboarding');
    return profile;
  },

  /** Used by frontend to know which steps/questions to render. */
  getConfig() {
    return onboardingConfigService.load();
  },
};
