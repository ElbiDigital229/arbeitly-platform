import { Router } from 'express';
import { jobDiscoveryController } from '../controllers/job-discovery.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateJobDiscoveryDto } from '../dtos/job-discovery.dto.js';
import { HttpError } from '../errors/HttpError.js';
import type { RequestHandler } from 'express';

const router = Router();

const requireEmployeeOrAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'EMPLOYEE' && req.user?.role !== 'ADMIN') {
    return next(HttpError.forbidden('Employee or admin access required'));
  }
  next();
};

router.use(authenticate, requireEmployeeOrAdmin);

router.get('/', jobDiscoveryController.getJobs);
router.get('/:id', jobDiscoveryController.getJob);
router.post('/', validate(CreateJobDiscoveryDto), jobDiscoveryController.createJob);
router.delete('/:id', jobDiscoveryController.deleteJob);
router.post('/:id/score/:candidateId', jobDiscoveryController.scoreRelevance);
router.post('/:id/queue/:candidateId', jobDiscoveryController.addToQueue);

export default router;
