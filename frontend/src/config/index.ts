export const appConfig = {
  auth0Domain: import.meta.env.VITE_AUTH0_DOMAIN,
  auth0ClientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  auth0Audience: import.meta.env.VITE_AUTH0_AUDIENCE,
} as const;
