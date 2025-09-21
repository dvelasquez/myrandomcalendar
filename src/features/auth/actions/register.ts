import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { auth } from '../lib/better-auth';

export const register = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  handler: async ({ name, email, password }, { request }) => {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: request.headers,
      });

      if (!result) {
        throw new ActionError({
          code: 'CONFLICT',
          message: 'Registration failed',
        });
      }

      // BetterAuth handles session cookies automatically
      return { success: true, user: result.user };
    } catch (error) {
      if (error instanceof ActionError) {
        throw error;
      }

      console.error('Registration error:', error);
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Registration failed',
      });
    }
  },
});
