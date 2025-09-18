import { z } from 'astro:schema';
import { parseISO, isValid, isAfter } from 'date-fns';

// Schema for calendar event validation
export const calendarEventSchema = z.object({
  id: z.string().min(1, 'Event ID is required'),
  title: z.string().min(1, 'Event title is required'),
  start: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid start date format',
  }),
  end: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid end date format',
  }).optional(),
  allDay: z.boolean().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url().optional(),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  textColor: z.string().optional(),
  extendedProps: z.record(z.union([z.string(), z.boolean(), z.number()])).optional(),
});

// Schema for availability calculation
export const availabilityCalculationSchema = z.object({
  startDate: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid end date format',
  }),
  includeOvernightEvents: z.boolean().default(true),
  timezone: z.string().default('UTC'),
}).refine((data) => {
  const start = parseISO(data.startDate);
  const end = parseISO(data.endDate);
  return isAfter(end, start);
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
});

// Schema for time slot validation
export const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  type: z.enum(['available', 'busy', 'schedule-block']),
  title: z.string().optional(),
  priority: z.string().optional(),
  color: z.string().optional(),
});

// Schema for background event configuration
export const backgroundEventConfigSchema = z.object({
  availableColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  busyColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  scheduleBlockColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  opacity: z.number().min(0).max(1),
  borderColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  borderWidth: z.number().min(0).optional(),
});

// Type inference from schemas
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type AvailabilityCalculationInput = z.infer<typeof availabilityCalculationSchema>;
export type TimeSlotInput = z.infer<typeof timeSlotSchema>;
export type BackgroundEventConfigInput = z.infer<typeof backgroundEventConfigSchema>;
