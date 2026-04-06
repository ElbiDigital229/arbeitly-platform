import { Router } from 'express';
import multer from 'multer';
import { cvController } from '../controllers/cv.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateCVDto, UpdateCVDto } from '../dtos/cv.dto.js';

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

router.use(authenticate);

router.post('/create', validate(CreateCVDto), cvController.createCV);
router.post('/export', cvController.exportCVFromHtml);
router.post('/', upload.single('file'), cvController.uploadCV);
router.get('/', cvController.getCVs);
router.get('/:id', cvController.getCVById);
router.put('/:id', validate(UpdateCVDto), cvController.updateCV);
router.delete('/:id', cvController.deleteCV);
router.get('/:id/export', cvController.exportCVToPDF);

export default router;
