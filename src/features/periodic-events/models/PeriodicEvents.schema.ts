import { PeriodicEvent } from "astro:db";
import { z } from "astro:schema";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

// Auto-generated Zod schemas from Drizzle table
const baseInsertSchema = createInsertSchema(PeriodicEvent);
const baseUpdateSchema = createUpdateSchema(PeriodicEvent);

// ✅ Override to exclude auto-managed fields
export const PeriodicEventInsertSchema = baseInsertSchema.omit({
  id: true,           // Auto-generated UUID
  createdAt: true,    // Auto-generated timestamp
  updatedAt: true,    // Auto-generated timestamp
});

export const PeriodicEventSelectSchema = createSelectSchema(PeriodicEvent);

export const PeriodicEventUpdateSchema = baseUpdateSchema.omit({
  id: true,           // Never update ID
  createdAt: true,    // Never update createdAt
  updatedAt: true,    // Will be updated by database trigger
});


// ✅ Form schema that mirrors the select schema structure with form-specific transformations
// This ensures consistency with the database schema while handling form-specific needs
export const PeriodicEventFormSchema = z.object({
  // ✅ These fields match the PeriodicEventSelectSchema structure exactly
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Valid frequency is required (daily, weekly, or monthly)' }),
  }),
  // ✅ Transform string inputs to numbers (form-specific transformation)
  frequencyCount: z.string()
    .transform((val) => parseInt(val) || 1)
    .refine((val) => val >= 1, 'Frequency count must be at least 1'),
  duration: z.string()
    .transform((val) => parseInt(val) || 1)
    .refine((val) => val >= 1, 'Duration must be at least 1 minute'),
  category: z.enum(['exercise', 'personal', 'family', 'work', 'health', 'hobby', 'other'], {
    errorMap: () => ({ message: 'Valid category is required' }),
  }),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Valid priority is required' }),
  }),
  color: z.string().optional(),
});

// Legacy export for backward compatibility
export const periodicEventSchema = PeriodicEventFormSchema;