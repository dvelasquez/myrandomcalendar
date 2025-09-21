import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { handleCalendarPage } from '../services/page-handler';
import type { CalendarPageData } from '../services/page-handler';

/**
 * Get calendar page data action
 * This action fetches all the data needed for the calendar page
 */
export const getCalendarPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  handler: async (
    { startDate, endDate },
    context
  ): Promise<CalendarPageData> => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch calendar data',
        });
      }

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const data = await handleCalendarPage(context, start, end);

      if (!data) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch calendar data',
        });
      }

      return data;
    } catch (error) {
      console.error('Error in getCalendarPageDataAction:', error);

      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch calendar page data',
      });
    }
  },
});
