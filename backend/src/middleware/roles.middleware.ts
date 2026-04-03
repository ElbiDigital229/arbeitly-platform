import type { RequestHandler } from 'express';
import { HttpError } from '../errors/HttpError.js';

export function requireRole(...roles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(HttpError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(HttpError.forbidden('You do not have permission to access this resource'));
    }
    next();
  };
}
