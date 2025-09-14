import { parseISO, isValid, format } from 'date-fns';
import type { CalendarEvent, GoogleCalendarApiEvent } from './types';

// Re-export the transformation function from the new transformers file
export { transformGoogleApiEventsToFullCalendar } from './event-transformers';

// Legacy interfaces - keeping for backward compatibility
// TODO: Remove these once all code is migrated to use the new types
export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
  status?: string;
  created?: string;
  updated?: string;
}

// Legacy interface - keeping for backward compatibility
export interface FullCalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  url?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

// Legacy function - keeping for backward compatibility
// TODO: Remove this once all code is migrated to use the new transformers
export function transformGoogleEventsToFullCalendar(googleEvents: GoogleCalendarEvent[]): FullCalendarEvent[] {
  return googleEvents.map((event, index) => {
    // Determine if it's an all-day event
    const isAllDay = !event.start?.dateTime && !!event.start?.date;
    
    // Get start and end times with validation
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;
    
    // Validate dates using date-fns
    let validStartTime = new Date().toISOString();
    let validEndTime = endTime;
    
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
    
    if (endTime) {
      try {
        const parsedEnd = parseISO(endTime);
        if (isValid(parsedEnd)) {
          validEndTime = endTime;
        }
      } catch (error) {
        console.warn('Invalid end date:', endTime, error);
        validEndTime = undefined;
      }
    }
    
    // Generate a unique ID if not provided
    const eventId = event.id || `event-${index}-${Date.now()}`;
    
    // Create a color based on event type or use default
    const backgroundColor = getEventColor(event);
    
    return {
      id: eventId,
      title: event.summary || 'Untitled Event',
      start: validStartTime,
      end: validEndTime || undefined,
      allDay: isAllDay,
      description: event.description || undefined,
      location: event.location || undefined,
      url: event.htmlLink || undefined,
      backgroundColor,
      borderColor: darkenColor(backgroundColor),
      textColor: '#ffffff'
    };
  });
}

// Helper function to generate event colors
function getEventColor(event: GoogleCalendarEvent): string {
  // You can customize this based on event properties
  const colors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16'  // Lime
  ];
  
  // Use event ID or summary to consistently assign colors
  const hash = (event.id || event.summary || '').split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

// Helper function to darken a color for borders
function darkenColor(color: string): string {
  // Simple color darkening - you might want to use a proper color library
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darkenedR = Math.max(0, r - 30);
  const darkenedG = Math.max(0, g - 30);
  const darkenedB = Math.max(0, b - 30);
  
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
}