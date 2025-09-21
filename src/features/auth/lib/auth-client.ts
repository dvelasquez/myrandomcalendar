import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_APP_URL || 'http://localhost:4321',
  // Ensure proper browser compatibility
  fetchOptions: {
    credentials: 'include',
  },
});
