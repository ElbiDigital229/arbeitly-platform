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
router.get('/performance', employeeController.getPerformance);
router.get('/candidates', employeeController.getCandidates);
router.get('/candidates/:id', employeeController.getCandidate);
router.get('/candidates/:id/onboarding', employeeController.getCandidateOnboarding);
router.get('/candidates/:id/applications', employeeController.getCandidateApplications);
router.post('/candidates/:id/applications', employeeController.createCandidateApplication);
router.put('/candidates/:candidateId/applications/:appId', employeeController.updateCandidateApplication);
router.delete('/candidates/:candidateId/applications/:appId', employeeController.deleteCandidateApplication);

// CV endpoints
router.get('/candidates/:id/cvs', employeeController.getCandidateCVs);
router.post('/candidates/:id/cvs/:cvId/enhance', employeeController.enhanceCandidateCV);
router.post('/candidates/:id/cvs/:cvId/version', employeeController.createCVVersion);
router.post('/candidates/:id/cvs/:cvId/variant', employeeController.createCVVariant);
router.get('/candidates/:id/cvs/:cvId/tree', employeeController.getCVVersionTree);

// Cover letter endpoints
router.get('/candidates/:id/cover-letters', employeeController.getCandidateCLs);
router.post('/candidates/:id/cover-letters', employeeController.createCandidateCL);
router.put('/candidates/:id/cover-letters/:clId', employeeController.updateCandidateCL);
router.post('/candidates/:id/cover-letters/:clId/enhance', employeeController.enhanceCandidateCL);
router.post('/candidates/:id/cover-letters/:clId/version', employeeController.createCLVersion);
router.post('/candidates/:id/cover-letters/:clId/variant', employeeController.createCLVariant);
router.get('/candidates/:id/cover-letters/:clId/tree', employeeController.getCLVersionTree);
router.post('/candidates/:id/cover-letters/generate', employeeController.generateCLForJob);

// Queue
router.get('/candidates/:id/queue', employeeController.getCandidateQueue);

router.put('/profile', employeeController.updateProfile);
router.put('/change-password', employeeController.changePassword);

export default router;
