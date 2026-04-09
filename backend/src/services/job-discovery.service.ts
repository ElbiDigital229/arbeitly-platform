import { prisma } from '../config/prisma.js';
import { jobDiscoveryRepository } from '../repositories/job-discovery.repository.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import { cvEnhanceService } from './cv-enhance.service.js';
import { clService } from './cl.service.js';
import { HttpError } from '../errors/HttpError.js';
import { aiCompleteJson } from './external/ai-client.js';
import { aiEnricherService } from './ai-enricher.service.js';
import { matchingService } from './matching.service.js';
import type { CreateJobDiscoveryDtoType } from '../dtos/job-discovery.dto.js';

const DEFAULT_JOB_MATCHING_PROMPT = `You are an expert job-matching analyst for Arbeitly, a German job-search platform.
You will be given a job posting and a complete candidate dossier consisting of: (1) profile basics, (2) full onboarding questionnaire answers, (3) the candidate's base CV (parsed JSON), and (4) FAQ / interview-prep items written by the candidate's coach.

IMPORTANT — the onboarding data may contain free-text "Other" fields that the candidate typed in themselves. These are EQUAL in weight to taxonomy-selected values:
- "currentRoleIdOther": the candidate's current role title if not in the standard list
- "targetRoleIdsOther": target role titles the candidate typed in
- "skillIdsOther": additional skills not in the standard taxonomy
Always cross-reference these free-text fields against the job requirements.

Career switchers: if "switchCareerPath" is "yes" or "maybe", the candidate is open to changing fields. In that case, be more lenient on exact role/title mismatch and instead focus on transferable skills, education, and the candidate's stated target roles.

Score the match on a scale of 0–100 using these bands:
- 95–100: Near-perfect match — role, skills, experience, location, and language all align precisely
- 85–94: Excellent fit — meets nearly all requirements, at most one minor gap
- 75–84: Strong fit — meets most requirements, one or two gaps the candidate could close quickly
- 65–74: Good fit — clear alignment on role and core skills, but notable gaps (e.g. language level, exact seniority, or location)
- 50–64: Possible fit — meaningful overlap in domain or skills, but significant mismatches in multiple areas
- 30–49: Weak fit — only superficial overlap; different domain, seniority, or location with little flexibility
- 0–29: Poor fit — wrong domain, missing critical requirements, or fundamental misalignment

Allocate your scoring weight approximately as follows:
1. Role / title alignment (~30%): Compare the job title and role to the candidate's current role, target roles (including "Other" free-text fields), and CV work history. Same role family or closely related titles score high.
2. Skills overlap (~25%): Match job-required skills against the candidate's taxonomy skills, "skillIdsOther" free-text skills, and skills demonstrated in the CV.
3. Experience / seniority (~15%): Years of experience vs. job requirements; seniority level alignment.
4. Location compatibility (~10%): Candidate's base city/country vs. job location, relocation willingness, remote preferences, and accepted cities from onboarding.
5. Language & work authorization (~10%): Required language levels vs. candidate's stated levels; visa/work auth status.
6. Salary & career goals (~10%): Salary range overlap; alignment with career goals, motivation, and preferences from onboarding and FAQ.

Be evidence-based — cite specific facts from the candidate dossier in your reasoning. When a candidate's role or skills closely match the job but minor factors (salary, exact location) differ, the score should still be high.`;

