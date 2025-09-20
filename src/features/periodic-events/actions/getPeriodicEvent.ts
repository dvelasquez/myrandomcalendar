import { ActionError, defineAction } from "astro:actions";
import { auth } from "../../auth/lib/better-auth";
import { getPeriodicEventsDb } from "../db/get";
import type { PeriodicEvent as PeriodicEventType } from "../models/PeriodicEvents.types";

/**
 * Get all periodic events for the current user
 */
export const getPeriodicEvents = defineAction({
  accept: 'form',
  handler: async (_, { request }): Promise<PeriodicEventType[]> => {
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

      const events = await getPeriodicEventsDb(session.user.id);

      return events;
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