import { Readable } from 'stream';
import { CandidateFileSource } from '@prisma/client';
import { minioClient, ensureBucketExists } from '../config/minio.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';

// Visibility rules:
// - Candidate sees ALL files (their own private + onboarding + employee uploads)
// - Employee sees ONLY: ONBOARDING (shared at signup) + EMPLOYEE (uploaded by team)
//   Employee never sees CANDIDATE_PRIVATE files
const EMPLOYEE_VISIBLE_SOURCES: CandidateFileSource[] = [
  CandidateFileSource.ONBOARDING,
  CandidateFileSource.EMPLOYEE,
];

export const candidateFileService = {
  // Candidate-facing list — sees everything
  async listForCandidate(candidateId: string) {
    return prisma.candidateFile.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Employee-facing list — filtered to non-private files
  async listForEmployee(candidateId: string) {
    return prisma.candidateFile.findMany({
      where: { candidateId, source: { in: EMPLOYEE_VISIBLE_SOURCES } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async upload(
    candidateId: string,
    uploadedById: string,
    file: Express.Multer.File,
    source: CandidateFileSource,
    label?: string,
  ) {
    await ensureBucketExists();
    const storageKey = `candidate-files/${candidateId}/${Date.now()}-${file.originalname}`;
    await minioClient.putObject(env.MINIO_BUCKET, storageKey, Readable.from(file.buffer), file.size, {
      'Content-Type': file.mimetype,
    });

    const record = await prisma.candidateFile.create({
      data: {
        candidateId,
        uploadedById,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        storageKey,
        label: label || null,
        source,
      },
    });

    activityService.log(uploadedById, 'file', 'Uploaded candidate file', file.originalname);
    return record;
  },

  // Download — caller-aware visibility
  async getDownloadStream(candidateId: string, fileId: string, viewer: 'candidate' | 'employee') {
    const file = await prisma.candidateFile.findUnique({ where: { id: fileId } });
    if (!file || file.candidateId !== candidateId) throw HttpError.notFound('File not found');
    if (viewer === 'employee' && file.source === CandidateFileSource.CANDIDATE_PRIVATE) {
      throw HttpError.notFound('File not found');
    }
    const stream = await minioClient.getObject(env.MINIO_BUCKET, file.storageKey);
    return { file, stream };
  },

  async delete(candidateId: string, fileId: string, actorId: string, viewer: 'candidate' | 'employee') {
    const file = await prisma.candidateFile.findUnique({ where: { id: fileId } });
    if (!file || file.candidateId !== candidateId) throw HttpError.notFound('File not found');
    if (viewer === 'employee' && file.source === CandidateFileSource.CANDIDATE_PRIVATE) {
      throw HttpError.notFound('File not found');
    }

    try {
      await minioClient.removeObject(env.MINIO_BUCKET, file.storageKey);
    } catch (err) {
      console.error('Failed to delete file from MinIO:', err);
    }

    await prisma.candidateFile.delete({ where: { id: fileId } });
    activityService.log(actorId, 'file', 'Deleted candidate file', file.filename);
  },
};
