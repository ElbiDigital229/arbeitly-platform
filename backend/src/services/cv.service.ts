import { Readable } from 'stream';
import PDFDocument from 'pdfkit';
import { minioClient, ensureBucketExists } from '../config/minio.js';
import { env } from '../config/env.js';
import { cvRepository } from '../repositories/cv.repository.js';
import { aiService } from './ai.service.js';
import { aiEnricherService } from './ai-enricher.service.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';
import { extractAllImages } from './pdf-image.service.js';
import { prisma } from '../config/prisma.js';
import type { CreateCVDtoType, UpdateCVDtoType } from '../dtos/cv.dto.js';
import type { ParsedCVData } from './ai.service.js';

async function checkAndIncrementCvQuota(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile) return; // no profile = no limit enforcement
  if (profile.cvCreationsUsed >= profile.cvCreationLimit) {
    throw HttpError.forbidden(`CV creation limit reached (${profile.cvCreationLimit}). Upgrade your plan to create more CVs.`);
  }
  await prisma.candidateProfile.update({
    where: { userId },
    data: { cvCreationsUsed: { increment: 1 } },
  });
}

export const cvService = {
  async uploadAndParseCV(userId: string, title: string, file: Express.Multer.File) {
    // 0. Check quota
    await checkAndIncrementCvQuota(userId);

    // 1. AI parsing is the critical path — do this first
    let parsedData: ParsedCVData | null = null;
    try {
      parsedData = await aiService.parseCV(file.buffer, file.mimetype);
    } catch (err: any) {
      console.error('CV parsing failed:', err?.message ?? err);
      if (err?.status) console.error('API status:', err.status, err?.error);
      throw new Error(`CV extraction failed: ${err?.message ?? 'Unknown AI error'}`);
    }

    // 2. Extract photo + signature from PDF if applicable
    if (file.mimetype === 'application/pdf') {
      try {
        const { photo, signature } = await extractAllImages(file.buffer);
        if (parsedData) {
          if (photo) (parsedData as any).photoDataUrl = photo;
          if (signature) (parsedData as any).signatureDataUrl = signature;
        }
      } catch (err: any) {
        console.error('Image extraction failed (non-fatal):', err?.message ?? err);
      }
    }

    // 3. MinIO upload is non-blocking — if it fails, we still save the CV record
    let fileKey: string | null = null;
    try {
      await ensureBucketExists();
      fileKey = `cvs/${userId}/${Date.now()}-${file.originalname}`;
      await minioClient.putObject(env.MINIO_BUCKET, fileKey, Readable.from(file.buffer), file.size, {
        'Content-Type': file.mimetype,
      });
    } catch (err) {
      console.error('MinIO upload failed (non-fatal):', err);
      fileKey = null;
    }

    const cv = await cvRepository.create({
      title,
      originalFileKey: fileKey ?? undefined,
      parsedData: parsedData ?? undefined,
      user: { connect: { id: userId } },
    });

    // 4. Enrich the candidate's profile with structured taxonomy IDs from
    // the CV. Non-blocking — if it fails the CV is still saved, the profile
    // simply doesn't get auto-populated. Only fills fields that are still
    // empty so we never overwrite a manual user choice from onboarding.
    if (parsedData) {
      this.enrichProfileFromCv(userId, parsedData).catch((err) => {
        console.warn('[cv] profile enrichment from CV failed (non-fatal):', err?.message ?? err);
      });
    }

    activityService.log(userId, 'cv', 'Uploaded CV', title);
    return cv;
  },

  /**
   * Background job: read structured fields from a parsed CV and fill in
   * any empty taxonomy columns on the candidate's profile. Existing values
   * (from manual onboarding) are preserved.
   */
  async enrichProfileFromCv(userId: string, parsedData: ParsedCVData) {
    const enriched = await aiEnricherService.enrichCandidateFromCv(parsedData as any);
    const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const update: Record<string, any> = {};
    if (!profile.currentRoleId && enriched.currentRoleId) update.currentRoleId = enriched.currentRoleId;
    if ((!profile.targetRoleIds || profile.targetRoleIds.length === 0) && enriched.targetRoleIds.length) {
      update.targetRoleIds = enriched.targetRoleIds;
    }
    if ((!profile.skillIds || profile.skillIds.length === 0) && enriched.skillIds.length) {
      update.skillIds = enriched.skillIds;
    }
    if ((!profile.targetIndustryIds || profile.targetIndustryIds.length === 0) && enriched.targetIndustryIds.length) {
      update.targetIndustryIds = enriched.targetIndustryIds;
    }
    if (profile.yearsExperienceMin == null && enriched.yearsExperienceMin != null) {
      update.yearsExperienceMin = enriched.yearsExperienceMin;
    }
    if (profile.yearsExperienceMax == null && enriched.yearsExperienceMax != null) {
      update.yearsExperienceMax = enriched.yearsExperienceMax;
    }
    if (!profile.baseCity && enriched.baseCity) update.baseCity = enriched.baseCity;
    if (!profile.baseCountry && enriched.baseCountry) update.baseCountry = enriched.baseCountry;
    if ((!profile.candidateLanguages || (Array.isArray(profile.candidateLanguages) && profile.candidateLanguages.length === 0)) && enriched.candidateLanguages.length) {
      update.candidateLanguages = enriched.candidateLanguages;
    }

    if (Object.keys(update).length === 0) return;
    await prisma.candidateProfile.update({ where: { userId }, data: update });
    console.log(`[cv] enriched candidate ${userId} with ${Object.keys(update).join(', ')}`);
  },

  async createCV(userId: string, dto: CreateCVDtoType) {
    await checkAndIncrementCvQuota(userId);
    const cv = await cvRepository.create({
      title: dto.title,
      editorData: dto.editorData ?? undefined,
      htmlContent: dto.htmlContent ?? undefined,
      style: dto.style ?? undefined,
      language: dto.language ?? undefined,
      user: { connect: { id: userId } },
    });
    activityService.log(userId, 'cv', 'Created CV', dto.title);
    return cv;
  },

  async getCVs(userId: string) {
    return cvRepository.findAllByUserId(userId);
  },

  async getCVById(userId: string, cvId: string) {
    const cv = await cvRepository.findById(cvId);
    if (!cv) {
      throw HttpError.notFound('CV not found');
    }
    if (cv.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this CV');
    }
    return cv;
  },

  async updateCV(userId: string, cvId: string, dto: UpdateCVDtoType) {
    const cv = await cvRepository.findById(cvId);
    if (!cv) {
      throw HttpError.notFound('CV not found');
    }
    if (cv.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this CV');
    }
    const updated = await cvRepository.update(cvId, dto);
    activityService.log(userId, 'cv', 'Updated CV', cv.title);
    return updated;
  },

  async deleteCV(userId: string, cvId: string) {
    const cv = await cvRepository.findById(cvId);
    if (!cv) {
      throw HttpError.notFound('CV not found');
    }
    if (cv.userId !== userId) {
      throw HttpError.forbidden('You do not have access to this CV');
    }

    // Delete file from MinIO if it exists
    if (cv.originalFileKey) {
      try {
        await minioClient.removeObject(env.MINIO_BUCKET, cv.originalFileKey);
      } catch (err) {
        console.error('Failed to delete file from MinIO:', err);
      }
    }

    activityService.log(userId, 'cv', 'Deleted CV', cv.title);
    return cvRepository.delete(cvId);
  },

  async exportCVToPDF(userId: string, cvId: string): Promise<Buffer> {
    const cv = await cvService.getCVById(userId, cvId);
    const data = cv.parsedData as ParsedCVData | null;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(data?.personal?.name ?? cv.title, { align: 'center' });

      if (data?.personal?.email || data?.personal?.phone) {
        doc.fontSize(10).font('Helvetica').moveDown(0.5);
        const contact = [data?.personal?.email, data?.personal?.phone, data?.personal?.location].filter(Boolean).join('  |  ');
        doc.text(contact, { align: 'center' });
      }

      doc.moveDown(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.5);

      // Summary
      if (data?.summary) {
        doc.fontSize(13).font('Helvetica-Bold').text('Summary').moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(data.summary).moveDown(1);
      }

      // Skills
      if (data?.skills && data.skills.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('Skills').moveDown(0.3);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(data.skills.join(', '))
          .moveDown(1);
      }

      // Experience
      if (data?.experience && data.experience.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('Experience').moveDown(0.3);
        for (const exp of data.experience) {
          doc.fontSize(11).font('Helvetica-Bold').text(`${exp.title} — ${exp.company}`);
          doc
            .fontSize(9)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text(exp.dates)
            .fillColor('#000000');
          doc.fontSize(10).font('Helvetica').text(exp.description).moveDown(0.8);
        }
        doc.moveDown(0.5);
      }

      // Education
      if (data?.education && data.education.length > 0) {
        doc.fontSize(13).font('Helvetica-Bold').text('Education').moveDown(0.3);
        for (const edu of data.education) {
          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(edu.degree);
          doc.fontSize(10).font('Helvetica').text(edu.institution);
          doc
            .fontSize(9)
            .font('Helvetica-Oblique')
            .fillColor('#666666')
            .text(edu.dates)
            .fillColor('#000000')
            .moveDown(0.8);
        }
      }

      doc.end();
    });
  },
};
