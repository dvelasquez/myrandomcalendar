import { z } from "astro:schema";

// Common Zod schemas for schedule blocks
export const scheduleBlockBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['work', 'sleep', 'personal', 'travel', 'meal', 'exercise', 'family', 'study', 'other'], {
    errorMap: () => ({ message: 'Valid type is required' }),
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  daysOfWeek: z.string().transform((val) => {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.every(d => typeof d === 'number' && d >= 0 && d <= 6)) {
        return parsed;
      }
      throw new Error('Invalid days of week format');
    } catch {
      throw new Error('Days of week must be a valid JSON array of numbers 0-6');
    }
  }),
  isRecurring: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Priority must be high, medium, or low' }),
  }),
  isActive: z.string().optional().transform((val) => val === 'true' || val === 'on' || val === undefined).default('true'),
  timezone: z.string().default('UTC'),
  startDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  description: z.string().nullable().optional().transform((val) => val || undefined),
  color: z.string().nullable().optional().transform((val) => val || '#3b82f6'),
  bufferBefore: z.string().transform((val) => parseInt(val) || 0).default('0'),
  bufferAfter: z.string().transform((val) => parseInt(val) || 0).default('0'),
});