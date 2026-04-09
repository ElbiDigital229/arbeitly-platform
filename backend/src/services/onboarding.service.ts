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
  'currentRoleId', 'yearsExperience', 'yearsExperienceMin', 'yearsExperienceMax', 'skillIds',
  'targetRoleIds', 'targetIndustryIds', 'careerGoal',
  'baseLocation', 'acceptsRemote', 'willingToRelocate', 'relocationScope', 'acceptedCities',
  'salaryRange', 'candidateLanguages', 'workAuth', 'workMode',
]);

function toCityList(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).map((s) => s.trim()).filter(Boolean);
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Mirrors the COUNTRIES list in OnboardingView.vue — used to expand the
// `phone-intl` {countryCode, number} payload into a single string column.
const DIAL_CODES: Record<string, string> = {
  DE: '+49', AT: '+43', CH: '+41', FR: '+33', NL: '+31', BE: '+32', LU: '+352',
  IT: '+39', ES: '+34', PT: '+351', IE: '+353', GB: '+44', DK: '+45', SE: '+46',
  NO: '+47', FI: '+358', PL: '+48', CZ: '+420', SK: '+421', HU: '+36', RO: '+40',
  BG: '+359', GR: '+30', HR: '+385', SI: '+386', EE: '+372', LV: '+371', LT: '+370',
  US: '+1', CA: '+1', MX: '+52', BR: '+55', AR: '+54', CL: '+56', CO: '+57',
  AU: '+61', NZ: '+64', JP: '+81', KR: '+82', CN: '+86', HK: '+852', SG: '+65',
  MY: '+60', TH: '+66', PH: '+63', ID: '+62', VN: '+84', IN: '+91', PK: '+92',
  BD: '+880', AE: '+971', SA: '+966', QA: '+974', KW: '+965', BH: '+973', OM: '+968',
  IL: '+972', TR: '+90', EG: '+20', MA: '+212', TN: '+216', DZ: '+213', NG: '+234',
  KE: '+254', ZA: '+27', UA: '+380', RU: '+7',
};

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

    // Phone can arrive as a plain string (legacy) or as {countryCode, number} from phone-intl
    if (data.phone !== undefined) {
      if (data.phone && typeof data.phone === 'object' && 'number' in data.phone) {
        const p = data.phone as { countryCode?: string; number?: string };
        const dial = DIAL_CODES[p.countryCode || ''] || '';
        const combined = `${dial}${p.number ? ' ' + p.number.trim() : ''}`.trim();
        update.phone = combined || null;
      } else {
        update.phone = data.phone || null;
      }
    }
    if (data.preferredLanguage) update.preferredLanguage = data.preferredLanguage;

    // Current situation
    if (data.currentRoleId !== undefined) update.currentRoleId = data.currentRoleId || null;
    // years-select sends one range like "3-5"; legacy forms may still send Min/Max directly.
    if (typeof data.yearsExperience === 'string' && data.yearsExperience) {
      const [lo, hi] = data.yearsExperience.split('-').map((n: string) => parseInt(n, 10));
      if (!Number.isNaN(lo)) update.yearsExperienceMin = lo;
      if (!Number.isNaN(hi)) update.yearsExperienceMax = hi;
    }
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
    // relocationScope is the new single source of truth; derive the legacy boolean from it.
    if (typeof data.relocationScope === 'string') {
      update.willingToRelocate = data.relocationScope !== 'no';
      onboardingData.relocationScope = data.relocationScope;
    }
    // workMode: remote/hybrid/onsite/any — also hint acceptsRemote if not already set
    if (typeof data.workMode === 'string') {
      onboardingData.workMode = data.workMode;
      if (data.acceptsRemote === undefined) {
        update.acceptsRemote = data.workMode === 'remote' || data.workMode === 'hybrid' || data.workMode === 'any';
      }
    }
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
