import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { handleScheduleAvailabilityPage } from "../services/schedule-availability-handler";
import type { ScheduleAvailabilityPageData } from "../services/schedule-availability-handler";

export const getScheduleAvailabilityPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    selectedDate: z.string(),
  }),
  handler: async ({ selectedDate }, context): Promise<ScheduleAvailabilityPageData> => {
    try {
      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access availability data'
        });
      }

      const date = new Date(selectedDate);
      const data = await handleScheduleAvailabilityPage(context, date);

      if (!data) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access availability data'
        });
      }

      return data;
    } catch (error) {
      console.error('Error in getScheduleAvailabilityPageDataAction:', error);
      if (error instanceof ActionError) {
        throw error;
      }
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch schedule availability page data',
      });
    }
  },
});
