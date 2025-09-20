import type { ActionAPIContext } from 'astro:actions';
import { getScheduleBlocksDb } from '../db/get';
import type { CalendarEvent, TimeSlot } from '../../calendar/models/Calendar.types';
import { handleFetchCalendar } from '../../calendar/providers/google-calendar/actions/fetchCalendar';
import { calculateAvailabilityForDateRange, DEFAULT_AVAILABILITY_CONFIG } from '../domain/availability-calculator';
import { startOfDay, endOfDay } from 'date-fns';

export interface ScheduleAvailabilityPageData {
  googleCalendarEvents: CalendarEvent[];
  availabilityTimeSlots: TimeSlot[];
  calendarError: string | null;
  selectedDate: Date;
}

export async function handleScheduleAvailabilityPage(
  context: ActionAPIContext,
  selectedDate: Date
): Promise<ScheduleAvailabilityPageData | null> {
  try {
    if (!context.locals.user) {
      return null;
    }

    // Fetch schedule blocks
    const scheduleBlocks = await getScheduleBlocksDb(context.locals.user.id);

    // Calculate date range for the selected date
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

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

    // Calculate availability time slots
    let availabilityTimeSlots: TimeSlot[] = [];
    
    if (scheduleBlocks.length > 0) {
      try {
        availabilityTimeSlots = await calculateAvailabilityForDateRange(
          start,
          end,
          scheduleBlocks,
          googleCalendarEvents,
          DEFAULT_AVAILABILITY_CONFIG
        );
      } catch (error) {
        console.error('Error calculating availability:', error);
        // Don't fail the entire request if availability calculation fails
      }
    }

    return {
      googleCalendarEvents,
      availabilityTimeSlots,
      calendarError,
      selectedDate,
    };
  } catch (error) {
    console.error('Error in handleScheduleAvailabilityPage:', error);
    return null;
  }
}
