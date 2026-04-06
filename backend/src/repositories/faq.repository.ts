import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const faqRepository = {
  async findByCandidateId(candidateId: string) {
    return prisma.faqItem.findMany({
      where: { candidateId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async findApprovedByCandidateId(candidateId: string) {
    return prisma.faqItem.findMany({
      where: { candidateId, isApproved: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async findById(id: string) {
    return prisma.faqItem.findUnique({ where: { id } });
  },

  async create(data: Prisma.FaqItemCreateInput) {
    return prisma.faqItem.create({ data });
  },

  async update(id: string, data: Prisma.FaqItemUpdateInput) {
    return prisma.faqItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.faqItem.delete({ where: { id } });
  },
};
