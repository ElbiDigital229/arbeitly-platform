import { Readable } from 'stream';
import PDFDocument from 'pdfkit';
import { minioClient, ensureBucketExists } from '../config/minio.js';
import { env } from '../config/env.js';
import { cvRepository } from '../repositories/cv.repository.js';
import { aiService } from './ai.service.js';
import { HttpError } from '../errors/HttpError.js';
import { extractLargestImage } from './pdf-image.service.js';
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
    }

    // 2. Extract photo from PDF if applicable
    if (file.mimetype === 'application/pdf') {
      try {
        const photoDataUrl = await extractLargestImage(file.buffer);
        if (photoDataUrl && parsedData) {
          (parsedData as any).photoDataUrl = photoDataUrl;
        }
      } catch (err: any) {
        console.error('Photo extraction failed (non-fatal):', err?.message ?? err);
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

    return cv;
  },

  async createCV(userId: string, dto: CreateCVDtoType) {
    await checkAndIncrementCvQuota(userId);
    return cvRepository.create({
      title: dto.title,
      editorData: dto.editorData ?? undefined,
      htmlContent: dto.htmlContent ?? undefined,
      style: dto.style ?? undefined,
      language: dto.language ?? undefined,
      user: { connect: { id: userId } },
    });
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
    return cvRepository.update(cvId, dto);
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
