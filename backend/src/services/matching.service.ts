import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { prisma } from '../config/prisma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEIGHTS_PATH = join(__dirname, '..', 'config', 'match-weights.json');

export interface MatchWeights {
  weights: Record<string, number>;
  thresholds: { excellent: number; strong: number; possible: number; weak: number };
  rules: {
    missingDataPenalty: number;
    sameFamilyRolePartialCredit: number;
    skillAliasMatchCredit: number;
  };
}

function loadWeights(): MatchWeights {
  return JSON.parse(readFileSync(WEIGHTS_PATH, 'utf8'));
}

export interface FactorScore {
  key: string;
  label: string;
  score: number; // 0..1
  weight: number; // weight from config (points out of 100)
  contribution: number; // score * weight
  evidence: string; // human-readable explanation
}

export interface MatchResult {
  score: number; // 0..100
  band: 'excellent' | 'strong' | 'possible' | 'weak' | 'poor';
  factors: FactorScore[];
  topReasons: string[];
  topGaps: string[];
}

interface CandidateInput {
  currentRoleId?: string | null;
  targetRoleIds?: string[];
  targetIndustryIds?: string[];
  skillIds?: string[];
  yearsExperienceMin?: number | null;
  yearsExperienceMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  baseCity?: string | null;
  baseCountry?: string | null;
  acceptsRemote?: boolean;
  willingToRelocate?: boolean;
  acceptedCities?: string[];
  candidateLanguages?: Array<{ language: string; level: string }> | null;
  workAuth?: string[];
}

interface JobInput {
  id: string;
  roleId?: string | null;
  roleFamily?: string | null;
  skillIds?: string[];
  industryIds?: string[];
  city?: string | null;
  country?: string | null;
  remote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  yearsExperienceMin?: number | null;
  yearsExperienceMax?: number | null;
  languagesRequired?: string[];
  workAuthRequired?: string[];
}

// Helpers
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function bandFor(score: number, t: MatchWeights['thresholds']): MatchResult['band'] {
  if (score >= t.excellent) return 'excellent';
  if (score >= t.strong) return 'strong';
  if (score >= t.possible) return 'possible';
  if (score >= t.weak) return 'weak';
  return 'poor';
}

// Role family lookup cache (small, ~30 entries)
let roleFamilyCache: Map<string, string> | null = null;
async function getRoleFamily(roleId: string): Promise<string | null> {
  if (!roleFamilyCache) {
    const all = await prisma.jobRole.findMany({ select: { id: true, family: true } });
    roleFamilyCache = new Map(all.map((r) => [r.id, r.family]));
  }
  return roleFamilyCache.get(roleId) ?? null;
}
export function resetRoleFamilyCache() {
  roleFamilyCache = null;
}

// ─────────────────────────────────────────────────────────
// Per-factor scorers. Each returns {score 0..1, evidence}.
// ─────────────────────────────────────────────────────────

async function scoreRole(c: CandidateInput, j: JobInput, rules: MatchWeights['rules']) {
  if (!j.roleId) return { score: 0.5, evidence: 'Job role not tagged', missing: true };
  const targets = c.targetRoleIds || [];
  const current = c.currentRoleId;

  if (targets.includes(j.roleId)) {
    return { score: 1, evidence: 'Job matches one of your target roles' };
  }
  if (current && current === j.roleId) {
    return { score: 0.9, evidence: 'Job matches your current role' };
  }

  // Same-family partial credit
  const jobFamily = j.roleFamily || (await getRoleFamily(j.roleId));
  if (jobFamily) {
    const targetFamilies = await Promise.all(targets.map((id) => getRoleFamily(id)));
    const currentFamily = current ? await getRoleFamily(current) : null;
    if (targetFamilies.includes(jobFamily) || currentFamily === jobFamily) {
      return {
        score: rules.sameFamilyRolePartialCredit,
        evidence: `Same role family (${jobFamily}) as your targets`,
      };
    }
  }
  return { score: 0.1, evidence: 'Role not in your targets or current family' };
}

function scoreSkills(c: CandidateInput, j: JobInput) {
  const required = j.skillIds || [];
  if (required.length === 0) return { score: 0.6, evidence: 'Job skills not tagged', missing: true };
  const candidate = new Set(c.skillIds || []);
  const matched = required.filter((s) => candidate.has(s));
  const ratio = matched.length / required.length;
  return {
    score: clamp01(ratio),
    evidence: `${matched.length} of ${required.length} required skills matched`,
  };
}

