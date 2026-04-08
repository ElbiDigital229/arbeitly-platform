import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { candidateFileService } from '../services/candidate-file.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../errors/HttpError.js';
import { success } from '../utils/response.js';

const router = Router();
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB any mimetype
});

router.use(authenticate);

// List all of the candidate's own files (sees everything — private + onboarding + employee uploads)
router.get('/', asyncHandler(async (req, res) => {
  success(res, await candidateFileService.listForCandidate(req.user!.id));
}));

// Upload a private file (only this candidate sees it)
router.post('/', uploadRateLimiter, fileUpload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw HttpError.badRequest('No file uploaded');
  const label = (req.body.label as string | undefined) || undefined;
  const file = await candidateFileService.upload(
    req.user!.id,
    req.user!.id,
    req.file,
    'CANDIDATE_PRIVATE',
    label,
  );
  success(res, file, 201);
}));

router.get('/:fileId/download', asyncHandler(async (req, res) => {
  const { file, stream } = await candidateFileService.getDownloadStream(
    req.user!.id,
    req.params.fileId,
    'candidate',
  );
  res.set({
    'Content-Type': file.mimetype,
    'Content-Disposition': `attachment; filename="${file.filename}"`,
    'Content-Length': file.size.toString(),
  });
  stream.pipe(res);
}));

router.delete('/:fileId', asyncHandler(async (req, res) => {
  await candidateFileService.delete(req.user!.id, req.params.fileId, req.user!.id, 'candidate');
  success(res, { deleted: true });
}));

export default router;
