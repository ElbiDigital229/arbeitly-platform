import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { jobDiscoveryRepository } from '../repositories/job-discovery.repository.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import { cvEnhanceService } from './cv-enhance.service.js';
import { HttpError } from '../errors/HttpError.js';
import type { CreateJobDiscoveryDtoType } from '../dtos/job-discovery.dto.js';

const getClient = () => new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

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
    return jobDiscoveryRepository.create({
      ...dto,
      url: dto.url || undefined,
      addedBy: { connect: { id: addedById } },
    });
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

    const cvData = candidate.cvs[0]?.parsedData;
    const profile = candidate.profile;

    const adminPrompt = await adminPromptRepository.findActiveByType('JOB_MATCHING');
    const systemPrompt = adminPrompt?.prompt || 'You are a job matching expert. Score how well this candidate matches the job on a scale of 0-100. Return JSON: {"score": number, "reasoning": "brief explanation"}';

    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${systemPrompt}

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Description: ${job.description || 'Not provided'}
Requirements: ${job.requirements || 'Not specified'}

CANDIDATE:
Name: ${profile?.firstName} ${profile?.lastName}
Location: ${profile?.location || 'Not specified'}
Bio: ${profile?.bio || ''}
${cvData ? `CV Summary: ${JSON.stringify(cvData).slice(0, 3000)}` : 'No CV data available'}`,
      }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') throw new Error('No AI response');

    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

    try {
      return JSON.parse(jsonText);
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
