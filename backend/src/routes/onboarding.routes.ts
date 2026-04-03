import { Router } from 'express';
import { onboardingController } from '../controllers/onboarding.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { OnboardingDto } from '../dtos/onboarding.dto.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(OnboardingDto), onboardingController.completeOnboarding);

export default router;
