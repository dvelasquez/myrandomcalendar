import type { SchedulePriority } from "../../schedule/models/ScheduleBlocks.types";

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