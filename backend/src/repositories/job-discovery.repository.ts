import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const jobDiscoveryRepository = {
  async findAll() {
    return prisma.jobDiscovery.findMany({
      orderBy: { createdAt: 'desc' },
      include: { addedBy: { select: { id: true, email: true } }, _count: { select: { queueItems: true } } },
    });
  },

  async findById(id: string) {
    return prisma.jobDiscovery.findUnique({
      where: { id },
      include: { addedBy: { select: { id: true, email: true } } },
    });
  },

  async create(data: Prisma.JobDiscoveryCreateInput) {
    return prisma.jobDiscovery.create({ data });
  },

  async update(id: string, data: Prisma.JobDiscoveryUpdateInput) {
    return prisma.jobDiscovery.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.jobDiscovery.delete({ where: { id } });
  },

  async countByAddedBy(userId: string) {
    return prisma.jobDiscovery.count({ where: { addedById: userId } });
  },
};
