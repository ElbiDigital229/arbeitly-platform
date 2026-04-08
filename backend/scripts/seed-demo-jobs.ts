/**
 * Dev-only: insert a handful of structured demo jobs so the matching
 * engine has something to chew on. Re-runnable: deletes any prior
 * jobs whose company starts with "Demo " and inserts fresh ones.
 *
 * Usage: bun scripts/seed-demo-jobs.ts
 */
import { prisma } from '../src/config/prisma.js';

async function pickRoleId(key: string) {
  const r = await prisma.jobRole.findUnique({ where: { key } });
  if (!r) throw new Error(`Role not found: ${key}`);
  return r.id;
}
async function pickSkillIds(keys: string[]) {
  const rows = await prisma.skill.findMany({ where: { key: { in: keys } } });
  const found = new Map(rows.map((r) => [r.key, r.id]));
  for (const k of keys) if (!found.has(k)) throw new Error(`Skill not found: ${k}`);
  return keys.map((k) => found.get(k)!);
}
async function pickIndustryIds(keys: string[]) {
  const rows = await prisma.industry.findMany({ where: { key: { in: keys } } });
  return rows.map((r) => r.id);
}

async function main() {
  // Need an addedBy user — pick the first admin
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) throw new Error('No admin user. Run prisma seed first.');

  // Wipe prior demo jobs
  await prisma.candidateJobQueue.deleteMany({
    where: { job: { company: { startsWith: 'Demo ' } } },
  });
  await prisma.jobDiscovery.deleteMany({ where: { company: { startsWith: 'Demo ' } } });

  const jobs = [
    {
      title: 'Senior Frontend Engineer (React)',
      company: 'Demo SaaSCo',
      description: 'Build the next-gen dashboard with React + TypeScript.',
      roleKey: 'frontend_engineer',
      skillKeys: ['react', 'typescript', 'tailwind'],
      industryKeys: ['saas'],
      city: 'Berlin', country: 'Germany', remote: true,
      salaryMin: 70000, salaryMax: 95000,
      yearsExperienceMin: 4, yearsExperienceMax: 8,
      languagesRequired: ['English'],
      seniority: 'senior',
    },
    {
      title: 'Data Engineer',
      company: 'Demo FintechBank',
      description: 'Build pipelines on Snowflake + dbt.',
      roleKey: 'data_engineer',
      skillKeys: ['python', 'sql', 'aws'],
      industryKeys: ['fintech'],
      city: 'Frankfurt', country: 'Germany', remote: false,
      salaryMin: 75000, salaryMax: 105000,
      yearsExperienceMin: 3, yearsExperienceMax: 7,
      languagesRequired: ['English', 'German'],
      seniority: 'mid',
    },
    {
      title: 'Product Designer',
      company: 'Demo HealthApp',
      description: 'Own end-to-end design for our patient mobile app.',
      roleKey: 'product_designer',
      skillKeys: ['figma'],
      industryKeys: ['healthtech'],
      city: 'Munich', country: 'Germany', remote: true,
      salaryMin: 60000, salaryMax: 85000,
      yearsExperienceMin: 3, yearsExperienceMax: 6,
      languagesRequired: ['English'],
      seniority: 'mid',
    },
    {
      title: 'Backend Engineer (Node.js)',
      company: 'Demo Marketplace',
      description: 'Scale our payment infrastructure.',
      roleKey: 'backend_engineer',
      skillKeys: ['nodejs', 'typescript', 'postgresql', 'aws'],
      industryKeys: ['ecommerce'],
      city: 'Amsterdam', country: 'Netherlands', remote: true,
      salaryMin: 65000, salaryMax: 90000,
      yearsExperienceMin: 4, yearsExperienceMax: 8,
      languagesRequired: ['English'],
      seniority: 'senior',
    },
    {
      title: 'Junior QA Engineer',
      company: 'Demo AutomotiveCorp',
      description: 'Test embedded car software.',
      roleKey: 'qa_engineer',
      skillKeys: ['python'],
      industryKeys: ['automotive'],
      city: 'Stuttgart', country: 'Germany', remote: false,
      salaryMin: 45000, salaryMax: 60000,
      yearsExperienceMin: 0, yearsExperienceMax: 2,
      languagesRequired: ['German'],
      seniority: 'junior',
    },
  ];

  let created = 0;
  for (const j of jobs) {
    const roleId = await pickRoleId(j.roleKey);
    const role = await prisma.jobRole.findUnique({ where: { id: roleId } });
    const skillIds = await pickSkillIds(j.skillKeys);
    const industryIds = await pickIndustryIds(j.industryKeys);
    await prisma.jobDiscovery.create({
      data: {
        title: j.title,
        company: j.company,
        description: j.description,
        location: `${j.city}, ${j.country}`,
        salary: `€${j.salaryMin / 1000}k–${j.salaryMax / 1000}k`,
        addedById: admin.id,
        source: 'demo-seed',
        roleId,
        roleFamily: role!.family,
        skillIds,
        industryIds,
        city: j.city,
        country: j.country,
        remote: j.remote,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: 'EUR',
        yearsExperienceMin: j.yearsExperienceMin,
        yearsExperienceMax: j.yearsExperienceMax,
        languagesRequired: j.languagesRequired,
        seniority: j.seniority,
        isPublished: true,
      },
    });
    created++;
  }
  console.log(`✅ Inserted ${created} demo jobs.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
