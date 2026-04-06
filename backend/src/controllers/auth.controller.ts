import type { RequestHandler } from 'express';
import { authService } from '../services/auth.service.js';
import { success } from '../utils/response.js';

export const authController = {
  register: (async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      success(res, result, 201);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  login: (async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  me: (async (req, res, next) => {
    try {
      const result = await authService.getMe(req.user!.id);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  changePassword: (async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
      success(res, result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
