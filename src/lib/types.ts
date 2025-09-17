import { Users, Sessions, Accounts, Verifications, PeriodicEvents } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { calendar_v3 } from 'googleapis';
import type { ScheduleBlockType, SchedulePriority } from '../features/schedule/models/ScheduleBlocks.types';

// Infer TypeScript types from your database tables
export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export type Session = InferSelectModel<typeof Sessions>;
export type NewSession = InferInsertModel<typeof Sessions>;

export type Account = InferSelectModel<typeof Accounts>;
export type NewAccount = InferInsertModel<typeof Accounts>;

export type Verification = InferSelectModel<typeof Verifications>;
export type NewVerification = InferInsertModel<typeof Verifications>;

export type PeriodicEvent = InferSelectModel<typeof PeriodicEvents>;
export type NewPeriodicEvent = InferInsertModel<typeof PeriodicEvents>;

// You can also create more specific types for different use cases
export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image'>;

// Session with user data (for joins)
export type SessionWithUser = Session & {
  user: User;
};

// Periodic Event types
export type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';
export type PeriodicCategory = 'exercise' | 'personal' | 'family' | 'work' | 'health' | 'hobby' | 'other';

// Periodic Event interface
export interface PeriodicEventData {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: PeriodicFrequency;
  frequencyCount: number; // How many times per period (e.g., 3 times a week)
  duration: number; // Duration in minutes
  category: PeriodicCategory;
  priority: SchedulePriority;
  isActive: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    [key: string]: unknown; // Allow additional properties
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
