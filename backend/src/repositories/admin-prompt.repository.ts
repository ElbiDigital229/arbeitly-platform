import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const adminPromptRepository = {
  async findAll() {
    return prisma.adminPrompt.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findByType(type: string) {
    return prisma.adminPrompt.findMany({ where: { type }, orderBy: { version: 'desc' } });
  },

  async findActiveByType(type: string) {
    return prisma.adminPrompt.findFirst({ where: { type, isActive: true }, orderBy: { version: 'desc' } });
  },

  async findById(id: string) {
    return prisma.adminPrompt.findUnique({ where: { id } });
  },

  async create(data: Prisma.AdminPromptCreateInput) {
    return prisma.adminPrompt.create({ data });
  },

  async update(id: string, data: Prisma.AdminPromptUpdateInput) {
    return prisma.adminPrompt.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.adminPrompt.delete({ where: { id } });
  },
};
