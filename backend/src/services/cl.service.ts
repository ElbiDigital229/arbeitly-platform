import { prisma } from '../config/prisma.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import { coverLetterRepository } from '../repositories/cover-letter.repository.js';
import { HttpError } from '../errors/HttpError.js';
import { aiComplete } from './external/ai-client.js';

export const clService = {
  async getCoverLetters(userId: string) {
    return coverLetterRepository.findAllByUserId(userId);
  },

  async getCoverLetter(id: string) {
    const cl = await coverLetterRepository.findById(id);
    if (!cl) throw HttpError.notFound('Cover letter not found');
    return cl;
  },

  async getBaseCoverLetter(userId: string) {
    return coverLetterRepository.findBaseByUserId(userId);
  },

  async createCoverLetter(userId: string, title: string, content: string, isBase = false) {
    return coverLetterRepository.create({
      user: { connect: { id: userId } },
      title,
      content,
      isBase,
    });
  },

  async updateCoverLetter(id: string, data: { title?: string; content?: string }) {
    return coverLetterRepository.update(id, data);
  },

  async enhanceCoverLetter(clId: string, customPrompt?: string) {
    const cl = await coverLetterRepository.findById(clId);
    if (!cl) throw HttpError.notFound('Cover letter not found');

    const adminPrompt = await adminPromptRepository.findActiveByType('CL_ENHANCEMENT');
    const systemPrompt = adminPrompt?.prompt || 'You are an expert cover letter writer. Enhance the following cover letter to be more compelling, professional, and tailored. Keep all factual information intact. Return only the enhanced cover letter text.';

    const userMessage = customPrompt
      ? `${systemPrompt}\n\nAdditional instructions: ${customPrompt}\n\nCOVER LETTER:\n${cl.content}`
      : `${systemPrompt}\n\nCOVER LETTER:\n${cl.content}`;

    const text = await aiComplete(userMessage, { maxTokens: 4096 });
    return text.trim();
  },

  async generateForJob(userId: string, jobTitle: string, company: string, jobDescription: string) {
    const baseCL = await coverLetterRepository.findBaseByUserId(userId);
    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });

    const adminPrompt = await adminPromptRepository.findActiveByType('CL_GENERATION');
    const systemPrompt = adminPrompt?.prompt || 'You are an expert cover letter writer. Generate a compelling, personalized cover letter for the job described below. Use the candidate\'s profile and base cover letter as context. Return only the cover letter text.';

    const context = [
      `Candidate: ${profile?.firstName} ${profile?.lastName}`,
      profile?.bio ? `Bio: ${profile.bio}` : '',
      baseCL ? `BASE COVER LETTER:\n${baseCL.content}` : '',
    ].filter(Boolean).join('\n');

    const text = await aiComplete(
      `${systemPrompt}\n\n${context}\n\nJOB TITLE: ${jobTitle}\nCOMPANY: ${company}\nJOB DESCRIPTION:\n${jobDescription}`,
      { maxTokens: 4096 },
    );
    return text.trim();
  },

  async createVersion(baseClId: string, title: string, content: string) {
    const baseCL = await coverLetterRepository.findById(baseClId);
    if (!baseCL) throw HttpError.notFound('Base cover letter not found');

    return coverLetterRepository.create({
      user: { connect: { id: baseCL.userId } },
      title,
      content,
      parentId: baseClId,
      parentType: 'version',
    } as any);
  },

  async createVariant(versionId: string, title: string, content: string) {
    const version = await coverLetterRepository.findById(versionId);
    if (!version) throw HttpError.notFound('Cover letter version not found');

    return coverLetterRepository.create({
      user: { connect: { id: version.userId } },
      title,
      content,
      parentId: versionId,
      parentType: 'variant',
    } as any);
  },

  async getVersionTree(baseClId: string) {
    return coverLetterRepository.findWithChildren(baseClId);
  },
};
