// Browser-specific auth client for better Vite compatibility
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:4321', // Use explicit URL for browser
  fetchOptions: {
    credentials: 'include',
  },
});

// Export functions to handle social sign-ins
export async function handleGoogleSignIn() {
  try {
    await authClient.signIn.social({ provider: 'google' });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function handleGithubSignIn() {
  try {
    await authClient.signIn.social({ provider: 'github' });
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
}

export async function handleDiscordSignIn() {
  try {
    await authClient.signIn.social({ provider: 'discord' });
  } catch (error) {
    console.error('Discord sign-in error:', error);
    throw error;
  }
}
