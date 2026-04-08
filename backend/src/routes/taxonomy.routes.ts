import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { taxonomyService } from '../services/taxonomy.service.js';
import { onboardingConfigService } from '../services/onboarding-config.service.js';

const router = Router();

router.use(authenticate);

router.get('/roles', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await taxonomyService.listRoles() });
  } catch (e) { next(e); }
});

router.get('/industries', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await taxonomyService.listIndustries() });
  } catch (e) { next(e); }
});

router.get('/skills', async (_req, res, next) => {
  try {
    res.json({ success: true, data: await taxonomyService.listSkills() });
  } catch (e) { next(e); }
});

router.get('/onboarding-config', async (_req, res, next) => {
  try {
    res.json({ success: true, data: onboardingConfigService.load() });
  } catch (e) { next(e); }
});

export default router;
