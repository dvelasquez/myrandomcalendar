import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { auth } from '../../../lib/better-auth';

export const login = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  handler: async ({ email, password }, { request }) => {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: request.headers,
      });

      if (!result) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      // BetterAuth handles session cookies automatically
      return { success: true, user: result.user };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }

      console.error('Login error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed',
      });
    }
  },
});
