import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const cvRepository = {
  async findAllByUserId(userId: string) {
    return prisma.cV.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.cV.findUnique({ where: { id } });
  },

  async create(data: Prisma.CVCreateInput) {
    return prisma.cV.create({ data });
  },

  async update(id: string, data: Prisma.CVUpdateInput) {
    return prisma.cV.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.cV.delete({ where: { id } });
  },
};
