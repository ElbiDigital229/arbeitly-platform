import { auth } from 'express-oauth2-jwt-bearer';
import { env } from './env.js';

/**
 * Auth0 JWT verifier middleware.
 * Only active when Auth0 env vars are configured (not placeholder values).
 */
export const auth0Verifier = env.AUTH0_DOMAIN !== 'your-tenant.auth0.com'
  ? auth({
      audience: env.AUTH0_AUDIENCE,
      issuerBaseURL: `https://${env.AUTH0_DOMAIN}/`,
      tokenSigningAlg: 'RS256',
    })
  : null;
