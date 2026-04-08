import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { prisma } from '../config/prisma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, '..', 'config', 'taxonomy-seed.json');

interface SeedRole { key: string; name: string; family: string; description?: string }
interface SeedIndustry { key: string; name: string }
interface SeedSkill { key: string; name: string; families: string[]; aliases: string[] }
interface SeedFile { roles: SeedRole[]; industries: SeedIndustry[]; skills: SeedSkill[] }

function loadSeed(): SeedFile {
  const raw = readFileSync(SEED_PATH, 'utf8');
  return JSON.parse(raw) as SeedFile;
}

export const taxonomyService = {
  /**
   * Upsert taxonomy from the JSON seed file. Safe to run on every startup —
   * existing IDs are preserved (we match by `key`), only names/families/aliases
   * get refreshed. Removed entries are NOT deleted (would break candidate FKs).
   */
  async syncFromSeed() {
    const seed = loadSeed();

    let i = 0;
    for (const r of seed.roles) {
      await prisma.jobRole.upsert({
        where: { key: r.key },
        create: { key: r.key, name: r.name, family: r.family, description: r.description, sortOrder: i },
        update: { name: r.name, family: r.family, description: r.description, sortOrder: i, isActive: true },
      });
      i++;
    }

    i = 0;
    for (const ind of seed.industries) {
      await prisma.industry.upsert({
        where: { key: ind.key },
        create: { key: ind.key, name: ind.name, sortOrder: i },
        update: { name: ind.name, sortOrder: i, isActive: true },
      });
      i++;
    }

    i = 0;
    for (const s of seed.skills) {
      await prisma.skill.upsert({
        where: { key: s.key },
        create: { key: s.key, name: s.name, families: s.families, aliases: s.aliases, sortOrder: i },
        update: { name: s.name, families: s.families, aliases: s.aliases, sortOrder: i, isActive: true },
      });
      i++;
    }

    console.log(
      `[taxonomy] synced ${seed.roles.length} roles, ${seed.industries.length} industries, ${seed.skills.length} skills`,
    );
  },

  async listRoles() {
    return prisma.jobRole.findMany({
      where: { isActive: true },
      orderBy: [{ family: 'asc' }, { sortOrder: 'asc' }],
    });
  },

  async listIndustries() {
    return prisma.industry.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  },

  async listSkills() {
    return prisma.skill.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  },
};
