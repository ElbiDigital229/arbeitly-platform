import { prisma } from '../config/prisma.js';
import { jobDiscoveryRepository } from '../repositories/job-discovery.repository.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import { cvEnhanceService } from './cv-enhance.service.js';
import { HttpError } from '../errors/HttpError.js';
import { aiCompleteJson } from './external/ai-client.js';
import { aiEnricherService } from './ai-enricher.service.js';
import { matchingService } from './matching.service.js';
import type { CreateJobDiscoveryDtoType } from '../dtos/job-discovery.dto.js';

const DEFAULT_JOB_MATCHING_PROMPT = `You are an expert job-matching analyst for Arbeitly, a German job-search platform.
You will be given a job posting and a complete candidate dossier consisting of: (1) profile basics, (2) full onboarding questionnaire answers, (3) the candidate's base CV (parsed JSON), and (4) FAQ / interview-prep items written by the candidate's coach.

Score the match on a scale of 0–100 where:
- 90–100: Excellent fit — meets nearly all hard requirements, location/language aligned, career goals match
- 70–89: Strong fit — meets most hard requirements, minor gaps the candidate could close quickly
- 50–69: Possible fit — meaningful overlap but significant gaps in skills, location, language, or seniority
- 30–49: Weak fit — only superficial overlap
- 0–29: Poor fit or wrong domain entirely

Consider in order of importance:
1. Hard requirements (must-have skills, certifications, language level, work authorization)
2. Role/title alignment with the candidate's target roles from onboarding
3. Years of experience and seniority vs. job seniority
4. Location and relocation willingness
5. Salary expectations vs. job offer
6. Career goals, motivation, and any constraints expressed in onboarding/FAQ

Be strict and evidence-based — cite specific facts from the candidate dossier in your reasoning.`;

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
Score how well this candidate matches the job above on a scale of 0–100.
Weigh role/title fit, required skills vs CV experience, location compatibility (including relocation willingness from onboarding), language requirements, salary expectations, career goals from onboarding, and any preferences expressed in FAQ items.
Return STRICT JSON only: {"score": <number 0-100>, "reasoning": "<2-4 sentence explanation citing specific evidence>"}`;

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

    // Score relevance
    let relevanceScore: number | undefined;
    try {
      const result = await this.scoreRelevance(jobId, candidateId);
      relevanceScore = result.score;
    } catch { /* score failed, continue without it */ }

    // Create queue item
    const queueItem = await prisma.candidateJobQueue.create({
      data: {
        candidate: { connect: { id: candidateId } },
        job: { connect: { id: jobId } },
        employee: { connect: { id: employeeId } },
        relevanceScore,
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
      await prisma.candidateJobQueue.update({ where: { id: queueItemId }, data: { status: 'CV_GENERATED' } });
      return;
    }

    try {
      const tailoredData = await cvEnhanceService.generateTailoredCV(
        baseCv.id,
        job.description || job.requirements || job.title,
        job.title,
        job.company,
      );

      const generatedCv = await prisma.cV.create({
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

      await prisma.candidateJobQueue.update({
        where: { id: queueItemId },
        data: { status: 'CV_GENERATED', generatedCvId: generatedCv.id },
      });

      // Create TO_APPLY application
      await prisma.application.create({
        data: {
          userId: candidateId,
          jobTitle: job.title,
          companyName: job.company,
          jobUrl: job.url || undefined,
          jobDescription: job.description || undefined,
          status: 'TO_APPLY',
          source: 'discovery',
          cvUsed: generatedCv.id,
        },
      });
    } catch (err) {
      console.error('[JobDiscovery] Generation error:', err);
      await prisma.candidateJobQueue.update({ where: { id: queueItemId }, data: { status: 'CV_GENERATED' } });
    }
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
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
