import type { ActionAPIContext } from 'astro:actions';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getScheduleBlocksDb } from '../../schedule/db/get';
import { calculateAvailabilityForDateRange, DEFAULT_AVAILABILITY_CONFIG } from '../../schedule/domain/availability-calculator';
import type { ScheduleBlock } from '../../schedule/models/ScheduleBlocks.types'; 
import { transformTimeSlotsToBackgroundEvents, DEFAULT_BACKGROUND_EVENT_CONFIG } from '../domain/background-event-transformer';
import type { BackgroundEvent } from '../domain/background-event-transformer';
import type { CalendarEvent } from '../models/Calendar.types';
import { handleFetchCalendar } from '../providers/google-calendar/actions/fetchCalendar';

/**
 * Calendar page data interface
 */
export interface CalendarPageData {
  scheduleBlocks: ScheduleBlock[];
  googleCalendarEvents: CalendarEvent[];
  availabilityBackgroundEvents: BackgroundEvent[];
  calendarError: string | null;
  calendarData: {
    success: boolean;
    events: CalendarEvent[];
    calendarId: string | null | undefined;
    timeZone: string | null | undefined;
  } | null;
  fullCalendarEvents: CalendarEvent[];
}

/**
 * Handle calendar page data fetching
 * This function encapsulates all the logic for fetching and processing calendar data
 */
export async function handleCalendarPage(
  context: ActionAPIContext,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarPageData | null> {
  // Check if user is authenticated
  if (!context.locals.user) {
    return null;
  }

  try {
    // Use provided dates or default to current month
    const today = new Date();
    const start = startDate || startOfMonth(today);
    const end = endDate || endOfMonth(today);

    // Fetch schedule blocks for the user
    const scheduleBlocks = await getScheduleBlocksDb(context.locals.user.id);

    // Fetch Google Calendar events
    let googleCalendarEvents: CalendarEvent[] = [];
    let calendarError: string | null = null;

    try {
      const calendarResponse = await handleFetchCalendar({ startDate: start, endDate: end }, context);
      googleCalendarEvents = calendarResponse.events.map(event => ({
        id: event.id || `google-${Date.now()}`,
        title: event.summary || 'Untitled Event',
        start: event.start?.dateTime || event.start?.date || new Date().toISOString(),
        end: event.end?.dateTime || event.end?.date || undefined,
        allDay: !event.start?.dateTime && !!event.start?.date,
        description: event.description || undefined,
        location: event.location || undefined,
        url: event.htmlLink || undefined,
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af',
        textColor: '#ffffff',
        extendedProps: {
          provider: 'google',
          providerEventId: event.id,
        }
      } as CalendarEvent));
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      calendarError = error instanceof Error ? error.message : 'Failed to fetch calendar events';
    }

    // Calculate availability background events
    let availabilityBackgroundEvents: BackgroundEvent[] = [];
    
    if (scheduleBlocks.length > 0) {
      try {
        const timeSlots = await calculateAvailabilityForDateRange(
          start,
          end,
          scheduleBlocks,
          googleCalendarEvents,
          DEFAULT_AVAILABILITY_CONFIG
        );

        availabilityBackgroundEvents = transformTimeSlotsToBackgroundEvents(
          timeSlots,
          DEFAULT_BACKGROUND_EVENT_CONFIG
        );
      } catch (error) {
        console.error('Error calculating availability:', error);
        // Don't fail the entire request if availability calculation fails
      }
    }

    // Create calendar data structure for compatibility
    const calendarData = {
      success: !calendarError,
      events: googleCalendarEvents,
      calendarId: 'primary',
      timeZone: 'UTC'
    };

    // Combine calendar events with background events
    const fullCalendarEvents = [...googleCalendarEvents, ...availabilityBackgroundEvents];

    return {
      scheduleBlocks,
      googleCalendarEvents,
      availabilityBackgroundEvents,
      calendarError,
      calendarData,
      fullCalendarEvents
    };

  } catch (error) {
    console.error('Error in handleCalendarPage:', error);
    throw error;
  }
}

/**
 * Handle calendar refresh for a specific date range
 * This function is used when the user changes the date range or refreshes the calendar
 */
export async function handleCalendarRefresh(
  context: ActionAPIContext,
  startDate: Date,
  endDate: Date
): Promise<CalendarPageData | null> {
  return handleCalendarPage(context, startDate, endDate);
}
