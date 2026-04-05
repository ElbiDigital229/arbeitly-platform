import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import cvRoutes from './cv.routes.js';
import applicationRoutes from './application.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import employeeRoutes from './employee.routes.js';
import adminRoutes from './admin.routes.js';
import planRoutes from './plan.routes.js';
import paymentRoutes from './payment.routes.js';
import jobDiscoveryRoutes from './job-discovery.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/cvs', cvRoutes);
router.use('/applications', applicationRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/employee', employeeRoutes);
router.use('/admin', adminRoutes);
router.use('/plans', planRoutes);
router.use('/payments', paymentRoutes);
router.use('/jobs', jobDiscoveryRoutes);

// Health check
router.get('/health', async (_req, res) => {
  const health: Record<string, string> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
  try {
    const { prisma } = await import('../config/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
    health.db = 'ok';
  } catch {
    health.db = 'failed';
    health.status = 'degraded';
  }
  res.status(health.status === 'ok' ? 200 : 503).json(health);
});

export default router;
