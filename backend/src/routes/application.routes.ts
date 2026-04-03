import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { cache } from '../middleware/cache.middleware.js';
import { CreateApplicationDto, UpdateApplicationDto, BulkCreateApplicationDto } from '../dtos/application.dto.js';

const router = Router();

router.use(authenticate);

router.post('/bulk', validate(BulkCreateApplicationDto), applicationController.bulkCreateApplications);
router.post('/', validate(CreateApplicationDto), applicationController.createApplication);
router.get('/', cache(30), applicationController.getApplications);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', validate(UpdateApplicationDto), applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

export default router;
