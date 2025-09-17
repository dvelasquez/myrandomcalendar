import { endOfDay, isAfter, isBefore, startOfDay, subDays } from 'date-fns';
import type { ScheduleBlock } from '../features/schedule/models/ScheduleBlocks.types';
import type { CalendarEvent } from './types';

/**
 * Time slot interface for availability calculation
 */
export interface TimeSlot {
  start: string;
  end: string;
  type: 'available' | 'busy' | 'schedule-block';
  title?: string;
  priority?: string;
  color?: string;
}

/**
 * Configuration for availability calculation
 */
export interface AvailabilityConfig {
  timeSlotDurationMinutes: number;
  startHour: number;
  endHour: number;
  includeOvernightEvents: boolean;
}

/**
 * Default configuration for availability calculation
 */
export const DEFAULT_AVAILABILITY_CONFIG: AvailabilityConfig = {
  timeSlotDurationMinutes: 60, // Not used anymore, kept for compatibility
  startHour: 0, // Start at midnight
  endHour: 24, // End at midnight (24 hours)
  includeOvernightEvents: true
};

/**
 * Pure function to calculate availability for a given date
 * 
 * @param date - The date to calculate availability for
 * @param scheduleBlocks - User's schedule blocks
 * @param calendarEvents - Google Calendar events
 * @param config - Configuration for calculation
 * @returns Array of time slots with availability status
 */
export async function calculateAvailability(
  date: Date,
  scheduleBlocks: ScheduleBlock[],
  calendarEvents: CalendarEvent[],
  config: AvailabilityConfig = DEFAULT_AVAILABILITY_CONFIG
): Promise<TimeSlot[]> {
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);
  
  // Get all events for the day (including overnight events if configured)
  const allEvents = await getAllEventsForDate(
    date,
    scheduleBlocks,
    calendarEvents,
    config.includeOvernightEvents
  );
  
  // Generate time slots
  return generateTimeSlots(startOfDay, endOfDay, allEvents);
}

/**
 * Pure function to calculate availability for multiple days
 * 
 * @param startDate - The start date for calculation
 * @param endDate - The end date for calculation
 * @param scheduleBlocks - User's schedule blocks
 * @param calendarEvents - Google Calendar events
 * @param config - Configuration for calculation
 * @returns Array of time slots with availability status for all days
 */
export async function calculateAvailabilityForDateRange(
  startDate: Date,
  endDate: Date,
  scheduleBlocks: ScheduleBlock[],
  calendarEvents: CalendarEvent[],
  config: AvailabilityConfig = DEFAULT_AVAILABILITY_CONFIG
): Promise<TimeSlot[]> {
  const allTimeSlots: TimeSlot[] = [];
  const currentDate = new Date(startDate);
  
  // Calculate availability for each day in the range
  while (currentDate <= endDate) {
    const daySlots = await calculateAvailability(
      currentDate,
      scheduleBlocks,
      calendarEvents,
      config
    );
    
    allTimeSlots.push(...daySlots);
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return allTimeSlots;
}

/**
 * Pure function to get start of day for a given date
 * Uses date-fns for timezone-safe operations
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Pure function to get end of day for a given date
 * Uses date-fns for timezone-safe operations
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

/**
 * Pure function to get all events for a specific date
 * 
 * @param date - The date to get events for
 * @param scheduleBlocks - User's schedule blocks
 * @param calendarEvents - Google Calendar events
 * @param includeOvernight - Whether to include overnight events from previous day
 * @returns Combined array of events
 */
export async function getAllEventsForDate(
  date: Date,
  scheduleBlocks: ScheduleBlock[],
  calendarEvents: CalendarEvent[],
  includeOvernight: boolean = true
): Promise<CalendarEvent[]> {
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);
  
  // Get schedule block events for the day
  const scheduleBlockEvents = await getScheduleBlockEventsForDate(
    scheduleBlocks,
    startOfDay,
    endOfDay,
    includeOvernight
  );
  
  // Get Google Calendar events for the day
  const googleEvents = getGoogleCalendarEventsForDate(
    calendarEvents,
    startOfDay,
    endOfDay,
    includeOvernight
  );
  
  // Combine and sort events
  return combineAndSortEvents(scheduleBlockEvents, googleEvents);
}

