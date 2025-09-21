import { PeriodicEvent } from 'astro:db';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Periodic Event types
export type PeriodicFrequency = 'daily' | 'weekly' | 'monthly';
export type PeriodicCategory =
  | 'exercise'
  | 'personal'
  | 'family'
  | 'work'
  | 'health'
  | 'hobby'
  | 'other';

// Core database types (inferred from Astro DB)
export type PeriodicEvent = InferSelectModel<typeof PeriodicEvent>;
export type NewPeriodicEvent = Omit<
  InferInsertModel<typeof PeriodicEvent>,
  'id' | 'createdAt' | 'updatedAt'
>;
export type PeriodicEventUpdate = Partial<NewPeriodicEvent>;