function scoreIndustry(c: CandidateInput, j: JobInput) {
  const jInds = j.industryIds || [];
  if (jInds.length === 0) return { score: 0.5, evidence: 'Job industry not tagged', missing: true };
  const targets = c.targetIndustryIds || [];
  if (targets.length === 0) return { score: 0.5, evidence: 'You did not specify target industries' };
  const overlap = jInds.some((i) => targets.includes(i));
  return {
    score: overlap ? 1 : 0.2,
    evidence: overlap ? 'Industry matches your targets' : 'Industry not in your targets',
  };
}

function scoreExperience(c: CandidateInput, j: JobInput) {
  const jMin = j.yearsExperienceMin;
  const jMax = j.yearsExperienceMax;
  const cMin = c.yearsExperienceMin;
  const cMax = c.yearsExperienceMax;
  if (jMin == null && jMax == null) return { score: 0.6, evidence: 'No experience requirement', missing: true };
  if (cMin == null && cMax == null) return { score: 0.5, evidence: 'Your experience not set', missing: true };

  const lo = cMin ?? 0;
  const hi = cMax ?? lo;
  const reqLo = jMin ?? 0;
  const reqHi = jMax ?? 99;

  if (hi >= reqLo && lo <= reqHi) {
    return { score: 1, evidence: `Your ${lo}–${hi}yr experience fits ${reqLo}–${reqHi}yr requirement` };
  }
  // Underqualified
  if (hi < reqLo) {
    const gap = reqLo - hi;
    return { score: clamp01(1 - gap / 5), evidence: `${gap}yr short of requirement` };
  }
  // Overqualified — soft penalty
  return { score: 0.7, evidence: 'Slightly overqualified' };
}

function normalizeCity(s: string | null | undefined): string {
  return (s || '').trim().toLowerCase();
}

function scoreLocation(c: CandidateInput, j: JobInput) {
  if (j.remote && c.acceptsRemote) {
    return { score: 1, evidence: 'Remote role — you accept remote work' };
  }
  if (!j.city && !j.country) return { score: 0.5, evidence: 'Job location not specified', missing: true };

  const jobCity = normalizeCity(j.city);
  const jobCountry = normalizeCity(j.country);
  const baseCity = normalizeCity(c.baseCity);
  const baseCountry = normalizeCity(c.baseCountry);

  if (jobCity && baseCity && jobCity === baseCity) {
    return { score: 1, evidence: `You are based in ${j.city}` };
  }
  if (jobCountry && baseCountry && jobCountry === baseCountry) {
    const same = 0.85;
    return { score: same, evidence: `Same country (${j.country})` };
  }

  // Accepted cities
  const accepted = (c.acceptedCities || []).map(normalizeCity);
  if (jobCity && accepted.includes(jobCity)) {
    return { score: 0.95, evidence: `${j.city} is on your accepted cities list` };
  }

  if (c.willingToRelocate) {
    return { score: 0.6, evidence: 'Location elsewhere but you are open to relocation' };
  }
  if (j.remote) {
    return { score: 0.4, evidence: 'Remote offered but you prefer on-site' };
  }
  return { score: 0.1, evidence: 'Location mismatch' };
}

function scoreSalary(c: CandidateInput, j: JobInput) {
  if (j.salaryMin == null && j.salaryMax == null) {
    return { score: 0.6, evidence: 'Salary not disclosed', missing: true };
  }
  if (c.salaryMin == null && c.salaryMax == null) {
    return { score: 0.5, evidence: 'Your salary expectation not set', missing: true };
  }
  const jMin = j.salaryMin ?? 0;
  const jMax = j.salaryMax ?? jMin;
  const cMin = c.salaryMin ?? 0;
  const cMax = c.salaryMax ?? cMin;

  // Overlap in ranges
  if (jMax >= cMin && jMin <= cMax) {
    return { score: 1, evidence: 'Salary ranges overlap' };
  }
  // Job below candidate's min
  if (jMax < cMin) {
    const gap = (cMin - jMax) / Math.max(cMin, 1);
    return { score: clamp01(1 - gap), evidence: `Offer below your minimum by ~${Math.round(gap * 100)}%` };
  }
  // Job above candidate's max — that's good
  return { score: 1, evidence: 'Offer exceeds your expectation' };
}

function scoreLanguages(c: CandidateInput, j: JobInput) {
  const req = j.languagesRequired || [];
  if (req.length === 0) return { score: 0.8, evidence: 'No language requirement', missing: true };
  const candidateLangs = new Set(
    (c.candidateLanguages || []).map((l) => l.language.toLowerCase()),
  );
  const missing = req.filter((l) => !candidateLangs.has(l.toLowerCase()));
  if (missing.length === 0) return { score: 1, evidence: 'You speak all required languages' };
  return {
    score: clamp01(1 - missing.length / req.length),
    evidence: `Missing: ${missing.join(', ')}`,
  };
}

