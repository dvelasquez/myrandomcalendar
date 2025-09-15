import { Users, Sessions, Accounts, Verifications } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { calendar_v3 } from 'googleapis';

// Infer TypeScript types from your database tables
export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export type Session = InferSelectModel<typeof Sessions>;
export type NewSession = InferInsertModel<typeof Sessions>;

export type Account = InferSelectModel<typeof Accounts>;
export type NewAccount = InferInsertModel<typeof Accounts>;

export type Verification = InferSelectModel<typeof Verifications>;
export type NewVerification = InferInsertModel<typeof Verifications>;

// You can also create more specific types for different use cases
export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image'>;

// Session with user data (for joins)
export type SessionWithUser = Session & {
  user: User;
};

// Schedule Block types
export type ScheduleBlockType = 
  | 'work'           // Work hours
  | 'sleep'          // Sleep schedule
  | 'personal'       // Personal time, hobbies
  | 'travel'         // Commute time
  | 'meal'           // Meal times
  | 'exercise'       // Gym, workout
  | 'family'         // Family time
  | 'study'          // Study/learning time
  | 'other';         // Custom categories

export type SchedulePriority = 'high' | 'medium' | 'low';

// Schedule Block interface
export interface ScheduleBlock {
  id: string;
  userId: string;
  title: string;
  type: ScheduleBlockType;
  startTime: string;                 // "09:00" (24-hour format)
  endTime: string;                   // "17:00"
  daysOfWeek: number[];              // [1,2,3,4,5] (Mon-Fri)
  isRecurring: boolean;
  priority: SchedulePriority;
  isActive: boolean;
  timezone: string;
  startDate?: Date;                  // Optional: for one-time blocks
  endDate?: Date;                    // Optional: for temporary blocks
  description?: string;
  color: string;
  bufferBefore: number;              // minutes
  bufferAfter: number;               // minutes
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
