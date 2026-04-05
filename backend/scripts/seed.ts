import '../src/config/env.js';
import { prisma } from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/hash.js';

async function main() {
  console.log('Seeding database...');

  // Create a demo candidate user
  const hashedPassword = await hashPassword('password123');

  const user = await prisma.user.upsert({
    where: { email: 'demo@arbeitly.com' },
    update: {},
    create: {
      email: 'demo@arbeitly.com',
      password: hashedPassword,
      role: 'CANDIDATE',
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1 555-0100',
          location: 'Berlin, Germany',
          bio: 'A passionate software developer looking for exciting opportunities.',
          onboardingCompleted: true,
        },
      },
      applications: {
        create: [
          {
            companyName: 'Acme Corp',
            jobTitle: 'Senior Frontend Developer',
            jobUrl: 'https://acmecorp.com/jobs/senior-frontend',
            status: 'APPLIED',
            appliedAt: new Date(),
            notes: 'Great company culture. Applied via LinkedIn.',
          },
          {
            companyName: 'TechStartup GmbH',
            jobTitle: 'Full Stack Engineer',
            status: 'INTERVIEW',
            notes: 'Second round interview scheduled for next week.',
          },
          {
            companyName: 'BigTech Inc',
            jobTitle: 'Software Engineer II',
            status: 'TO_APPLY',
            notes: 'Dream company, need to polish my profile before applying.',
          },
        ],
      },
    },
  });

  console.log(`Created demo user: ${user.email} (password: password123)`);
  console.log('Seeding complete!');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
