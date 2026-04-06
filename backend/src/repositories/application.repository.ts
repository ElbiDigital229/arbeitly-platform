import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const applicationRepository = {
  async findAllByUserId(userId: string) {
    return prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findSelfAddedByUserId(userId: string) {
    return prisma.application.findMany({
      where: { userId, OR: [{ source: 'self' }, { source: null }] },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.application.findUnique({ where: { id } });
  },

  async create(data: Prisma.ApplicationCreateInput) {
    return prisma.application.create({ data });
  },

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    return prisma.application.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.application.delete({ where: { id } });
  },
};
