import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { PurchasePlanDto } from '../dtos/payment.dto.js';
import { stripeCheckoutService } from '../services/stripe-checkout.service.js';

const router = Router();

// Stripe webhook — must use raw body (before JSON parser)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    await stripeCheckoutService.handleWebhook(req.body, sig);
    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.use(authenticate);

// Create Stripe Checkout Session
router.post('/create-checkout', async (req, res, next) => {
  try {
    const { planId } = req.body;
    const origin = `${req.protocol}://${req.get('host')}`;
    const frontendOrigin = req.headers.referer ? new URL(req.headers.referer).origin : origin;

    const result = await stripeCheckoutService.createCheckoutSession(
      req.user!.id,
      planId,
      `${frontendOrigin}/checkout/success`,
      `${frontendOrigin}/checkout?plan=${planId}`,
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Verify payment after Stripe redirect
router.post('/verify', async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const result = await stripeCheckoutService.verifyAndActivate(sessionId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// Legacy mock purchase (fallback when Stripe not configured)
router.post('/purchase', validate(PurchasePlanDto), paymentController.purchasePlan);
router.get('/subscription', paymentController.getCurrentPlan);

export default router;
