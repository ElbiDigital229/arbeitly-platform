import { paymentService } from '../services/payment.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const paymentController = {
  purchasePlan: asyncHandler(async (req, res) => {
    const result = await paymentService.purchasePlan(req.user!.id, req.body.planId, req.body.mockCard);
    success(res, result);
  }),

  getCurrentPlan: asyncHandler(async (req, res) => {
    const result = await paymentService.getCurrentPlan(req.user!.id);
    success(res, result);
  }),

  getMyTransactions: asyncHandler(async (req, res) => {
    const result = await paymentService.getMyTransactions(req.user!.id);
    success(res, result);
  }),

  getMyTransaction: asyncHandler(async (req, res) => {
    const result = await paymentService.getMyTransaction(req.user!.id, req.params.id);
    success(res, result);
  }),
};
