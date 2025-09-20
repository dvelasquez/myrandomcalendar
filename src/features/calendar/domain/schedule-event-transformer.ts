import { addDays, addMinutes, format, startOfDay, set, addDays as addDay } from 'date-fns';
import type { ScheduleBlock, ScheduleBlockType, SchedulePriority } from '../../schedule/models/ScheduleBlocks.types';
import type { CalendarEvent } from '../models/Calendar.types';

/**
 * Transforms ScheduleBlocks to CalendarEvents for FullCalendar display
 * Generates recurring events based on schedule preferences
 */
export function scheduleBlocksToCalendarEvents(
  scheduleBlocks: ScheduleBlock[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  for (const block of scheduleBlocks) {
    if (!block.isActive) continue;
    
    // Generate events for each day in the date range
    const blockEvents = generateEventsForDateRange(block, startDate, endDate);
    events.push(...blockEvents);
  }
  
  return events;
}

/**
 * Generates CalendarEvents for a single ScheduleBlock across a date range
 */
function generateEventsForDateRange(
  block: ScheduleBlock,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  // Parse days of week
  const daysOfWeek = typeof block.daysOfWeek === 'string' 
    ? JSON.parse(block.daysOfWeek) 
    : block.daysOfWeek;
  
  // Generate events for each day in the range
  let currentDate = startOfDay(startDate);
  const finalDate = startOfDay(endDate);
  
  while (currentDate <= finalDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if this day matches the schedule block's days
    if (daysOfWeek.includes(dayOfWeek)) {
      const event = generateEventForDate(block, currentDate);
      if (event) {
        events.push(event);
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return events;
}

/**
 * Generates a single CalendarEvent for a specific date
 */
function generateEventForDate(
  block: ScheduleBlock,
  date: Date
): CalendarEvent | null {
  try {
    // Parse start and end times
    const startTime = parseTime(block.startTime);
    const endTime = parseTime(block.endTime);
    
    if (!startTime || !endTime) {
      console.warn('Invalid time format for schedule block:', block.id);
      return null;
    }
    
    // Create start datetime using date-fns
    const startDateTime = set(date, { hours: startTime.hours, minutes: startTime.minutes, seconds: 0, milliseconds: 0 });
    
    // Create end datetime using date-fns
    const endDateTime = set(date, { hours: endTime.hours, minutes: endTime.minutes, seconds: 0, milliseconds: 0 });
    
    // Handle overnight events (e.g., sleep from 22:00 to 06:00)
    const finalEndDateTime = endDateTime <= startDateTime ? addDay(endDateTime, 1) : endDateTime;
    
    // Apply buffer times
    const bufferedStart = addMinutes(startDateTime, -block.bufferBefore);
    const bufferedEnd = addMinutes(finalEndDateTime, block.bufferAfter);
    
    // Generate unique ID for this occurrence
    const eventId = `${block.id}-${format(date, 'yyyy-MM-dd')}`;
    
    return {
      id: eventId,
      title: block.title,
      start: bufferedStart.toISOString(),
      end: bufferedEnd.toISOString(),
      allDay: false,
      description: block.description || undefined,
      backgroundColor: block.color,
      borderColor: darkenColor(block.color),
      textColor: '#ffffff',
      // Add metadata to identify this as a schedule block
      extendedProps: {
        scheduleBlockId: block.id,
        scheduleBlockType: block.type as ScheduleBlockType,
        priority: block.priority as SchedulePriority,
        isScheduleBlock: true
      }
    };
  } catch (error) {
    console.error('Error generating event for schedule block:', block.id, error);
    return null;
  }
}

/**
 * Parses time string (e.g., "09:00") into hours and minutes
 */
function parseTime(timeString: string): { hours: number; minutes: number } | null {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return null;
    }
    return { hours, minutes };
  } catch {
    return null;
  }
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
 * Combines Google Calendar events with generated schedule block events
 */
export function combineCalendarEvents(
  googleEvents: CalendarEvent[],
  scheduleBlockEvents: CalendarEvent[]
): CalendarEvent[] {
  // Combine and sort by start time
  const allEvents = [...googleEvents, ...scheduleBlockEvents];
  
  return allEvents.sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);
    return aStart.getTime() - bStart.getTime();
  });
}

/**
 * Gets the default color for a schedule block type
 */
export function getDefaultColorForScheduleType(type: ScheduleBlockType): string {
  const colorMap: Record<ScheduleBlockType, string> = {
    work: '#3b82f6',      // Blue
    sleep: '#6366f1',     // Indigo
    personal: '#10b981',  // Green
    travel: '#f59e0b',     // Yellow
    meal: '#f97316',      // Orange
    exercise: '#ef4444',  // Red
    family: '#8b5cf6',    // Purple
    study: '#06b6d4',     // Cyan
    other: '#6b7280'      // Gray
  };
  
  return colorMap[type] || '#6b7280';
}

/**
 * Validates a schedule block
 */
export function validateScheduleBlock(block: Partial<ScheduleBlock>): string[] {
  const errors: string[] = [];
  
  if (!block.title?.trim()) {
    errors.push('Title is required');
  }
  
  if (!block.startTime || !isValidTime(block.startTime)) {
    errors.push('Valid start time is required (format: HH:MM)');
  }
  
  if (!block.endTime || !isValidTime(block.endTime)) {
    errors.push('Valid end time is required (format: HH:MM)');
  }
  
  if (!block.daysOfWeek || !Array.isArray(block.daysOfWeek) || block.daysOfWeek.length === 0) {
    errors.push('At least one day of the week must be selected');
  }
  
  if (block.daysOfWeek && Array.isArray(block.daysOfWeek)) {
    const invalidDays = block.daysOfWeek.filter(day => day < 0 || day > 6);
    if (invalidDays.length > 0) {
      errors.push('Invalid days of week (must be 0-6, where 0=Sunday)');
    }
  }
  
  return errors;
}

/**
 * Validates time string format
 */
function isValidTime(timeString: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}
