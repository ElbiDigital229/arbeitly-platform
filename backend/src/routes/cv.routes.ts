import { Router } from 'express';
import multer from 'multer';
import { cvController } from '../controllers/cv.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateCVDto, UpdateCVDto } from '../dtos/cv.dto.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/create', validate(CreateCVDto), cvController.createCV);
router.post('/', upload.single('file'), cvController.uploadCV);
router.get('/', cvController.getCVs);
router.get('/:id', cvController.getCVById);
router.put('/:id', validate(UpdateCVDto), cvController.updateCV);
router.delete('/:id', cvController.deleteCV);
router.get('/:id/export', cvController.exportCVToPDF);

export default router;
