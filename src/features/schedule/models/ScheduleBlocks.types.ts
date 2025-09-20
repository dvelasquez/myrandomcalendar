import { ScheduleBlock } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

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

// Core database types (inferred from Astro DB)
export type ScheduleBlock = InferSelectModel<typeof ScheduleBlock>;
export type NewScheduleBlock = Omit<InferInsertModel<typeof ScheduleBlock>, 'id' | 'createdAt' | 'updatedAt'>;
export type ScheduleBlockUpdate = Partial<NewScheduleBlock>;

// Application interface (extends database type with computed fields)
export interface ScheduleBlockData extends ScheduleBlock {
  // Add any computed fields or transformations here
  daysOfWeekArray: number[]; // Parsed from JSON string
}

// Helper function to parse daysOfWeek from database
export function parseDaysOfWeek(daysOfWeekString: string): number[] {
  try {
    return JSON.parse(daysOfWeekString);
  } catch {
    return [];
  }
}

// Helper function to serialize daysOfWeek for database
export function serializeDaysOfWeek(daysOfWeekArray: number[]): string {
  return JSON.stringify(daysOfWeekArray);
}

// Form/API types
export interface CreateScheduleBlockFormData {
  title: string;
  type: ScheduleBlockType;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isRecurring: boolean;
  priority: SchedulePriority;
  isActive: boolean;
  timezone: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  color: string;
  bufferBefore: number;
  bufferAfter: number;
}

export interface UpdateScheduleBlockFormData extends Partial<CreateScheduleBlockFormData> {
  id: string;
}