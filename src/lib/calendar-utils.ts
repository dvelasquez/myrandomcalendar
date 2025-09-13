// Utility function to transform Google Calendar events to FullCalendar format
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

// Type for Google Calendar API response (Schema$Event)
export interface GoogleCalendarApiEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  location?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  end?: {
    dateTime?: string | null;
    date?: string | null;
  } | null;
  htmlLink?: string | null;
  status?: string | null;
  created?: string | null;
  updated?: string | null;
}

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

// Function to transform Google Calendar API events to FullCalendar format
export function transformGoogleApiEventsToFullCalendar(googleEvents: GoogleCalendarApiEvent[]): FullCalendarEvent[] {
  return googleEvents.map((event, index) => {
    // Determine if it's an all-day event
    const isAllDay = !event.start?.dateTime && !!event.start?.date;
    
    // Get start and end times
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;
    
    // Generate a unique ID if not provided
    const eventId = event.id || `event-${index}-${Date.now()}`;
    
    // Create a color based on event type or use default
    const backgroundColor = getEventColor(event);
    
    return {
      id: eventId,
      title: event.summary || 'Untitled Event',
      start: startTime || new Date().toISOString(),
      end: endTime,
      allDay: isAllDay,
      description: event.description,
      location: event.location,
      url: event.htmlLink,
      backgroundColor,
      borderColor: darkenColor(backgroundColor),
      textColor: '#ffffff'
    };
  });
}

export function transformGoogleEventsToFullCalendar(googleEvents: GoogleCalendarEvent[]): FullCalendarEvent[] {
  return googleEvents.map((event, index) => {
    // Determine if it's an all-day event
    const isAllDay = !event.start?.dateTime && !!event.start?.date;
    
    // Get start and end times
    const startTime = event.start?.dateTime || event.start?.date;
    const endTime = event.end?.dateTime || event.end?.date;
    
    // Generate a unique ID if not provided
    const eventId = event.id || `event-${index}-${Date.now()}`;
    
    // Create a color based on event type or use default
    const backgroundColor = getEventColor(event);
    
    return {
      id: eventId,
      title: event.summary || 'Untitled Event',
      start: startTime || new Date().toISOString(),
      end: endTime,
      allDay: isAllDay,
      description: event.description,
      location: event.location,
      url: event.htmlLink,
      backgroundColor,
      borderColor: darkenColor(backgroundColor),
      textColor: '#ffffff'
    };
  });
}

// Helper function to generate event colors
function getEventColor(event: GoogleCalendarEvent | GoogleCalendarApiEvent): string {
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
