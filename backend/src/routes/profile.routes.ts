import { Router } from 'express';
import { profileController } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { UpdateProfileDto } from '../dtos/profile.dto.js';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', validate(UpdateProfileDto), profileController.updateProfile);

export default router;
