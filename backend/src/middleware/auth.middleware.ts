import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../errors/HttpError.js';
import { auth0Verifier } from '../config/auth0.js';
import { userRepository } from '../repositories/user.repository.js';
import { profileRepository } from '../repositories/profile.repository.js';

/**
 * Dual-mode authentication middleware.
 * 1. Try local JWT first (zero overhead, backward compatible)
 * 2. If that fails and Auth0 is configured, verify as Auth0 JWT
 * 3. Auth0 users are auto-provisioned in the DB on first login
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(HttpError.unauthorized('No token provided'));
  }

  const token = authHeader.slice(7);

  // Strategy 1: Local JWT
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch {
    // Local JWT failed — try Auth0 if configured
  }

  // Strategy 2: Auth0 JWT (only if configured)
  if (auth0Verifier) {
    try {
      // Use Auth0 verifier as a promise-based check
      await new Promise<void>((resolve, reject) => {
        auth0Verifier!(req as any, _res as any, (err?: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Auth0 token verified — extract email from token payload
      const auth0Payload = (req as any).auth?.payload;
      const email = auth0Payload?.email || auth0Payload?.sub;

      if (!email) {
        return next(HttpError.unauthorized('Auth0 token missing email claim'));
      }

      // Find or create user in our DB
      let user = await userRepository.findByEmail(email);
      if (!user) {
        // Auto-provision Auth0 user
        const randomPassword = crypto.randomUUID(); // Not used for Auth0 users
        user = await userRepository.create({ email, password: randomPassword });
        await profileRepository.create({
          firstName: auth0Payload?.name?.split(' ')[0] ?? '',
          lastName: auth0Payload?.name?.split(' ').slice(1).join(' ') ?? '',
          user: { connect: { id: user.id } },
        });
      }

      req.user = { id: user.id, email: user.email, role: user.role };
      return next();
    } catch {
      // Auth0 verification also failed
    }
  }

  next(HttpError.unauthorized('Invalid or expired token'));
};
