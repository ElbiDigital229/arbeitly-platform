import type { RequestHandler } from 'express';
import { paymentService } from '../services/payment.service.js';
import { success } from '../utils/response.js';

export const paymentController = {
  purchasePlan: (async (req, res, next) => {
    try {
      const result = await paymentService.purchasePlan(req.user!.id, req.body.planId);
      success(res, result);
    } catch (err) { next(err); }
  }) as RequestHandler,

  getCurrentPlan: (async (req, res, next) => {
    try {
      const result = await paymentService.getCurrentPlan(req.user!.id);
      success(res, result);
    } catch (err) { next(err); }
  }) as RequestHandler,
};
