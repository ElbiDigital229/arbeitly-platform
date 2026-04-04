import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { HttpError } from '../errors/HttpError.js';
import type { RequestHandler } from 'express';

const router = Router();

router.post('/signin', adminController.signin);

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

export default router;