function scoreWorkAuth(c: CandidateInput, j: JobInput) {
  const req = j.workAuthRequired || [];
  if (req.length === 0) return { score: 1, evidence: 'No work auth specified', missing: true };
  const have = new Set((c.workAuth || []).map((w) => w.toUpperCase()));
  const ok = req.some((r) => have.has(r.toUpperCase()));
  return {
    score: ok ? 1 : 0,
    evidence: ok ? 'Work authorization satisfied' : 'Work authorization not satisfied',
  };
}

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────

export const matchingService = {
  loadWeights,

  async score(candidate: CandidateInput, job: JobInput): Promise<MatchResult> {
    const w = loadWeights();
    const f = w.weights;

    const roleRes = await scoreRole(candidate, job, w.rules);
    const skillRes = scoreSkills(candidate, job);
    const indRes = scoreIndustry(candidate, job);
    const expRes = scoreExperience(candidate, job);
    const locRes = scoreLocation(candidate, job);
    const salRes = scoreSalary(candidate, job);
    const langRes = scoreLanguages(candidate, job);
    const waRes = scoreWorkAuth(candidate, job);

    const rows: Array<[string, string, number, { score: number; evidence: string; missing?: boolean }]> = [
      ['roleMatch', 'Role fit', f.roleMatch ?? 0, roleRes],
      ['skillMatch', 'Skills', f.skillMatch ?? 0, skillRes],
      ['industryMatch', 'Industry', f.industryMatch ?? 0, indRes],
      ['experienceMatch', 'Experience', f.experienceMatch ?? 0, expRes],
      ['locationMatch', 'Location', f.locationMatch ?? 0, locRes],
      ['salaryMatch', 'Salary', f.salaryMatch ?? 0, salRes],
      ['languageMatch', 'Languages', f.languageMatch ?? 0, langRes],
      ['workAuthMatch', 'Work auth', f.workAuthMatch ?? 0, waRes],
    ];

    const factors: FactorScore[] = rows.map(([key, label, weight, res]) => {
      const effectiveScore = res.missing ? res.score * w.rules.missingDataPenalty : res.score;
      return {
        key,
        label,
        score: effectiveScore,
        weight,
        contribution: effectiveScore * weight,
        evidence: res.evidence,
      };
    });

    const total = factors.reduce((sum, r) => sum + r.contribution, 0);
    const totalWeight = factors.reduce((sum, r) => sum + r.weight, 0) || 1;
    const normalized = Math.round((total / totalWeight) * 100);

    const sorted = [...factors].sort((a, b) => b.score - a.score);
    const topReasons = sorted
      .filter((r) => r.score >= 0.8)
      .slice(0, 3)
      .map((r) => `${r.label}: ${r.evidence}`);
    const topGaps = sorted
      .filter((r) => r.score < 0.5)
      .slice(-3)
      .reverse()
      .map((r) => `${r.label}: ${r.evidence}`);

    return {
      score: normalized,
      band: bandFor(normalized, w.thresholds),
      factors,
      topReasons,
      topGaps,
    };
  },

  /**
   * Score all published jobs for a candidate and return them sorted by
   * descending match score. Cheap enough to run in a single request
   * for small job catalogs; if the table grows large we'll paginate
   * and/or precompute scores on job-create.
   */
  async scoreAllJobsForCandidate(userId: string) {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    const jobs = await prisma.jobDiscovery.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    const results = [];
    for (const job of jobs) {
      const match = await this.score(
        {
          currentRoleId: profile.currentRoleId,
          targetRoleIds: profile.targetRoleIds,
          targetIndustryIds: profile.targetIndustryIds,
          skillIds: profile.skillIds,
          yearsExperienceMin: profile.yearsExperienceMin,
          yearsExperienceMax: profile.yearsExperienceMax,
          salaryMin: profile.salaryMin,
          salaryMax: profile.salaryMax,
          salaryCurrency: profile.salaryCurrency,
          baseCity: profile.baseCity,
          baseCountry: profile.baseCountry,
          acceptsRemote: profile.acceptsRemote,
          willingToRelocate: profile.willingToRelocate,
          acceptedCities: profile.acceptedCities,
          candidateLanguages: (profile.candidateLanguages as any) ?? [],
          workAuth: profile.workAuth,
        },
        {
          id: job.id,
          roleId: job.roleId,
          roleFamily: job.roleFamily,
          skillIds: job.skillIds,
          industryIds: job.industryIds,
          city: job.city,
          country: job.country,
          remote: job.remote,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          yearsExperienceMin: job.yearsExperienceMin,
          yearsExperienceMax: job.yearsExperienceMax,
          languagesRequired: job.languagesRequired,
          workAuthRequired: job.workAuthRequired,
        },
      );
      results.push({ job, match });
    }

    results.sort((a, b) => b.match.score - a.match.score);
    return results;
  },
};
