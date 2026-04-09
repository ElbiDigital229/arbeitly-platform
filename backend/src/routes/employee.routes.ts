import { Router } from 'express';
import multer from 'multer';
import { employeeController } from '../controllers/employee.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { aiRateLimiter, uploadRateLimiter, exportRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { activityService } from '../services/activity.service.js';
import { HttpError } from '../errors/HttpError.js';
import type { RequestHandler } from 'express';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: PDF, JPEG, PNG, DOCX') as any, false);
  },
});

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
router.post('/candidates/:id/cvs/:cvId/enhance', aiRateLimiter, employeeController.enhanceCandidateCV);
router.post('/candidates/:id/cvs/:cvId/version', employeeController.createCVVersion);
router.post('/candidates/:id/cvs/:cvId/variant', employeeController.createCVVariant);
router.get('/candidates/:id/cvs/:cvId/tree', employeeController.getCVVersionTree);

// CV Builder mirror routes (reuse candidate's CVBuilderView component)
// IMPORTANT: specific paths registered before parametric ones
router.post('/candidates/:id/cv-builder/create', employeeController.createCandidateCv);
router.post('/candidates/:id/cv-builder/export', exportRateLimiter, employeeController.exportCandidateCvHtml);
router.post('/candidates/:id/cv-builder', uploadRateLimiter, upload.single('file'), employeeController.uploadCandidateCv);
router.get('/candidates/:id/cv-builder', employeeController.listCandidateCvBuilder);
router.get('/candidates/:id/cv-builder/:cvId', employeeController.getCandidateCvBuilder);
router.put('/candidates/:id/cv-builder/:cvId', employeeController.updateCandidateCvBuilder);
router.delete('/candidates/:id/cv-builder/:cvId', employeeController.deleteCandidateCvBuilder);

// Generic file uploads (any mimetype, 25MB)
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});
router.get('/candidates/:id/files', employeeController.listCandidateFiles);
router.post('/candidates/:id/files', uploadRateLimiter, fileUpload.single('file'), employeeController.uploadCandidateFile);
router.get('/candidates/:id/files/:fileId/download', employeeController.downloadCandidateFile);
router.delete('/candidates/:id/files/:fileId', employeeController.deleteCandidateFile);

// Cover letter endpoints
router.get('/candidates/:id/cover-letters', employeeController.getCandidateCLs);
router.post('/candidates/:id/cover-letters', employeeController.createCandidateCL);
router.put('/candidates/:id/cover-letters/:clId', employeeController.updateCandidateCL);
router.post('/candidates/:id/cover-letters/:clId/enhance', aiRateLimiter, employeeController.enhanceCandidateCL);
router.post('/candidates/:id/cover-letters/:clId/version', employeeController.createCLVersion);
router.post('/candidates/:id/cover-letters/:clId/variant', employeeController.createCLVariant);
router.get('/candidates/:id/cover-letters/:clId/tree', employeeController.getCLVersionTree);
router.post('/candidates/:id/cover-letters/generate', aiRateLimiter, employeeController.generateCLForJob);

// FAQ
router.get('/candidates/:id/faq', employeeController.getCandidateFaq);
router.post('/candidates/:id/faq', employeeController.createFaqItem);
router.put('/candidates/:id/faq/:faqId', employeeController.updateFaqItem);
router.delete('/candidates/:id/faq/:faqId', employeeController.deleteFaqItem);

// Queue
router.get('/candidates/:id/queue', employeeController.getCandidateQueue);
router.post('/queue/:queueItemId/apply', employeeController.markQueueApplied);

router.get('/activity', async (req, res) => {
  const items = await activityService.getByUser(req.user!.id);
  res.json({ success: true, data: items });
});
router.put('/profile', employeeController.updateProfile);
router.put('/change-password', employeeController.changePassword);

export default router;