/**
 * Pure function to get schedule block events for a date range
 */
export async function getScheduleBlockEventsForDate(
  scheduleBlocks: ScheduleBlock[],
  startOfDay: Date,
  endOfDay: Date,
  includeOvernight: boolean
): Promise<CalendarEvent[]> {
  // Import the transformer function dynamically to avoid circular dependencies
  const { scheduleBlocksToCalendarEvents } = await import('./schedule-transformers');
  
  let startDate = startOfDay;
  if (includeOvernight) {
    // Include previous day for overnight events using date-fns
    startDate = subDays(startOfDay, 1);
  }
  
  return scheduleBlocksToCalendarEvents(
    scheduleBlocks.filter(block => block.isActive),
    startDate,
    endOfDay
  );
}

/**
 * Pure function to get Google Calendar events for a date range
 */
export function getGoogleCalendarEventsForDate(
  calendarEvents: CalendarEvent[],
  startOfDay: Date,
  endOfDay: Date,
  includeOvernight: boolean
): CalendarEvent[] {
  let searchStart = startOfDay;
  if (includeOvernight) {
    // Include previous day for overnight events using date-fns
    searchStart = subDays(startOfDay, 1);
  }
  
  return calendarEvents.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);
    
    // Include events that overlap with the search range
    return eventStart < endOfDay && eventEnd > searchStart;
  });
}

/**
 * Pure function to combine and sort events
 */
export function combineAndSortEvents(
  scheduleBlockEvents: CalendarEvent[],
  googleEvents: CalendarEvent[]
): CalendarEvent[] {
  const allEvents = [...scheduleBlockEvents, ...googleEvents];
  
  return allEvents.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    return aStart.getTime() - bStart.getTime();
  });
}

/**
 * Pure function to generate time slots for a date range
 * Now uses intelligent merging instead of hourly slots
 */
export function generateTimeSlots(
  startOfDay: Date,
  endOfDay: Date,
  events: CalendarEvent[]
): TimeSlot[] {
  // Create a timeline of events and gaps
  const timeline = createEventTimeline(startOfDay, endOfDay, events);
  
  // Merge contiguous slots of the same type
  return mergeContiguousSlots(timeline);
}

/**
 * Pure function to create a timeline of events and availability gaps
 */
function createEventTimeline(
  startOfDay: Date,
  endOfDay: Date,
  events: CalendarEvent[]
): TimeSlot[] {
  const timeline: TimeSlot[] = [];
  
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  
  let currentTime = new Date(startOfDay);
  
  for (const event of sortedEvents) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);
    
    // Add available slot before this event (if there's a gap)
    if (eventStart > currentTime) {
      timeline.push({
        start: currentTime.toISOString(),
        end: eventStart.toISOString(),
        type: 'available'
      });
    }
    
    // Add the event as a busy/schedule-block slot
    const isScheduleBlock = event.extendedProps?.isScheduleBlock;
    timeline.push({
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      type: isScheduleBlock ? 'schedule-block' : 'busy',
      title: event.title,
      priority: event.extendedProps?.priority,
      color: event.backgroundColor
    });
    
    // Update current time to after this event
    currentTime = new Date(Math.max(currentTime.getTime(), eventEnd.getTime()));
  }
  
  // Add final available slot if there's time remaining
  if (currentTime < endOfDay) {
    timeline.push({
      start: currentTime.toISOString(),
      end: endOfDay.toISOString(),
      type: 'available'
    });
  }
  
  return timeline;
}

/**
 * Pure function to merge contiguous slots of the same type
 */
