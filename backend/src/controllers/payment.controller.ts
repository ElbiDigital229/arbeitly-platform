import type { RequestHandler } from 'express';
import { paymentService } from '../services/payment.service.js';
import { success } from '../utils/response.js';

export const paymentController = {
  createCheckout: (async (req, res, next) => {
    try {
      const result = await paymentService.createCheckoutSession(req.user!.id, req.user!.email, req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  webhook: (async (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await paymentService.handleWebhookEvent(req.body as Buffer, signature);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  createPortal: (async (req, res, next) => {
    try {
      const result = await paymentService.createPortalSession(req.user!.id);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  getSubscription: (async (req, res, next) => {
    try {
      const subscription = await paymentService.getSubscription(req.user!.id);
      success(res, subscription);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
