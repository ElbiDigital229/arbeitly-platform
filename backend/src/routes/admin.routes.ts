import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreatePlanDto, UpdatePlanDto } from '../dtos/plan.dto.js';
import { CreateAdminPromptDto, UpdateAdminPromptDto } from '../dtos/admin-prompt.dto.js';
import { HttpError } from '../errors/HttpError.js';
import type { RequestHandler } from 'express';

const router = Router();

router.post('/signin', authRateLimiter, adminController.signin);

const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') return next(HttpError.forbidden('Admin access required'));
  next();
};

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.dashboard);
router.get('/candidates', adminController.getCandidates);
router.get('/candidates/:id', adminController.getCandidate);
router.patch('/candidates/:id', adminController.updateCandidate);
router.get('/candidates/:id/applications', adminController.getCandidateApplications);
router.get('/employees', adminController.getEmployees);
router.post('/employees', adminController.createEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);
router.put('/change-password', adminController.changePassword);
router.get('/plans', adminController.getPlans);
router.post('/plans', validate(CreatePlanDto), adminController.createPlan);
router.patch('/plans/:id', validate(UpdatePlanDto), adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);
router.get('/prompts', adminController.getPrompts);
router.post('/prompts', validate(CreateAdminPromptDto), adminController.createPrompt);
router.patch('/prompts/:id', validate(UpdateAdminPromptDto), adminController.updatePrompt);
router.delete('/prompts/:id', adminController.deletePrompt);
router.get('/performance', adminController.getEmployeePerformance);
router.get('/performance/:id', adminController.getEmployeePerformanceDetail);

export default router;
