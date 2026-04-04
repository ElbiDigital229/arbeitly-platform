import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { HttpError } from '../errors/HttpError.js';
import type { RequestHandler } from 'express';

const router = Router();

// Public
router.post('/signin', employeeController.signin);

// Role guard
const requireEmployee: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'EMPLOYEE') return next(HttpError.forbidden('Employee access required'));
  next();
};

// Protected
router.use(authenticate, requireEmployee);

router.get('/dashboard', employeeController.dashboard);
router.get('/candidates', employeeController.getCandidates);
router.get('/candidates/:id', employeeController.getCandidate);
router.get('/candidates/:id/applications', employeeController.getCandidateApplications);
router.post('/candidates/:id/applications', employeeController.createCandidateApplication);
router.put('/candidates/:candidateId/applications/:appId', employeeController.updateCandidateApplication);
router.delete('/candidates/:candidateId/applications/:appId', employeeController.deleteCandidateApplication);
router.put('/profile', employeeController.updateProfile);
router.put('/change-password', employeeController.changePassword);

export default router;
