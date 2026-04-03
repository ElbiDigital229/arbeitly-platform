import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import cvRoutes from './cv.routes.js';
import applicationRoutes from './application.routes.js';
import onboardingRoutes from './onboarding.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/cvs', cvRoutes);
router.use('/applications', applicationRoutes);
router.use('/onboarding', onboardingRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
