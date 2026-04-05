import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload, expiresIn?: string): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: (expiresIn ?? env.JWT_EXPIRES_IN) as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
