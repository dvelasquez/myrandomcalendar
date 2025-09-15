import type { TimeSlot } from './availability-calculator';
import type { FullCalendarEvent } from './calendar-utils';
import type { CalendarEvent, SchedulePriority } from './types';

/**
 * Configuration for background event styling
 */
export interface BackgroundEventConfig {
  availableColor: string;
  busyColor: string;
  scheduleBlockColor: string;
  opacity: number;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Default configuration for background events
 */
export const DEFAULT_BACKGROUND_EVENT_CONFIG: BackgroundEventConfig = {
  availableColor: '#10b981', // Green for available
  busyColor: '#ef4444', // Red for busy
  scheduleBlockColor: '#3b82f6', // Blue for schedule blocks
  opacity: 0.3,
  borderColor: '#ffffff',
  borderWidth: 1
};

/**
 * FullCalendar background event interface
 */
export interface BackgroundEvent extends CalendarEvent {
  rendering: 'background';
  display: 'background';
  className?: string;
}

/**
 * Pure function to transform time slots to FullCalendar background events
 * 
 * @param timeSlots - Array of time slots with availability status
 * @param config - Configuration for styling
 * @returns Array of FullCalendar background events
 */
export function transformTimeSlotsToBackgroundEvents(
  timeSlots: TimeSlot[],
  config: BackgroundEventConfig = DEFAULT_BACKGROUND_EVENT_CONFIG
): FullCalendarEvent[] {
  return timeSlots.map(slot => ({
    id: `availability-${slot.start}`,
    title: getBackgroundEventTitle(slot),
    start: slot.start,
    end: slot.end,
    allDay: false,
    rendering: 'background' as const,
    display: 'background' as const,
    backgroundColor: getBackgroundEventColor(slot, config),
    borderColor: config.borderColor,
    className: getBackgroundEventClassName(slot),
    extendedProps: {
      availabilityType: slot.type,
      priority: slot.priority as SchedulePriority | undefined,
      isAvailabilityEvent: true,
      originalTitle: slot.title
    }
  }));
}

/**
 * Pure function to get background event title based on slot type
 */
export function getBackgroundEventTitle(slot: TimeSlot): string {
  switch (slot.type) {
    case 'available':
      return 'Available';
    case 'busy':
      return 'Busy';
    case 'schedule-block':
      return slot.title || 'Schedule Block';
    default:
      return 'Unknown';
  }
}

/**
 * Pure function to get background event color based on slot type and config
 */
export function getBackgroundEventColor(
  slot: TimeSlot,
  config: BackgroundEventConfig
): string {
  switch (slot.type) {
    case 'available':
      return config.availableColor;
    case 'busy':
      return config.busyColor;
    case 'schedule-block':
      return slot.color || config.scheduleBlockColor;
    default:
      return config.busyColor;
  }
}

/**
 * Pure function to get background event CSS class name
 */
export function getBackgroundEventClassName(slot: TimeSlot): string {
  return `availability-${slot.type}`;
}

/**
 * Pure function to filter background events by availability type
 */
export function filterBackgroundEventsByType(
  backgroundEvents: BackgroundEvent[],
  type: 'available' | 'busy' | 'schedule-block'
): BackgroundEvent[] {
  return backgroundEvents.filter(event => 
    event.extendedProps?.availabilityType === type
  );
}

/**
 * Pure function to get available background events
 */
export function getAvailableBackgroundEvents(
  backgroundEvents: BackgroundEvent[]
): BackgroundEvent[] {
  return filterBackgroundEventsByType(backgroundEvents, 'available');
}

/**
 * Pure function to get busy background events
 */
export function getBusyBackgroundEvents(
  backgroundEvents: BackgroundEvent[]
): BackgroundEvent[] {
  return filterBackgroundEventsByType(backgroundEvents, 'busy');
}

/**
 * Pure function to get schedule block background events
 */
export function getScheduleBlockBackgroundEvents(
  backgroundEvents: BackgroundEvent[]
): BackgroundEvent[] {
  return filterBackgroundEventsByType(backgroundEvents, 'schedule-block');
}

/**
 * Pure function to combine calendar events with background events
 * 
 * @param calendarEvents - Regular calendar events
 * @param backgroundEvents - Background availability events
 * @returns Combined array of events
 */
export function combineCalendarAndBackgroundEvents(
  calendarEvents: CalendarEvent[],
  backgroundEvents: BackgroundEvent[]
): CalendarEvent[] {
  return [...calendarEvents, ...backgroundEvents];
}

/**
 * Pure function to create a custom background event configuration
 */
export function createBackgroundEventConfig(
  overrides: Partial<BackgroundEventConfig>
): BackgroundEventConfig {
  return {
    ...DEFAULT_BACKGROUND_EVENT_CONFIG,
    ...overrides
  };
}

/**
 * Pure function to validate background event configuration
 */
export function validateBackgroundEventConfig(
  config: BackgroundEventConfig
): string[] {
  const errors: string[] = [];
  
  if (!config.availableColor || !isValidColor(config.availableColor)) {
    errors.push('Invalid available color');
  }
  
  if (!config.busyColor || !isValidColor(config.busyColor)) {
    errors.push('Invalid busy color');
  }
  
  if (!config.scheduleBlockColor || !isValidColor(config.scheduleBlockColor)) {
    errors.push('Invalid schedule block color');
  }
  
  if (config.opacity < 0 || config.opacity > 1) {
    errors.push('Opacity must be between 0 and 1');
  }
  
  if (config.borderWidth !== undefined && config.borderWidth < 0) {
    errors.push('Border width must be non-negative');
  }
  
  return errors;
}

/**
 * Pure function to validate color format
 */
export function isValidColor(color: string): boolean {
  // Check for hex color format
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Pure function to get background event statistics
 */
export function getBackgroundEventStats(
  backgroundEvents: BackgroundEvent[]
): {
  totalEvents: number;
  availableEvents: number;
  busyEvents: number;
  scheduleBlockEvents: number;
} {
  return {
    totalEvents: backgroundEvents.length,
    availableEvents: getAvailableBackgroundEvents(backgroundEvents).length,
    busyEvents: getBusyBackgroundEvents(backgroundEvents).length,
    scheduleBlockEvents: getScheduleBlockBackgroundEvents(backgroundEvents).length
  };
}
