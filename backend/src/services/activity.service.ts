import { prisma } from '../config/prisma.js';

export const activityService = {
  /** Fire-and-forget activity log — never throws */
  log(userId: string, category: string, action: string, detail?: string, meta?: Record<string, unknown>) {
    prisma.activityLog.create({
      data: { userId, category, action, detail, meta: meta ?? undefined },
    }).catch((err) => {
      console.error('[activity] Failed to log:', err?.message);
    });
  },

  async getByUser(userId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
