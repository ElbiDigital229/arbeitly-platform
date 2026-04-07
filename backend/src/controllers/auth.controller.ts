import { authService } from '../services/auth.service.js';
import { success } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    success(res, result, 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    success(res, result);
  }),

  me: asyncHandler(async (req, res) => {
    const result = await authService.getMe(req.user!.id);
    success(res, result);
  }),

  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
    success(res, result);
  }),
};
