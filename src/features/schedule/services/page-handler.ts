import { type ActionAPIContext } from 'astro:actions';
import { endOfDay, startOfDay } from 'date-fns';
import type { BackgroundEvent } from '../../calendar/domain/background-event-transformer';
import {
  DEFAULT_BACKGROUND_EVENT_CONFIG,
  transformTimeSlotsToBackgroundEvents,
} from '../../calendar/domain/background-event-transformer';
import { transformGoogleApiEventsToFullCalendar } from '../../calendar/domain/google-event-transformer';
import type {
  CalendarEvent,
  TimeSlot,
} from '../../calendar/models/Calendar.types';
import type { GoogleCalendarApiEvent } from '../../calendar/providers/google-calendar/models/GoogleCalendar.types';
import { getScheduleBlocksDb } from '../db/get';
import {
  calculateAvailability,
  calculateAvailabilityForDateRange,
  DEFAULT_AVAILABILITY_CONFIG,
} from '../domain/availability-calculator';
import type { ScheduleBlock } from '../models/ScheduleBlocks.types';
import { handleFetchCalendar } from '@/features/calendar/providers/google-calendar/actions/fetchCalendar';

// Types for page data
export interface SchedulePageData {
  scheduleBlocks: ScheduleBlock[];
  googleCalendarEvents: CalendarEvent[];
  calendarError: string | null;
}

export interface AvailabilityPageData extends SchedulePageData {
  availabilityTimeSlots: TimeSlot[]; // Will be properly typed when we move availability calculation
}

// Fetch schedule blocks
export async function fetchScheduleBlocks(
  context: ActionAPIContext
): Promise<ScheduleBlock[]> {
  try {
    const userId = context.locals.user?.id;
    if (!userId) {
      throw new Error('User not found');
    }
    const result = await getScheduleBlocksDb(userId);
    return result || [];
  } catch (error) {
    console.error('Error fetching schedule blocks:', error);
    return [];
  }
}

// Fetch Google Calendar events for a date range
export async function fetchGoogleCalendarEvents(
  context: ActionAPIContext,
  startDate: Date,
  endDate: Date
): Promise<{ events: CalendarEvent[]; error: string | null }> {
  try {
    const result = await handleFetchCalendar(
      { startDate: startDate, endDate: endDate },
      context
    );
    const googleApiEvents = result.events as GoogleCalendarApiEvent[];
    const events = transformGoogleApiEventsToFullCalendar(googleApiEvents);
    return { events, error: null };
  } catch (err) {
    const error =
      (err as Error).message ||
      'An error occurred while fetching calendar data';
    console.error('Calendar fetch error:', err);
    return { events: [], error };
  }
}

// Get combined schedule page data (schedule blocks + calendar events)
export async function getSchedulePageData(
  context: ActionAPIContext,
  startDate?: Date,
  endDate?: Date
): Promise<SchedulePageData> {
  const today = new Date();
  const start = startDate || startOfDay(today);
  const end = endDate || endOfDay(today);

  const scheduleBlocks = await fetchScheduleBlocks(context);
  const { events: googleCalendarEvents, error: calendarError } =
    await fetchGoogleCalendarEvents(context, start, end);

  return {
    scheduleBlocks,
    googleCalendarEvents,
    calendarError,
  };
}

// Get availability page data (includes availability calculation)
export async function getAvailabilityPageData(
  context: ActionAPIContext,
  selectedDate: Date
): Promise<AvailabilityPageData> {
  const start = startOfDay(selectedDate);
  const end = endOfDay(selectedDate);

  const scheduleBlocks = await fetchScheduleBlocks(context);
  const { events: googleCalendarEvents, error: calendarError } =
    await fetchGoogleCalendarEvents(context, start, end);

  // Calculate availability using schedule domain
  let availabilityTimeSlots: TimeSlot[] = [];
  if (!calendarError && scheduleBlocks.length > 0) {
    try {
      // Import availability calculation from schedule domain
      availabilityTimeSlots = await calculateAvailability(
        selectedDate,
        scheduleBlocks,
        googleCalendarEvents,
        DEFAULT_AVAILABILITY_CONFIG
      );
    } catch (err) {
      console.error('Error calculating availability:', err);
    }
  }

  return {
    scheduleBlocks,
    googleCalendarEvents,
    calendarError,
    availabilityTimeSlots,
  };
}

// Get calendar page data (includes background events)
export async function getCalendarPageData(
  context: ActionAPIContext,
  startDate: Date,
  endDate: Date
): Promise<{
  scheduleBlocks: ScheduleBlock[];
  googleCalendarEvents: CalendarEvent[];
  availabilityBackgroundEvents: BackgroundEvent[];
  calendarError: string | null;
}> {
  const scheduleBlocks = await fetchScheduleBlocks(context);
  const { events: googleCalendarEvents, error: calendarError } =
    await fetchGoogleCalendarEvents(context, startDate, endDate);

  let availabilityBackgroundEvents: BackgroundEvent[] = [];
  if (!calendarError && scheduleBlocks.length > 0) {
    try {
      // Import availability and background event calculation from schedule domain

      const timeSlots = await calculateAvailabilityForDateRange(
        startDate,
        endDate,
        scheduleBlocks,
        googleCalendarEvents,
        DEFAULT_AVAILABILITY_CONFIG
      );

      const backgroundEvents = transformTimeSlotsToBackgroundEvents(
        timeSlots,
        DEFAULT_BACKGROUND_EVENT_CONFIG
      );

      availabilityBackgroundEvents = backgroundEvents;
    } catch (err) {
      console.error('Error calculating availability background events:', err);
    }
  }

  return {
    scheduleBlocks,
    googleCalendarEvents,
    availabilityBackgroundEvents,
    calendarError,
  };
}
