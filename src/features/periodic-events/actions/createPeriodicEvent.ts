import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../../lib/better-auth";
import { createPeriodicEventDb } from "../db/create";
import { periodicEventSchema } from "../models/PeriodicEvents.schema";

/**
 * Create a new periodic event
 */
export const createPeriodicEvent = defineAction({
  accept: 'form',
  input: periodicEventSchema,
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

      const result = await createPeriodicEventDb({ title, description, frequency, frequencyCount, duration, category, priority, color }, session.user.id);

      return {
        success: true,
        data: result
      };
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