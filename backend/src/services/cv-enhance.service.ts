import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { adminPromptRepository } from '../repositories/admin-prompt.repository.js';
import { HttpError } from '../errors/HttpError.js';

const getClient = () => new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const cvEnhanceService = {
  async enhanceCV(cvId: string, customPrompt?: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv || !cv.parsedData) throw HttpError.notFound('CV not found or has no parsed data');

    const adminPrompt = await adminPromptRepository.findActiveByType('CV_ENHANCEMENT');
    const systemPrompt = adminPrompt?.prompt || 'You are an expert CV writer. Enhance the following CV data to be more impactful, professional, and ATS-friendly. Keep all factual information intact. Return the same JSON structure.';

    const userMessage = customPrompt
      ? `${systemPrompt}\n\nAdditional instructions: ${customPrompt}\n\nCV DATA:\n${JSON.stringify(cv.parsedData, null, 2)}`
      : `${systemPrompt}\n\nCV DATA:\n${JSON.stringify(cv.parsedData, null, 2)}`;

    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16384,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') throw new Error('No AI response');

    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```')) jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

    return JSON.parse(jsonText);
  },

  async createVersion(baseCvId: string, title: string, enhancedData: any) {
    const baseCv = await prisma.cV.findUnique({ where: { id: baseCvId } });
    if (!baseCv) throw HttpError.notFound('Base CV not found');

    return prisma.cV.create({
      data: {
        userId: baseCv.userId,
        title,
        parsedData: enhancedData,
        editorData: baseCv.editorData,
        htmlContent: baseCv.htmlContent,
        style: baseCv.style,
        language: baseCv.language,
        parentId: baseCvId,
        parentType: 'version',
      },
    });
  },

  async createVariant(versionId: string, title: string, enhancedData: any) {
    const version = await prisma.cV.findUnique({ where: { id: versionId } });
    if (!version) throw HttpError.notFound('CV version not found');

    return prisma.cV.create({
      data: {
        userId: version.userId,
        title,
        parsedData: enhancedData,
        editorData: version.editorData,
        htmlContent: version.htmlContent,
        style: version.style,
        language: version.language,
        parentId: versionId,
        parentType: 'variant',
      },
    });
  },

  async getVersionTree(baseCvId: string) {
    return prisma.cV.findUnique({
      where: { id: baseCvId },
      include: {
        children: {
          include: { children: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  async generateTailoredCV(baseCvId: string, jobDescription: string, jobTitle: string, company: string) {
    const cv = await prisma.cV.findUnique({ where: { id: baseCvId } });
    if (!cv || !cv.parsedData) throw HttpError.notFound('Base CV not found');

    const client = getClient();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16384,
      messages: [{
        role: 'user',
        content: `You are an expert CV tailor. Modify the following CV to be perfectly tailored for the job described below. Emphasize relevant experience and skills. Keep all factual information intact — do NOT invent new experiences. Return the same JSON structure.

JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION:
${jobDescription}

CV DATA:
${JSON.stringify(cv.parsedData, null, 2)}`,
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

    return JSON.parse(jsonText);
  },
};
