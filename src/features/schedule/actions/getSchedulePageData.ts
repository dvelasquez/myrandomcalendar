import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "../../auth/lib/better-auth";
import { getSchedulePageData, getAvailabilityPageData, getCalendarPageData } from "../services/page-handler";
import type { SchedulePageData, AvailabilityPageData } from "../services/page-handler";

// Combined data fetching action for schedule pages
export const getSchedulePageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
  handler: async ({ startDate, endDate }, context): Promise<SchedulePageData> => {
    const { request } = context;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch schedule data'
        });
      }

      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const data = await getSchedulePageData(context, start, end);
      return data;
    } catch (error) {
      console.error('Error in getSchedulePageDataAction:', error);

      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch schedule page data',
      });
    }
  },
});

// Combined data fetching action for availability pages
export const getAvailabilityPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    selectedDate: z.string(),
  }),
  handler: async ({ selectedDate }, context): Promise<AvailabilityPageData> => {
    const { request } = context;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch availability data'
        });
      }

      const date = new Date(selectedDate);
      const data = await getAvailabilityPageData(context, date);
      return data;
    } catch (error) {
      console.error('Error in getAvailabilityPageDataAction:', error);

      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch availability page data',
      });
    }
  },
});

// Combined data fetching action for calendar pages
export const getCalendarPageDataAction = defineAction({
  accept: 'form',
  input: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  handler: async ({ startDate, endDate }, context) => {
    const { request } = context;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to fetch calendar data'
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const data = await getCalendarPageData(context, start, end);
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

// Calendar refresh action
export const refreshCalendarDataAction = defineAction({
  accept: 'form',
  input: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  handler: async ({ startDate, endDate }, context) => {
    const { request } = context;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to refresh calendar data'
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Use the same logic as calendar page data but return raw calendar events
      const { googleCalendarEvents, calendarError } = await getCalendarPageData(context, start, end);
      
      if (calendarError) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: calendarError,
        });
      }

      return {
        success: true,
        events: googleCalendarEvents,
        message: 'Calendar data refreshed successfully'
      };
    } catch (error) {
      console.error('Error in refreshCalendarDataAction:', error);

      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to refresh calendar data',
      });
    }
  },
});
