import { parseISO, isValid } from 'date-fns';
import type { ScheduleBlock } from '../../schedule/models/ScheduleBlocks.types';
import type {
  CalendarEvent,
  EventAggregationResult,
} from '../models/Calendar.types';
import { scheduleBlocksToCalendarEvents } from './schedule-event-transformer';

/**
 * Aggregates events from multiple sources into a unified calendar view
 *
 * @param startDate - Start date for event aggregation
 * @param endDate - End date for event aggregation
 * @param scheduleBlocks - User's schedule blocks
 * @param googleCalendarEvents - Events from Google Calendar
 * @param otherProviderEvents - Events from other providers (future)
 * @returns Aggregated events with metadata
 */
export async function aggregateCalendarEvents(
  startDate: Date,
  endDate: Date,
  scheduleBlocks: ScheduleBlock[],
  googleCalendarEvents: CalendarEvent[] = [],
  otherProviderEvents: CalendarEvent[] = []
): Promise<EventAggregationResult> {
  const providers: string[] = [];
  const allEvents: CalendarEvent[] = [];

  // Add schedule block events
  if (scheduleBlocks.length > 0) {
    const scheduleEvents = scheduleBlocksToCalendarEvents(
      scheduleBlocks.filter(block => block.isActive),
      startDate,
      endDate
    );

    // Mark schedule events with provider info
    const markedScheduleEvents = scheduleEvents.map(event => ({
      ...event,
      extendedProps: {
        ...event.extendedProps,
        provider: 'schedule',
        providerEventId: event.extendedProps?.scheduleBlockId || event.id,
      },
    }));

    allEvents.push(...markedScheduleEvents);
    providers.push('schedule');
  }

  // Add Google Calendar events
  if (googleCalendarEvents.length > 0) {
    const markedGoogleEvents = googleCalendarEvents.map(event => ({
      ...event,
      extendedProps: {
        ...event.extendedProps,
        provider: 'google',
        providerEventId: event.id,
      },
    }));

    allEvents.push(...markedGoogleEvents);
    providers.push('google');
  }

  // Add other provider events (future)
  if (otherProviderEvents.length > 0) {
    allEvents.push(...otherProviderEvents);
    providers.push('other');
  }

  // Sort events by start time
  const sortedEvents = allEvents.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    return aStart.getTime() - bStart.getTime();
  });

  return {
    events: sortedEvents,
    providers: [...new Set(providers)], // Remove duplicates
    totalEvents: sortedEvents.length,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

/**
 * Filters events by provider
 *
 * @param events - Array of calendar events
 * @param provider - Provider name to filter by
 * @returns Filtered events from the specified provider
 */
export function filterEventsByProvider(
  events: CalendarEvent[],
  provider: string
): CalendarEvent[] {
  return events.filter(event => event.extendedProps?.provider === provider);
}

/**
 * Gets events from a specific date range
 *
 * @param events - Array of calendar events
 * @param startDate - Start date
 * @param endDate - End date
 * @param includeOvernight - Whether to include overnight events
 * @returns Events within the specified date range
 */
export function getEventsInDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date,
  includeOvernight: boolean = true
): CalendarEvent[] {
  let searchStart = startDate;
  if (includeOvernight) {
    // Include previous day for overnight events
    searchStart = new Date(startDate);
    searchStart.setDate(searchStart.getDate() - 1);
  }

  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);

    // Include events that overlap with the search range
    return eventStart < endDate && eventEnd > searchStart;
  });
}

/**
 * Combines and sorts events from multiple sources
 *
 * @param eventArrays - Arrays of events from different sources
 * @returns Combined and sorted array of events
 */
export function combineAndSortEvents(
  ...eventArrays: CalendarEvent[][]
): CalendarEvent[] {
  const allEvents = eventArrays.flat();

  return allEvents.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    return aStart.getTime() - bStart.getTime();
  });
}

/**
 * Validates calendar event data
 *
 * @param event - Calendar event to validate
 * @returns True if event is valid, false otherwise
 */
export function validateCalendarEvent(event: CalendarEvent): boolean {
  try {
    // Check required fields
    if (!event.id || !event.title || !event.start) {
      return false;
    }

    // Validate date formats
    const startDate = parseISO(event.start);
    if (!isValid(startDate)) {
      return false;
    }

    if (event.end) {
      const endDate = parseISO(event.end);
      if (!isValid(endDate)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating calendar event:', error);
    return false;
  }
}

/**
 * Gets statistics about aggregated events
 *
 * @param events - Array of calendar events
 * @returns Event statistics
 */
export function getEventStatistics(events: CalendarEvent[]): {
  totalEvents: number;
  scheduleEvents: number;
  googleEvents: number;
  otherProviderEvents: number;
  allDayEvents: number;
  timedEvents: number;
} {
  const scheduleEvents = events.filter(
    event => event.extendedProps?.provider === 'schedule'
  ).length;

  const googleEvents = events.filter(
    event => event.extendedProps?.provider === 'google'
  ).length;

  const otherProviderEvents = events.filter(
    event =>
      event.extendedProps?.provider &&
      event.extendedProps.provider !== 'schedule' &&
      event.extendedProps.provider !== 'google'
  ).length;

  const allDayEvents = events.filter(event => event.allDay).length;
  const timedEvents = events.filter(event => !event.allDay).length;

  return {
    totalEvents: events.length,
    scheduleEvents,
    googleEvents,
    otherProviderEvents,
    allDayEvents,
    timedEvents,
  };
}
