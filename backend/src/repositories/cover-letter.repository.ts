import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const coverLetterRepository = {
  async findAllByUserId(userId: string) {
    return prisma.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.coverLetter.findUnique({ where: { id } });
  },

  async findBaseByUserId(userId: string) {
    return prisma.coverLetter.findFirst({ where: { userId, isBase: true } });
  },

  async findWithChildren(id: string) {
    return prisma.coverLetter.findUnique({
      where: { id },
      include: { children: { include: { children: true }, orderBy: { createdAt: 'desc' } } },
    });
  },

  async create(data: Prisma.CoverLetterCreateInput) {
    return prisma.coverLetter.create({ data });
  },

  async update(id: string, data: Prisma.CoverLetterUpdateInput) {
    return prisma.coverLetter.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.coverLetter.delete({ where: { id } });
  },
};
