import type { ActionAPIContext } from 'astro:actions';
import { getScheduleBlocksDb } from '../db/get';
import type { ScheduleBlock } from '../models/ScheduleBlocks.types';
import type { CalendarEvent } from '../../calendar/models/Calendar.types';
import { handleFetchCalendar } from '../../calendar/providers/google-calendar/actions/fetchCalendar';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface ScheduleIndexPageData {
  scheduleBlocks: ScheduleBlock[];
  googleCalendarEvents: CalendarEvent[];
  calendarError: string | null;
  successMessage?: string;
  errorMessage?: string;
}

export async function handleScheduleIndexPage(
  context: ActionAPIContext,
  successMessage?: string,
  errorMessage?: string
): Promise<ScheduleIndexPageData | null> {
  try {
    if (!context.locals.user) {
      return null;
    }

    // Fetch schedule blocks
    const scheduleBlocks = await getScheduleBlocksDb(context.locals.user.id);

    // Fetch Google Calendar events
    let googleCalendarEvents: CalendarEvent[] = [];
    let calendarError: string | null = null;

    try {
      const today = new Date();
      const start = startOfMonth(today);
      const end = endOfMonth(today);

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

    return {
      scheduleBlocks,
      googleCalendarEvents,
      calendarError,
      successMessage,
      errorMessage,
    };
  } catch (error) {
    console.error('Error in handleScheduleIndexPage:', error);
    return null;
  }
}