function mergeContiguousSlots(slots: TimeSlot[]): TimeSlot[] {
  if (slots.length === 0) return [];
  
  const merged: TimeSlot[] = [];
  let currentSlot = { ...slots[0] };
  
  for (let i = 1; i < slots.length; i++) {
    const nextSlot = slots[i];
    
    // Check if we can merge with the next slot
    if (canMergeSlots(currentSlot, nextSlot)) {
      // Merge: extend the end time
      currentSlot.end = nextSlot.end;
      
      // For schedule blocks, combine titles if they're different
      if (currentSlot.type === 'schedule-block' && nextSlot.title && 
          currentSlot.title !== nextSlot.title) {
        currentSlot.title = `${currentSlot.title} + ${nextSlot.title}`;
      }
    } else {
      // Can't merge: add current slot and start new one
      merged.push(currentSlot);
      currentSlot = { ...nextSlot };
    }
  }
  
  // Add the last slot
  merged.push(currentSlot);
  
  return merged;
}

/**
 * Pure function to check if two slots can be merged
 */
function canMergeSlots(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Can only merge slots of the same type
  if (slot1.type !== slot2.type) return false;
  
  // For schedule blocks, only merge if they have the same title or compatible titles
  if (slot1.type === 'schedule-block') {
    // Allow merging if titles are the same or one is undefined
    if (slot1.title && slot2.title && slot1.title !== slot2.title) {
      // Only merge if they're the same type of schedule block
      return slot1.title === slot2.title;
    }
  }
  
  // Check if slots are contiguous (end of slot1 equals start of slot2)
  const slot1End = new Date(slot1.end);
  const slot2Start = new Date(slot2.start);
  
  // Allow small gaps (up to 1 minute) for floating point precision issues
  const timeDiff = Math.abs(slot2Start.getTime() - slot1End.getTime());
  return timeDiff <= 60000; // 1 minute tolerance
}

/**
 * Pure function to find conflicting event for a time slot
 * Uses date-fns for better date comparisons
 */
export function findConflictingEvent(
  slotStart: Date,
  slotEnd: Date,
  events: CalendarEvent[]
): CalendarEvent | undefined {
  return events.find(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end || event.start);
    
    // Check if the event overlaps with this time slot
    // An event conflicts if:
    // 1. Event starts before slot ends AND event ends after slot starts
    // 2. This covers all overlap scenarios including overnight events
    return isBefore(eventStart, slotEnd) && isAfter(eventEnd, slotStart);
  });
}

/**
 * Pure function to calculate availability statistics
 */
export function calculateAvailabilityStats(timeSlots: TimeSlot[]): {
  totalSlots: number;
  availableSlots: number;
  busySlots: number;
  scheduleBlockSlots: number;
  availabilityPercentage: number;
} {
  const totalSlots = timeSlots.length;
  const availableSlots = timeSlots.filter(slot => slot.type === 'available').length;
  const busySlots = timeSlots.filter(slot => slot.type === 'busy').length;
  const scheduleBlockSlots = timeSlots.filter(slot => slot.type === 'schedule-block').length;
  const availabilityPercentage = totalSlots > 0 ? (availableSlots / totalSlots) * 100 : 0;
  
  return {
    totalSlots,
    availableSlots,
    busySlots,
    scheduleBlockSlots,
    availabilityPercentage: Math.round(availabilityPercentage * 100) / 100
  };
}

/**
 * Pure function to filter time slots by type
 */
export function filterTimeSlotsByType(
  timeSlots: TimeSlot[],
  type: 'available' | 'busy' | 'schedule-block'
): TimeSlot[] {
  return timeSlots.filter(slot => slot.type === type);
}

/**
 * Pure function to get available time slots
 */
export function getAvailableTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
  return filterTimeSlotsByType(timeSlots, 'available');
}

/**
 * Pure function to get busy time slots
 */
export function getBusyTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
  return filterTimeSlotsByType(timeSlots, 'busy');
}

/**
 * Pure function to get schedule block time slots
 */
export function getScheduleBlockTimeSlots(timeSlots: TimeSlot[]): TimeSlot[] {
  return filterTimeSlotsByType(timeSlots, 'schedule-block');
}
