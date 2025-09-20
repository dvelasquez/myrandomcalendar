import { defineAction, ActionError } from 'astro:actions';
import { parseISO } from 'date-fns';
import { calculateAvailabilityForDateRange, DEFAULT_AVAILABILITY_CONFIG } from '../../schedule/domain/availability-calculator';
import type { ScheduleBlock } from '../../schedule/models/ScheduleBlocks.types';
import { transformTimeSlotsToBackgroundEvents, DEFAULT_BACKGROUND_EVENT_CONFIG } from '../domain/background-event-transformer';
import { availabilityCalculationSchema } from '../models/Calendar.schema';
import type { CalendarEvent } from '../models/Calendar.types';

export const calculateAvailability = defineAction({
  accept: 'form',
  input: availabilityCalculationSchema,
  handler: async ({ startDate, endDate, includeOvernightEvents, timezone }, context) => {
    try {
      // Parse dates using date-fns (already validated by Zod)
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to calculate availability',
        });
      }

      // TODO: Fetch schedule blocks and calendar events from database
      // For now, return empty time slots
      const scheduleBlocks: ScheduleBlock[] = [];
      const calendarEvents: CalendarEvent[] = [];

      // Calculate availability
      const timeSlots = await calculateAvailabilityForDateRange(
        start,
        end,
        scheduleBlocks,
        calendarEvents,
        {
          ...DEFAULT_AVAILABILITY_CONFIG,
          includeOvernightEvents,
          timezone,
        }
      );

      return {
        success: true,
        timeSlots,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
    } catch (error) {
      console.error('Availability calculation error:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to calculate availability',
      });
    }
  },
});

export const getBackgroundEvents = defineAction({
  accept: 'form',
  input: availabilityCalculationSchema,
  handler: async ({ startDate, endDate, includeOvernightEvents, timezone }, context) => {
    try {
      // Parse dates using date-fns (already validated by Zod)
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (!context.locals.user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get background events',
        });
      }

      // TODO: Fetch schedule blocks and calendar events from database
      // For now, return empty background events
      const scheduleBlocks: ScheduleBlock[] = [];
      const calendarEvents: CalendarEvent[] = [];

      // Calculate availability
      const timeSlots = await calculateAvailabilityForDateRange(
        start,
        end,
        scheduleBlocks,
        calendarEvents,
        {
          ...DEFAULT_AVAILABILITY_CONFIG,
          includeOvernightEvents,
          timezone,
        }
      );

      // Transform to background events
      const backgroundEvents = transformTimeSlotsToBackgroundEvents(
        timeSlots,
        DEFAULT_BACKGROUND_EVENT_CONFIG
      );

      return {
        success: true,
        backgroundEvents,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
    } catch (error) {
      console.error('Background events error:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get background events',
      });
    }
  },
});
