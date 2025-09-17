import { PeriodicEvents } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { calendar_v3 } from 'googleapis';
import type { PeriodicFrequency, PeriodicCategory } from '../features/periodic-events/models/PeriodicEvents.types';
import type { ScheduleBlockType, SchedulePriority } from '../features/schedule/models/ScheduleBlocks.types';

// Re-export auth types from auth feature
export type { 
  User, 
  NewUser, 
  Session, 
  NewSession, 
  Account, 
  NewAccount, 
  Verification, 
  NewVerification,
  UserProfile,
  SessionWithUser 
} from '../features/auth/models/Auth.types';

export type PeriodicEvent = InferSelectModel<typeof PeriodicEvents>;
export type NewPeriodicEvent = InferInsertModel<typeof PeriodicEvents>;

// Base calendar event interface (FullCalendar compatible)
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
    [key: string]: string | boolean | number | undefined; // Allow additional properties
  };
}

// Use official Google Calendar API Event type
export type GoogleCalendarApiEvent = calendar_v3.Schema$Event;

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

// Typesafe form data interfaces for actions
export interface FetchCalendarFormData {
  startDate: string;  // ISO string
  endDate: string;    // ISO string
}

export interface CreatePeriodicEventFormData {
  title: string;
  description?: string;
  frequency: PeriodicFrequency;
  frequencyCount: number;
  duration: number;
  category: PeriodicCategory;
  priority: SchedulePriority;
  color: string;
}

// Helper function to create typesafe FormData
export function createFetchCalendarFormData(startDate: Date, endDate: Date): FormData {
  const formData = new FormData();
  formData.append('startDate', startDate.toISOString());
  formData.append('endDate', endDate.toISOString());
  return formData;
}

export function createPeriodicEventFormData(data: CreatePeriodicEventFormData): FormData {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('frequency', data.frequency);
  formData.append('frequencyCount', data.frequencyCount.toString());
  formData.append('duration', data.duration.toString());
  formData.append('category', data.category);
  formData.append('priority', data.priority);
  formData.append('color', data.color);
  return formData;
}