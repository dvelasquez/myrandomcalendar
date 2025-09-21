import { ActionError, defineAction } from 'astro:actions';
import { auth } from '../lib/better-auth';

export const logout = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
    try {
      const result = await auth.api.signOut({
        headers: request.headers,
      });
      if (!result) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Logout failed',
        });
      }

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
