import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { handleScheduleIndexPage } from '../services/schedule-index-handler';
import type { ScheduleIndexPageData } from '../services/schedule-index-handler';

export const getScheduleIndexPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    successMessage: z.string().optional(),
    errorMessage: z.string().optional(),
  }),
  handler: async (
    { successMessage, errorMessage },
    context
  ): Promise<ScheduleIndexPageData> => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule management',
        });
      }

      const data = await handleScheduleIndexPage(
        context,
        successMessage,
        errorMessage
      );

      if (!data) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access schedule management',
        });
      }

      return data;
    } catch (error) {
      console.error('Error in getScheduleIndexPageDataAction:', error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch schedule index page data',
      });
    }
  },
});
