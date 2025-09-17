import { z } from "astro:schema";

export const periodicEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Valid frequency is required (daily, weekly, or monthly)' }),
  }),
  frequencyCount: z.string().transform((val) => parseInt(val) || 1).refine((val) => val >= 1, 'Frequency count must be at least 1'),
  duration: z.string().transform((val) => parseInt(val) || 1).refine((val) => val >= 1, 'Duration must be at least 1 minute'),
  category: z.enum(['exercise', 'personal', 'family', 'work', 'health', 'hobby', 'other'], {
    errorMap: () => ({ message: 'Valid category is required' }),
  }),
  priority: z.enum(['high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Valid priority is required' }),
  }),
  color: z.string().optional(),
})