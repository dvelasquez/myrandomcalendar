// Browser-specific auth client for better Vite compatibility
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:4321', // Use explicit URL for browser
  fetchOptions: {
    credentials: 'include',
  },
});

// Export a function to handle Google sign-in
export async function handleGoogleSignIn() {
  try {
    await authClient.signIn.social({ provider: 'google' });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}
