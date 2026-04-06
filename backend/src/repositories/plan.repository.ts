import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const planRepository = {
  async findAll() {
    return prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { candidates: true } } },
    });
  },

  async findActive() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.plan.findUnique({ where: { id } });
  },

  async create(data: Prisma.PlanCreateInput) {
    return prisma.plan.create({ data });
  },

  async update(id: string, data: Prisma.PlanUpdateInput) {
    return prisma.plan.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.plan.delete({ where: { id } });
  },

  async countActive() {
    return prisma.plan.count({ where: { isActive: true } });
  },

  async countCandidates(planId: string) {
    return prisma.candidateProfile.count({ where: { planId } });
  },
};
