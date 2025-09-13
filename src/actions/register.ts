import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { createUser, createSession } from '../lib/auth';

export const register = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  handler: async ({ name, email, password }, { cookies }) => {
    try {
      const result = await createUser(email, password, name);

      if (!result.success) {
        throw new ActionError({
          code: 'CONFLICT',
          message: result.error || 'Registration failed',
        });
      }

      // Create session
      const sessionResult = await createSession(result.userId!);

      if (!sessionResult.success) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create session',
        });
      }

      // Set session cookie
      cookies.set('session_token', sessionResult.token!, {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: true,
        sameSite: 'lax',
      });

      return { success: true, userId: result.userId };
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
