import { createAuth0 } from '@auth0/auth0-vue';

const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'your-tenant.auth0.com';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'placeholder';
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.arbeitly.com';

/**
 * Auth0 plugin — only active when VITE_AUTH0_DOMAIN is configured.
 * Returns null if Auth0 is not configured, so main.ts can skip registration.
 */
export const auth0Plugin =
  domain !== 'your-tenant.auth0.com'
    ? createAuth0({
        domain,
        clientId,
        authorizationParams: {
          redirect_uri: window.location.origin + '/auth/callback',
          audience,
        },
      })
    : null;

export const isAuth0Configured = domain !== 'your-tenant.auth0.com';
