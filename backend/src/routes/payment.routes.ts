import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { CreateCheckoutDto } from '../dtos/payment.dto.js';

const router = Router();

// Webhook — no auth, raw body (handled by express.raw in server.ts)
router.post('/webhook', paymentController.webhook);

// Authenticated routes
router.post('/create-checkout', authenticate, validate(CreateCheckoutDto), paymentController.createCheckout);
router.post('/portal', authenticate, paymentController.createPortal);
router.get('/subscription', authenticate, paymentController.getSubscription);

export default router;
