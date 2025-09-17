import { ActionError, defineAction } from 'astro:actions';
import { db, PeriodicEvents } from 'astro:db';
import { z } from 'astro:schema';
import { eq } from 'drizzle-orm';
import { auth } from '../lib/better-auth';

/**
 * Create a new periodic event
 */
export const createPeriodicEventAction = defineAction({
  accept: 'form',
  input: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly'], {
      errorMap: () => ({ message: 'Valid frequency is required (daily, weekly, or monthly)' }),
    }),
    frequencyCount: z.string().transform((val) => parseInt(val) || 1).refine((val) => val >= 1, 'Frequency count must be at least 1'),
    duration: z.string().transform((val) => parseInt(val) || 1).refine((val) => val >= 1, 'Duration must be at least 1 minute'),
    category: z.enum(['exercise', 'personal', 'family', 'work', 'health', 'hobby', 'other'], {
      errorMap: () => ({ message: 'Valid category is required' }),
    }),
    priority: z.enum(['high', 'medium', 'low'], {
      errorMap: () => ({ message: 'Valid priority is required' }),
    }),
    color: z.string().optional(),
  }),
  handler: async ({ title, description, frequency, frequencyCount, duration, category, priority, color }, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create periodic events',
        });
      }

      // Generate unique ID
      const id = crypto.randomUUID();

      // Create the periodic event
      await db.insert(PeriodicEvents).values({
        id,
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        frequency,
        frequencyCount,
        duration,
        category,
        priority,
        color: color || '#10b981',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        data: {
          id,
          title: title.trim(),
          description: description?.trim(),
          frequency,
          frequencyCount,
          duration,
          category,
          priority,
          color: color || '#10b981',
        },
      };
    } catch (error) {
      console.error('Error in createPeriodicEventAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create periodic event',
      });
    }
  },
});

/**
 * Get all periodic events for the current user
 */
export const getPeriodicEventsAction = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to view periodic events',
        });
      }

      const events = await db
        .select()
        .from(PeriodicEvents)
        .where(eq(PeriodicEvents.userId, session.user.id))
        .orderBy(PeriodicEvents.createdAt);
      
      return {
        success: true,
        data: events
      };
    } catch (error) {
      console.error('Error in getPeriodicEventsAction:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }
      
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to load periodic events',
      });
    }
  },
});