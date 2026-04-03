import { prisma } from '../config/prisma.js';
import type { Role } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByIdWithProfile(id: string) {
    return prisma.user.findUnique({ where: { id }, include: { profile: true } });
  },

  async create(data: { email: string; password: string; role?: Role }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<{ email: string; password: string; role: Role }>) {
    return prisma.user.update({ where: { id }, data });
  },
};
