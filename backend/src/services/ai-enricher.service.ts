import { prisma } from '../config/prisma.js';
import { aiCompleteJson } from './external/ai-client.js';

/**
 * AI-powered enrichment that maps free-text job postings and parsed CVs
 * onto the taxonomy (JobRole / Industry / Skill) so the deterministic
 * matching engine can score them.
 *
 * Run-once-then-cached: each job/CV is enriched on creation and the
 * structured columns are persisted. After that, matching is pure math.
 */

interface EnrichedJob {
  roleKey?: string | null;
  skillKeys: string[];
  industryKeys: string[];
  city?: string | null;
  country?: string | null;
  remote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  yearsExperienceMin?: number | null;
  yearsExperienceMax?: number | null;
  languagesRequired: string[];
  workAuthRequired: string[];
  seniority?: string | null;
}

interface EnrichedCandidate {
  currentRoleKey?: string | null;
  targetRoleKeys: string[];
  skillKeys: string[];
  industryKeys: string[];
  yearsExperienceMin?: number | null;
  yearsExperienceMax?: number | null;
  baseCity?: string | null;
  baseCountry?: string | null;
  candidateLanguages: Array<{ language: string; level: string }>;
}

/** Build a compact catalog string the LLM can pick from. */
async function buildTaxonomyCatalog() {
  const [roles, skills, industries] = await Promise.all([
    prisma.jobRole.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.skill.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.industry.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);
  return {
    roles,
    skills,
    industries,
    catalogText: [
      `ROLES (key — name [family]):`,
      ...roles.map((r) => `  ${r.key} — ${r.name} [${r.family}]`),
      ``,
      `INDUSTRIES (key — name):`,
      ...industries.map((i) => `  ${i.key} — ${i.name}`),
      ``,
      `SKILLS (key — name):`,
      ...skills.map((s) => `  ${s.key} — ${s.name}`),
    ].join('\n'),
  };
}

/** Resolve LLM-returned keys into DB IDs, dropping anything that doesn't exist. */
async function resolveKeys(keys: string[], table: 'jobRole' | 'industry' | 'skill') {
  if (!keys?.length) return [];
  const rows = await (prisma as any)[table].findMany({
    where: { key: { in: keys } },
    select: { id: true, key: true },
  });
  return rows.map((r: any) => r.id);
}

async function resolveOneKey(key: string | undefined | null, table: 'jobRole') {
  if (!key) return null;
  const row = await (prisma as any)[table].findUnique({ where: { key } });
  return row?.id ?? null;
}

export const aiEnricherService = {
  /**
   * Take a free-text job posting and return structured fields ready to
   * write to JobDiscovery. Costs ~1 LLM call per job, run once on create.
   */
  async enrichJob(input: { title: string; company?: string; description?: string; requirements?: string; location?: string; salary?: string }) {
    const { catalogText } = await buildTaxonomyCatalog();

    const prompt = `You extract structured data from job postings for a job-matching platform.

You will be given a job posting (title + description + optional location/salary). Your task: pick the matching keys from the taxonomy below and extract numeric/location fields.

═══════════════ TAXONOMY ═══════════════
${catalogText}

═══════════════ JOB POSTING ═══════════════
Title: ${input.title}
${input.company ? `Company: ${input.company}` : ''}
${input.location ? `Location: ${input.location}` : ''}
${input.salary ? `Salary text: ${input.salary}` : ''}
${input.description ? `\nDescription:\n${input.description}` : ''}
${input.requirements ? `\nRequirements:\n${input.requirements}` : ''}

═══════════════ INSTRUCTIONS ═══════════════
Return STRICT JSON with this exact shape (no prose, no markdown fences):
{
  "roleKey": "<single best matching role key from the taxonomy, or null>",
  "skillKeys": ["<skill key>", ...],         // only keys that appear in the taxonomy
  "industryKeys": ["<industry key>", ...],
  "city": "<city name or null>",
  "country": "<country name or null>",
  "remote": <true|false>,                    // true if remote/hybrid is offered
  "salaryMin": <number or null>,             // annual, in the local currency
  "salaryMax": <number or null>,
  "salaryCurrency": "<EUR|USD|GBP|...>",
  "yearsExperienceMin": <number or null>,
  "yearsExperienceMax": <number or null>,
  "languagesRequired": ["English", "German", ...],
  "workAuthRequired": ["EU", "US", ...],     // empty array if not stated
  "seniority": "junior|mid|senior|lead|null"
}

Rules:
- ONLY use keys that exist in the taxonomy above. If you can't find a good match, omit it.
- Be strict with skills: only include skills explicitly mentioned in the posting.
- If salary is given as a range like "60k-80k EUR", return salaryMin: 60000, salaryMax: 80000.
- If only "Berlin" is mentioned, set city: "Berlin", country: "Germany".`;

    const raw = await aiCompleteJson<EnrichedJob>(prompt, { maxTokens: 1024 });

    // Resolve to DB ids
    const [roleId, skillIds, industryIds] = await Promise.all([
      resolveOneKey(raw.roleKey ?? null, 'jobRole'),
      resolveKeys(raw.skillKeys ?? [], 'skill'),
      resolveKeys(raw.industryKeys ?? [], 'industry'),
    ]);

    const role = roleId ? await prisma.jobRole.findUnique({ where: { id: roleId } }) : null;

    return {
      roleId,
      roleFamily: role?.family ?? null,
      skillIds,
      industryIds,
      city: raw.city ?? null,
      country: raw.country ?? null,
      remote: !!raw.remote,
      salaryMin: raw.salaryMin ?? null,
      salaryMax: raw.salaryMax ?? null,
      salaryCurrency: raw.salaryCurrency ?? 'EUR',
      yearsExperienceMin: raw.yearsExperienceMin ?? null,
      yearsExperienceMax: raw.yearsExperienceMax ?? null,
      languagesRequired: raw.languagesRequired ?? [],
      workAuthRequired: raw.workAuthRequired ?? [],
      seniority: raw.seniority ?? null,
    };
  },

  /**
   * Take a parsed CV (the JSON the existing aiService.parseCV returns) and
   * map it onto the taxonomy. Costs ~1 LLM call per CV, run once on upload.
   */
  async enrichCandidateFromCv(parsedCv: Record<string, any>) {
    const { catalogText } = await buildTaxonomyCatalog();

    // Trim CV JSON to keep prompt size sane
    const cvSnippet = JSON.stringify(parsedCv).slice(0, 8000);

    const prompt = `You extract a candidate profile from a parsed CV for a job-matching platform.

═══════════════ TAXONOMY ═══════════════
${catalogText}

═══════════════ PARSED CV (JSON) ═══════════════
${cvSnippet}

═══════════════ INSTRUCTIONS ═══════════════
Return STRICT JSON with this exact shape (no prose, no markdown fences):
{
  "currentRoleKey": "<best matching role key for the candidate's most recent job, or null>",
  "targetRoleKeys": ["<role keys the candidate seems to be aiming for>"],
  "skillKeys": ["<skill key>", ...],
  "industryKeys": ["<industry keys the candidate has worked in>"],
  "yearsExperienceMin": <total years of professional experience as a number or null>,
  "yearsExperienceMax": <same number or null>,
  "baseCity": "<city or null>",
  "baseCountry": "<country or null>",
  "candidateLanguages": [{ "language": "English", "level": "C2" }, ...]
}

Rules:
- ONLY use keys that exist in the taxonomy above.
- Skills: include skills that appear in the CV (work experience, projects, skills section). Prefer canonical names.
- yearsExperience: count from earliest job start date to latest end date (or today if still employed).
- Languages: extract language proficiency if mentioned (CEFR levels A1–C2 or "Native"). Empty array if absent.
- targetRoleKeys: same as currentRoleKey unless the CV explicitly states a career-change goal.`;

    const raw = await aiCompleteJson<EnrichedCandidate>(prompt, { maxTokens: 1024 });

    const [currentRoleId, targetRoleIds, skillIds, industryIds] = await Promise.all([
      resolveOneKey(raw.currentRoleKey ?? null, 'jobRole'),
      resolveKeys(raw.targetRoleKeys ?? [], 'jobRole'),
      resolveKeys(raw.skillKeys ?? [], 'skill'),
      resolveKeys(raw.industryKeys ?? [], 'industry'),
    ]);

    return {
      currentRoleId,
      targetRoleIds,
      skillIds,
      targetIndustryIds: industryIds,
      yearsExperienceMin: raw.yearsExperienceMin ?? null,
      yearsExperienceMax: raw.yearsExperienceMax ?? null,
      baseCity: raw.baseCity ?? null,
      baseCountry: raw.baseCountry ?? null,
      candidateLanguages: raw.candidateLanguages ?? [],
    };
  },
};
