import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { PurchasePlanDto } from '../dtos/payment.dto.js';

const router = Router();

router.use(authenticate);

router.post('/purchase', validate(PurchasePlanDto), paymentController.purchasePlan);
router.get('/subscription', paymentController.getCurrentPlan);

export default router;
