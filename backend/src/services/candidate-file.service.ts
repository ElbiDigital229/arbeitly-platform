import { Readable } from 'stream';
import { minioClient, ensureBucketExists } from '../config/minio.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../errors/HttpError.js';
import { activityService } from './activity.service.js';

export const candidateFileService = {
  async list(candidateId: string) {
    return prisma.candidateFile.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async upload(candidateId: string, uploadedById: string, file: Express.Multer.File, label?: string) {
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
      },
    });

    activityService.log(uploadedById, 'file', 'Uploaded candidate file', file.originalname);
    return record;
  },

  async getDownloadStream(candidateId: string, fileId: string) {
    const file = await prisma.candidateFile.findUnique({ where: { id: fileId } });
    if (!file || file.candidateId !== candidateId) throw HttpError.notFound('File not found');
    const stream = await minioClient.getObject(env.MINIO_BUCKET, file.storageKey);
    return { file, stream };
  },

  async delete(candidateId: string, fileId: string, employeeId: string) {
    const file = await prisma.candidateFile.findUnique({ where: { id: fileId } });
    if (!file || file.candidateId !== candidateId) throw HttpError.notFound('File not found');

    try {
      await minioClient.removeObject(env.MINIO_BUCKET, file.storageKey);
    } catch (err) {
      console.error('Failed to delete file from MinIO:', err);
    }

    await prisma.candidateFile.delete({ where: { id: fileId } });
    activityService.log(employeeId, 'file', 'Deleted candidate file', file.filename);
  },
};
