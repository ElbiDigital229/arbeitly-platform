import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin if none exists
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    const hashed = await bcrypt.hash('admin2024', 10);
    await prisma.user.create({
      data: { email: 'admin@arbeitly.de', password: hashed, role: 'ADMIN' },
    });
    console.log('✅ Default admin created: admin@arbeitly.de / admin2024');
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  // Create default employee if none exists
  const employeeExists = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
  if (!employeeExists) {
    const hashed = await bcrypt.hash('employee2024', 10);
    await prisma.user.create({
      data: { email: 'employee@arbeitly.de', password: hashed, role: 'EMPLOYEE' },
    });
    console.log('✅ Default employee created: employee@arbeitly.de / employee2024');
  } else {
    console.log('ℹ️  Employee already exists, skipping.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
