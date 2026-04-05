import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const profileRepository = {
  async findByUserId(userId: string) {
    return prisma.candidateProfile.findUnique({ where: { userId } });
  },

  async create(data: Prisma.CandidateProfileCreateInput) {
    return prisma.candidateProfile.create({ data });
  },

  async update(userId: string, data: Prisma.CandidateProfileUpdateInput) {
    return prisma.candidateProfile.update({ where: { userId }, data });
  },

  async upsert(
    userId: string,
    create: Omit<Prisma.CandidateProfileCreateInput, 'user'>,
    update: Prisma.CandidateProfileUpdateInput,
  ) {
    return prisma.candidateProfile.upsert({
      where: { userId },
      create: {
        ...create,
        user: { connect: { id: userId } },
      },
      update,
    });
  },
};
