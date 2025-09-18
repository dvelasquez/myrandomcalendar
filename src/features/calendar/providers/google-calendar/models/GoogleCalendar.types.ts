import type { calendar_v3 } from 'googleapis';
import type { CalendarEvent } from '../../../models/Calendar.types';

// Re-export CalendarEvent from main calendar models
export type { CalendarEvent };

// Re-export Google Calendar API types
export type GoogleCalendarApiEvent = calendar_v3.Schema$Event;

// Utility type to extract only the fields we need from Google Calendar
export type GoogleCalendarEventFields = Pick<
  GoogleCalendarApiEvent,
  'id' | 'summary' | 'description' | 'location' | 'start' | 'end' | 'htmlLink' | 'status' | 'created' | 'updated'
>;

// Google Calendar API response types
export interface GoogleCalendarListResponse {
  success: boolean;
  events: GoogleCalendarApiEvent[];
  calendarId: string | null | undefined;
  timeZone: string | null | undefined;
  dateRange: {
    start: string;
    end: string;
  };
}

// Google Calendar authentication types
export interface GoogleCalendarCredentials {
  accessToken: string;
  refreshToken?: string;
  scope?: string;
}

// Google Calendar configuration types
export interface GoogleCalendarConfig {
  calendarId: string;
  maxResults: number;
  singleEvents: boolean;
  orderBy: 'startTime' | 'updated';
}

// Default Google Calendar configuration
export const DEFAULT_GOOGLE_CALENDAR_CONFIG: GoogleCalendarConfig = {
  calendarId: 'primary',
  maxResults: 250,
  singleEvents: true,
  orderBy: 'startTime',
};

// Google Calendar error types
export interface GoogleCalendarError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR';
  message: string;
  details?: string;
}

// Google Calendar API client types
export interface GoogleCalendarApiClient {
  listEvents: (params: {
    calendarId: string;
    timeMin: string;
    timeMax: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  }) => Promise<{ data: { items?: GoogleCalendarApiEvent[]; kind?: string; timeZone?: string } }>;
}
