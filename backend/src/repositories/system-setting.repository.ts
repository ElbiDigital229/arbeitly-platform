import { prisma } from '../config/prisma.js';

export const systemSettingRepository = {
  async getAll() {
    return prisma.systemSetting.findMany();
  },

  async get(key: string) {
    return prisma.systemSetting.findUnique({ where: { key } });
  },

  async upsert(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },

  async upsertMany(entries: Record<string, string>) {
    const ops = Object.entries(entries).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    );
    return prisma.$transaction(ops);
  },
};
