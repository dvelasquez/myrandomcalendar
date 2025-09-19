import type { ScheduleBlockType, SchedulePriority } from '../../schedule/models/ScheduleBlocks.types';

// Core calendar event interface (provider-agnostic)
export interface CalendarEvent {
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
  extendedProps?: {
    scheduleBlockId?: string;
    scheduleBlockType?: ScheduleBlockType;
    priority?: SchedulePriority;
    isScheduleBlock?: boolean;
    description?: string;
    location?: string;
    provider?: string; // 'google', 'outlook', 'schedule', etc.
    providerEventId?: string; // Original event ID from provider
    [key: string]: string | boolean | number | undefined;
  };
}

// Google Calendar API event type (re-export from googleapis)
export type GoogleCalendarApiEvent = import('googleapis').calendar_v3.Schema$Event;

// Utility type to extract only the fields we need from Google Calendar
export type GoogleCalendarEventFields = Pick<
  GoogleCalendarApiEvent,
  'id' | 'summary' | 'description' | 'location' | 'start' | 'end' | 'htmlLink' | 'status' | 'created' | 'updated'
>;

// Type mapping utilities
export type GoogleToFullCalendarMapper = {
  [K in keyof CalendarEvent]: K extends 'title' 
    ? 'summary' 
    : K extends 'url' 
    ? 'htmlLink' 
    : K extends 'start' | 'end'
    ? 'start' | 'end'
    : K;
};

// Reverse mapping (FullCalendar to Google)
export type FullCalendarToGoogleMapper = {
  [K in keyof GoogleCalendarApiEvent]: K extends 'summary' 
    ? 'title' 
    : K extends 'htmlLink' 
    ? 'url' 
    : K;
};

// Typesafe form data interfaces for calendar actions
export interface FetchCalendarFormData {
  startDate: string;  // ISO string
  endDate: string;    // ISO string
}

// Helper function to create typesafe FormData for calendar
export function createFetchCalendarFormData(startDate: Date, endDate: Date): FormData {
  const formData = new FormData();
  formData.append('startDate', startDate.toISOString());
  formData.append('endDate', endDate.toISOString());
  return formData;
}

// Time slot interface for availability calculation
export interface TimeSlot {
  start: string;
  end: string;
  type: 'available' | 'busy' | 'schedule-block';
  title?: string;
  priority?: string;
  color?: string;
}

// Availability configuration
export interface AvailabilityConfig {
  includeOvernightEvents: boolean;
  defaultWorkingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  timezone: string;
}

// Background event configuration
export interface BackgroundEventConfig {
  availableColor: string;
  busyColor: string;
  scheduleBlockColor: string;
  opacity: number;
  borderColor?: string;
  borderWidth?: number;
}

// Calendar provider interface
export interface CalendarProvider {
  name: string;
  fetchEvents: (startDate: Date, endDate: Date) => Promise<CalendarEvent[]>;
  isAuthenticated: () => Promise<boolean>;
}

// Event aggregation result
export interface EventAggregationResult {
  events: CalendarEvent[];
  providers: string[];
  totalEvents: number;
  dateRange: {
    start: string;
    end: string;
  };
}

// Calendar display configuration
export interface CalendarDisplayConfig {
  showAvailability: boolean;
  showScheduleBlocks: boolean;
  showExternalEvents: boolean;
  availabilityConfig: AvailabilityConfig;
  backgroundEventConfig: BackgroundEventConfig;
}
