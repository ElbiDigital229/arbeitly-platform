import { prisma } from '../config/prisma.js';
import type { Prisma } from '@prisma/client';

export const subscriptionRepository = {
  async findByUserId(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } });
  },

  async findByStripeCustomerId(stripeCustomerId: string) {
    return prisma.subscription.findUnique({ where: { stripeCustomerId } });
  },

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return prisma.subscription.findUnique({ where: { stripeSubscriptionId } });
  },

  async create(data: Prisma.SubscriptionCreateInput) {
    return prisma.subscription.create({ data });
  },

  async update(id: string, data: Prisma.SubscriptionUpdateInput) {
    return prisma.subscription.update({ where: { id }, data });
  },

  async upsertByUserId(userId: string, data: Prisma.SubscriptionCreateInput) {
    return prisma.subscription.upsert({
      where: { userId },
      create: data,
      update: data,
    });
  },
};
