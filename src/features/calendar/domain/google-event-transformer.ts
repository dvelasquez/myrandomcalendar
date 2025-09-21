import { parseISO, isValid } from 'date-fns';
import type { CalendarEvent } from '../models/Calendar.types';
import type {
  GoogleCalendarApiEvent,
  GoogleCalendarEventFields,
} from '../providers/google-calendar/models/GoogleCalendar.types';

/**
 * Transforms Google Calendar API events to FullCalendar format
 * Handles all the type differences and field mappings
 */
export function transformGoogleApiEventsToFullCalendar(
  googleEvents: GoogleCalendarApiEvent[]
): CalendarEvent[] {
  return googleEvents.map((event, index) => {
    // Generate a unique ID if not provided
    const eventId = event.id || `event-${index}-${Date.now()}`;

    // Determine if it's an all-day event
    const isAllDay = !event.start?.dateTime && !!event.start?.date;

    // Extract and validate start time
    const startTime = event.start?.dateTime || event.start?.date;
    let validStartTime = new Date().toISOString();

    if (startTime) {
      try {
        const parsedStart = parseISO(startTime);
        if (isValid(parsedStart)) {
          validStartTime = startTime;
        }
      } catch (error) {
        console.warn('Invalid start date:', startTime, error);
      }
    }

    // Extract and validate end time
    let validEndTime: string | undefined;
    const endTime = event.end?.dateTime || event.end?.date;

    if (endTime) {
      try {
        const parsedEnd = parseISO(endTime);
        if (isValid(parsedEnd)) {
          validEndTime = endTime;
        }
      } catch (error) {
        console.warn('Invalid end date:', endTime, error);
      }
    }

    // Create color based on event properties
    const backgroundColor = getEventColor(event);

    return {
      id: eventId,
      title: event.summary || 'Untitled Event',
      start: validStartTime,
      end: validEndTime,
      allDay: isAllDay,
      description: event.description || undefined,
      location: event.location || undefined,
      url: event.htmlLink || undefined,
      backgroundColor,
      borderColor: darkenColor(backgroundColor),
      textColor: '#ffffff',
    };
  });
}

/**
 * Transforms FullCalendar events back to Google Calendar API format
 * Useful for creating/updating events via Google Calendar API
 */
export function transformFullCalendarToGoogleApi(
  fullCalendarEvents: CalendarEvent[]
): Partial<GoogleCalendarApiEvent>[] {
  return fullCalendarEvents.map(event => {
    const googleEvent: Partial<GoogleCalendarApiEvent> = {
      summary: event.title,
      description: event.description,
      location: event.location,
      htmlLink: event.url,
    };

    // Handle start time
    if (event.allDay) {
      googleEvent.start = {
        date: event.start.split('T')[0], // Extract date part
        timeZone: 'UTC',
      };
    } else {
      googleEvent.start = {
        dateTime: event.start,
        timeZone: 'UTC',
      };
    }

    // Handle end time
    if (event.end) {
      if (event.allDay) {
        googleEvent.end = {
          date: event.end.split('T')[0],
          timeZone: 'UTC',
        };
      } else {
        googleEvent.end = {
          dateTime: event.end,
          timeZone: 'UTC',
        };
      }
    }

    return googleEvent;
  });
}

/**
 * Type-safe field mapper for Google Calendar to FullCalendar
 */
export function mapGoogleToFullCalendar<T extends GoogleCalendarEventFields>(
  googleEvent: T
): Partial<CalendarEvent> {
  return {
    id: googleEvent.id || '',
    title: googleEvent.summary || '',
    description: googleEvent.description || undefined,
    location: googleEvent.location || undefined,
    url: googleEvent.htmlLink || undefined,
    // Note: start/end require special handling due to date format differences
  };
}

/**
 * Type-safe field mapper for FullCalendar to Google Calendar
 */
export function mapFullCalendarToGoogle<T extends CalendarEvent>(
  fullCalendarEvent: T
): Partial<GoogleCalendarApiEvent> {
  return {
    summary: fullCalendarEvent.title,
    description: fullCalendarEvent.description,
    location: fullCalendarEvent.location,
    htmlLink: fullCalendarEvent.url,
    // Note: start/end require special handling due to date format differences
  };
}

/**
 * Helper function to generate event colors
 */
function getEventColor(event: GoogleCalendarApiEvent): string {
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
  ];

  // Use event ID or summary to consistently assign colors
  const hash = (event.id || event.summary || '').split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Helper function to darken a color for borders
 */
function darkenColor(color: string): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darkenedR = Math.max(0, r - 30);
  const darkenedG = Math.max(0, g - 30);
  const darkenedB = Math.max(0, b - 30);

  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
}

/**
 * Type guard to check if an event is a Google Calendar API event
 */
export function isGoogleCalendarApiEvent(
  event: unknown
): event is GoogleCalendarApiEvent {
  return (
    event !== null &&
    typeof event === 'object' &&
    event !== null &&
    'summary' in event
  );
}

/**
 * Type guard to check if an event is a FullCalendar event
 */
export function isFullCalendarEvent(event: unknown): event is CalendarEvent {
  return (
    event !== null &&
    typeof event === 'object' &&
    event !== null &&
    'title' in event &&
    'start' in event
  );
}
