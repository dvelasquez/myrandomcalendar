import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { authenticateUser, createSession } from '../lib/auth';

export const login = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
  handler: async ({ email, password }, { cookies }) => {
    try {
      const result = await authenticateUser(email, password);

      if (!result.success) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: result.error || 'Invalid credentials',
        });
      }

      // Create session
      const sessionResult = await createSession(result.user!.id);

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
