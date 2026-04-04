import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../errors/HttpError.js';

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(HttpError.unauthorized('No token provided'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    next(HttpError.unauthorized('Invalid or expired token'));
  }
};
