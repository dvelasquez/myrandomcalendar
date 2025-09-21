import { ActionError, defineAction } from 'astro:actions';
import { createPeriodicEventDb } from '../db/create';
import { PeriodicEventFormSchema } from '../models/PeriodicEvents.schema';
import type {
  NewPeriodicEvent,
  PeriodicEvent as PeriodicEventType,
} from '../models/PeriodicEvents.types';

/**
 * Create a new periodic event
 */
export const createPeriodicEvent = defineAction({
  accept: 'form',
  input: PeriodicEventFormSchema,
  handler: async (
    {
      title,
      description,
      frequency,
      frequencyCount,
      duration,
      category,
      priority,
      color,
    },
    context
  ): Promise<PeriodicEventType> => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to create periodic events',
        });
      }

      const newPeriodicEvent: NewPeriodicEvent = {
        title,
        description,
        frequency,
        frequencyCount,
        duration,
        category,
        priority,
        color,
        userId: context.locals.user.id,
      };

      const result = await createPeriodicEventDb(newPeriodicEvent);

      return result;
    } catch (error) {
      console.error('Error in createPeriodicEvent:', error);

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
