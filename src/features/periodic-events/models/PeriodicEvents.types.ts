import { PeriodicEvents } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { SchedulePriority } from "../../schedule/models/ScheduleBlocks.types";

// Periodic Event types
export type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';
export type PeriodicCategory = 'exercise' | 'personal' | 'family' | 'work' | 'health' | 'hobby' | 'other';

// Database model types (inferred from Astro DB)
export type PeriodicEvent = InferSelectModel<typeof PeriodicEvents>;
export type NewPeriodicEvent = InferInsertModel<typeof PeriodicEvents>;

// Periodic Event interface (for application logic)
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

// Typesafe form data interfaces for periodic events actions
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

// Helper function to create typesafe FormData for periodic events
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