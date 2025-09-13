import { defineAction, ActionError } from 'astro:actions';
import { deleteSession } from '../lib/auth';

export const logout = defineAction({
  accept: 'form',
  handler: async (_, { cookies }) => {
    try {
      const sessionToken = cookies.get('session_token')?.value;

      if (sessionToken) {
        await deleteSession(sessionToken);
      }

      // Clear session cookie
      cookies.delete('session_token', { path: '/' });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed',
      });
    }
  },
});