export const jobDiscoveryService = {
  async getJobs() {
    return jobDiscoveryRepository.findAll();
  },

  async getJob(id: string) {
    const job = await jobDiscoveryRepository.findById(id);
    if (!job) throw HttpError.notFound('Job not found');
    return job;
  },

  async createJob(dto: CreateJobDiscoveryDtoType, addedById: string) {
    // Try to enrich with AI — non-blocking if it fails (the job still gets
    // created as free-text and will simply score lower until re-enriched).
    let enriched: Awaited<ReturnType<typeof aiEnricherService.enrichJob>> | null = null;
    try {
      enriched = await aiEnricherService.enrichJob({
        title: dto.title,
        company: dto.company,
        description: dto.description,
        requirements: dto.requirements,
        location: dto.location,
        salary: dto.salary,
      });
    } catch (err: any) {
      console.warn('[job-discovery] AI enrichment failed (non-fatal):', err?.message ?? err);
    }

    return jobDiscoveryRepository.create({
      ...dto,
      url: dto.url || undefined,
      addedBy: { connect: { id: addedById } },
      ...(enriched ?? {}),
    });
  },

  async bulkCreate(jobs: CreateJobDiscoveryDtoType[], addedById: string) {
    // Enrich each one with AI; on failure, fall back to free-text only.
    // Done sequentially so we don't fan out and burn rate limits on big imports.
    let created = 0;
    for (const j of jobs) {
      let enriched: Awaited<ReturnType<typeof aiEnricherService.enrichJob>> | null = null;
      try {
        enriched = await aiEnricherService.enrichJob({
          title: j.title,
          company: j.company,
          description: j.description,
          requirements: j.requirements,
          location: j.location,
          salary: j.salary,
        });
      } catch (err: any) {
        console.warn('[job-discovery] bulk AI enrichment failed for', j.title, err?.message ?? err);
      }
      await prisma.jobDiscovery.create({
        data: {
          title: j.title,
          company: j.company,
          url: j.url || null,
          description: j.description || null,
          location: j.location || null,
          salary: j.salary || null,
          requirements: j.requirements || null,
          addedById,
          ...(enriched ?? {}),
        },
      });
      created++;
    }
    return { created };
  },

  /**
   * Re-run AI enrichment on an existing job. Useful for back-filling
   * structured fields on jobs that were created before the enricher
   * existed, or after editing the description.
   */
  async reEnrichJob(jobId: string) {
    const job = await jobDiscoveryRepository.findById(jobId);
    if (!job) throw HttpError.notFound('Job not found');
    const enriched = await aiEnricherService.enrichJob({
      title: job.title,
      company: job.company,
      description: job.description ?? undefined,
      requirements: job.requirements ?? undefined,
      location: job.location ?? undefined,
      salary: job.salary ?? undefined,
    });
    return jobDiscoveryRepository.update(jobId, enriched);
  },

  async deleteJob(id: string) {
    const job = await jobDiscoveryRepository.findById(id);
    if (!job) throw HttpError.notFound('Job not found');
    // Delete queue items first
    await prisma.candidateJobQueue.deleteMany({ where: { jobId: id } });
    return jobDiscoveryRepository.delete(id);
  },

  async scoreRelevance(jobId: string, candidateId: string): Promise<{ score: number; reasoning: string }> {
    const job = await jobDiscoveryRepository.findById(jobId);
    if (!job) throw HttpError.notFound('Job not found');

    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: { profile: true, cvs: { where: { isBase: true }, take: 1 } },
    });
    if (!candidate) throw HttpError.notFound('Candidate not found');

    const profile = candidate.profile;
    const cvData = candidate.cvs[0]?.parsedData;
    const onboarding = (profile?.onboardingData || {}) as Record<string, any>;
    const faqItems = await prisma.faqItem.findMany({
      where: { candidateId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { question: true, answer: true, category: true },
    });

    const adminPrompt = await adminPromptRepository.findActiveByType('JOB_MATCHING');
    const systemPrompt = adminPrompt?.prompt || DEFAULT_JOB_MATCHING_PROMPT;

    // Build candidate context block from onboarding answers (skip empty)
    const onboardingLines = Object.entries(onboarding)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
      .join('\n');

    const faqBlock = faqItems.length
      ? faqItems.map(f => `Q: ${f.question}\nA: ${f.answer}${f.category ? ` [${f.category}]` : ''}`).join('\n\n')
      : 'No FAQ items provided.';

    const prompt = `${systemPrompt}

═══════════════ JOB ═══════════════
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Salary: ${job.salary || 'Not specified'}
Description:
${job.description || 'Not provided'}

Requirements:
${job.requirements || 'Not specified'}

═══════════════ CANDIDATE PROFILE ═══════════════
Name: ${profile?.firstName || ''} ${profile?.lastName || ''}
Location: ${profile?.location || 'Not specified'}
Phone: ${profile?.phone || '—'}
LinkedIn: ${profile?.linkedinUrl || '—'}
Bio:
${profile?.bio || '—'}

═══════════════ ONBOARDING ANSWERS ═══════════════
${onboardingLines || 'No onboarding data provided.'}

═══════════════ BASE CV (parsed) ═══════════════
${cvData ? JSON.stringify(cvData).slice(0, 6000) : 'No base CV available.'}

═══════════════ FAQ / INTERVIEW PREP ═══════════════
${faqBlock}

═══════════════ TASK ═══════════════
Score how well this candidate matches the job above on a scale of 0–100 using the weighted criteria and bands described above.
Pay special attention to: (a) role/title alignment including free-text "Other" fields, (b) whether "switchCareerPath" indicates openness to career change, (c) transferable skills from CV work history even if not in taxonomy.
Return STRICT JSON only: {"score": <number 0-100>, "reasoning": "<2-4 sentence explanation citing specific evidence from the candidate dossier>"}`;

    try {
      return await aiCompleteJson<{ score: number; reasoning: string }>(prompt, { maxTokens: 1024 });
    } catch {
      return { score: 0, reasoning: 'Failed to parse AI response' };
    }
  },

  async addToQueue(jobId: string, candidateId: string, employeeId: string) {
    const job = await jobDiscoveryRepository.findById(jobId);
    if (!job) throw HttpError.notFound('Job not found');

    // Check candidate is assigned to this employee
    const candidate = await prisma.user.findFirst({
      where: { id: candidateId, assignedEmployeeId: employeeId },
    });
    if (!candidate) throw HttpError.badRequest('Candidate not assigned to you');

    // Check not already queued
    const existing = await prisma.candidateJobQueue.findFirst({
      where: { jobId, candidateId },
    });
    if (existing) throw HttpError.badRequest('Job already in candidate queue');

    // Score relevance (AI + deterministic)
    let relevanceScore: number | undefined;
    let reasoning: string | undefined;
    let matchFactors: any | undefined;

    // 1. AI scoring — contextual, returns score + reasoning
    try {
      const result = await this.scoreRelevance(jobId, candidateId);
      relevanceScore = result.score;
      reasoning = result.reasoning;
    } catch { /* AI score failed, continue without it */ }

    // 2. Deterministic scoring — factor breakdown (non-blocking, pure CPU)
    try {
      const profile = await prisma.candidateProfile.findUnique({ where: { userId: candidateId } });
      if (profile) {
        const deterministicResult = await matchingService.score(
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
            acceptsRemote: profile.acceptsRemote ?? false,
            willingToRelocate: profile.willingToRelocate ?? false,
            acceptedCities: profile.acceptedCities,
            candidateLanguages: (profile.candidateLanguages as any) ?? [],
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
        matchFactors = deterministicResult;
      }
    } catch { /* deterministic score failed, continue without it */ }

    // Create queue item
    const queueItem = await prisma.candidateJobQueue.create({
      data: {
        candidate: { connect: { id: candidateId } },
        job: { connect: { id: jobId } },
        employee: { connect: { id: employeeId } },
        relevanceScore,
        reasoning,
        matchFactors,
        status: 'PENDING',
      },
    });

    // Generate tailored CV in background
    this.generateAndLink(queueItem.id, candidateId, job).catch(err => {
      console.error('[JobDiscovery] CV generation failed:', err);
    });

    return queueItem;
  },

  async generateAndLink(queueItemId: string, candidateId: string, job: any) {
    const baseCv = await prisma.cV.findFirst({ where: { userId: candidateId, isBase: true } });
    if (!baseCv) {
      // No base CV → nothing to tailor. Mark the queue item so the employee
      // sees the gap and can upload one.
      await prisma.candidateJobQueue.update({
        where: { id: queueItemId },
        data: { status: 'NO_BASE_CV' },
      });
      return;
    }

    // 1. Tailored CV — critical path. If this fails, abort before touching
    //    the queue or creating a phantom application.
    let generatedCv: Awaited<ReturnType<typeof prisma.cV.create>>;
    try {
      const tailoredData = await cvEnhanceService.generateTailoredCV(
        baseCv.id,
        job.description || job.requirements || job.title,
        job.title,
        job.company,
      );
      generatedCv = await prisma.cV.create({
        data: {
          userId: candidateId,
          title: `${job.title} @ ${job.company}`,
          parsedData: tailoredData,
          style: baseCv.style,
          language: baseCv.language,
          parentId: baseCv.id,
          parentType: 'variant',
          generatedForJobId: job.id,
        },
      });
    } catch (err) {
      console.error('[JobDiscovery] CV tailoring failed:', err);
      await prisma.candidateJobQueue.update({
        where: { id: queueItemId },
        data: { status: 'CV_FAILED' },
      });
      return;
    }

    // 2. Tailored cover letter — non-blocking. If the candidate has no
    //    base CL, or CL generation fails, we still ship the CV and the
    //    TO_APPLY application. The employee can hand-write a CL later.
    let generatedClId: string | null = null;
    try {
      const baseCl = await prisma.coverLetter.findFirst({
        where: { userId: candidateId, isBase: true },
      });
      if (baseCl) {
        const clText = await clService.generateForJob(
          candidateId,
          job.title,
          job.company,
          job.description || job.requirements || job.title,
        );
        const generatedCl = await prisma.coverLetter.create({
          data: {
            userId: candidateId,
            title: `${job.title} @ ${job.company}`,
            content: clText,
            language: baseCl.language,
            parentId: baseCl.id,
            parentType: 'variant',
          },
        });
        generatedClId = generatedCl.id;
      }
    } catch (err) {
      console.error('[JobDiscovery] CL generation failed (non-fatal):', err);
    }

    // 3. Create the TO_APPLY application, then link both artifacts + the
    //    application back to the queue item in a single update so the
    //    candidate portal and employee portal see a consistent pipeline row.
    const application = await prisma.application.create({
      data: {
        userId: candidateId,
        jobTitle: job.title,
        companyName: job.company,
        jobUrl: job.url || undefined,
        jobDescription: job.description || undefined,
        status: 'TO_APPLY',
        source: 'discovery',
        cvUsed: generatedCv.id,
        clUsed: generatedClId ?? undefined,
      },
    });

    await prisma.candidateJobQueue.update({
      where: { id: queueItemId },
      data: {
        status: generatedClId ? 'READY' : 'CV_GENERATED',
        generatedCvId: generatedCv.id,
        generatedClId,
        applicationId: application.id,
      },
    });
  },

  /**
   * Employee-side: list jobs with deterministic match scores attached
   * for one or more of the employee's assigned candidates. Filters out
   * jobs where no selected candidate clears `minScore`.
   *
   * Authorization: caller must own all candidateIds (assigned employee
   * relationship). Admin can pass any candidateIds.
   */
  async listJobsWithMatches(opts: {
    callerId: string;
    callerRole: 'ADMIN' | 'EMPLOYEE';
    candidateIds: string[];
    minScore?: number;
  }) {
    const { callerId, callerRole, candidateIds, minScore } = opts;
    if (candidateIds.length === 0) return [];

    if (callerRole === 'EMPLOYEE') {
      const owned = await prisma.user.findMany({
        where: { id: { in: candidateIds }, assignedEmployeeId: callerId },
        select: { id: true },
      });
      if (owned.length !== candidateIds.length) {
        throw HttpError.forbidden('One or more candidates are not assigned to you');
      }
    }

    return matchingService.scoreJobsForCandidates(candidateIds, { minScore });
  },

  async getCandidateQueue(candidateId: string) {
    return prisma.candidateJobQueue.findMany({
      where: { candidateId },
      include: {
        job: true,
        generatedCv: { select: { id: true, title: true } },
        generatedCl: { select: { id: true, title: true } },
        application: { select: { id: true, status: true, appliedAt: true, jobUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Candidate-side pipeline: read-only view of what the candidate's assigned
   * employee has queued and prepared on their behalf. Mirrors getCandidateQueue
   * but scoped to the authenticated candidate themselves.
   */
  async getPipelineForCandidate(candidateId: string) {
    return prisma.candidateJobQueue.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            id: true, title: true, company: true, location: true,
            salary: true, url: true, description: true,
          },
        },
        generatedCv: { select: { id: true, title: true } },
        // Include CL content directly — candidates don't have a standalone
        // cover-letter read endpoint, so the pipeline response is the
        // simplest way to surface the tailored text to them.
        generatedCl: { select: { id: true, title: true, content: true } },
        application: { select: { id: true, status: true, appliedAt: true, jobUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Employee-side: transition a READY queue item to APPLIED. Updates the
   * linked application status + appliedAt atomically. Verifies the caller
   * is the assigned employee for the candidate on this queue item.
   */
  async markQueueApplied(queueItemId: string, employeeId: string, jobUrl?: string) {
    const queueItem = await prisma.candidateJobQueue.findUnique({
      where: { id: queueItemId },
      include: { application: true },
    });
    if (!queueItem) throw HttpError.notFound('Queue item not found');
    if (queueItem.employeeId !== employeeId) {
      throw HttpError.forbidden('You do not own this queue item');
    }
    if (!queueItem.applicationId) {
      throw HttpError.badRequest('Queue item has no linked application yet — tailoring may still be in progress');
    }
    if (queueItem.status !== 'READY' && queueItem.status !== 'CV_GENERATED') {
      throw HttpError.badRequest(`Cannot mark applied from status ${queueItem.status}`);
    }

    const now = new Date();
    const [updatedQueue] = await prisma.$transaction([
      prisma.candidateJobQueue.update({
        where: { id: queueItemId },
        data: { status: 'APPLIED', appliedAt: now },
      }),
      prisma.application.update({
        where: { id: queueItem.applicationId },
        data: {
          status: 'APPLIED',
          appliedAt: now,
          ...(jobUrl ? { jobUrl } : {}),
        },
      }),
    ]);
    return updatedQueue;
  },
};
