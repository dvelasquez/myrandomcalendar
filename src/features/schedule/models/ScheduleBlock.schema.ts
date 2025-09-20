import { ScheduleBlock } from "astro:db";
import { z } from "astro:schema";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

// Auto-generated Zod schemas from Drizzle table
const baseInsertSchema = createInsertSchema(ScheduleBlock);
const baseUpdateSchema = createUpdateSchema(ScheduleBlock);

// ✅ Override to exclude auto-managed fields
export const ScheduleBlockInsertSchema = baseInsertSchema.omit({
  id: true,           // Auto-generated UUID
  createdAt: true,    // Auto-generated timestamp
  updatedAt: true,    // Auto-generated timestamp
});

export const ScheduleBlockSelectSchema = createSelectSchema(ScheduleBlock);

export const ScheduleBlockUpdateSchema = baseUpdateSchema.omit({
  id: true,           // Never update ID
  createdAt: true,    // Never update createdAt
  updatedAt: true,    // Will be updated by database trigger
});

// ✅ Form schema that mirrors the select schema structure with form-specific transformations
export const ScheduleBlockFormSchema = z.object({
  // ✅ These fields match the ScheduleBlockSelectSchema structure exactly
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['work', 'sleep', 'personal', 'travel', 'meal', 'exercise', 'family', 'study', 'other'], {
    errorMap: () => ({ message: 'Valid type is required' }),
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  // ✅ Validate JSON string format but keep as string for database
  daysOfWeek: z.string().refine((val) => {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) && parsed.every(d => typeof d === 'number' && d >= 0 && d <= 6);
    } catch {
      return false;
    }
  }, 'Days of week must be a valid JSON array of numbers 0-6'),
  // ✅ Transform string inputs to booleans for form data
  isRecurring: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
  }),
  isActive: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  timezone: z.string().default('UTC'),
  // ✅ Transform string inputs to dates for form data
  startDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  description: z.string().nullable().optional().transform((val) => val || undefined),
  color: z.string().nullable().optional().transform((val) => val || '#3b82f6'),
  // ✅ Transform string inputs to numbers for form data
  bufferBefore: z.string().transform((val) => parseInt(val) || 0).default('0'),
  bufferAfter: z.string().transform((val) => parseInt(val) || 0).default('0'),
});

// Legacy export for backward compatibility
export const scheduleBlockBaseSchema = ScheduleBlockFormSchema;