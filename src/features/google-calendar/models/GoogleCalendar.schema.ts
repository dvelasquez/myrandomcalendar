import { z } from 'astro:schema';
import { parseISO, isValid, isAfter } from 'date-fns';

// Schema for fetching calendar events
export const fetchCalendarSchema = z.object({
  startDate: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid startDate format',
  }),
  endDate: z.string().refine((date) => {
    const parsed = parseISO(date);
    return isValid(parsed);
  }, {
    message: 'Invalid endDate format',
  }),
}).refine((data) => {
  const start = parseISO(data.startDate);
  const end = parseISO(data.endDate);
  return isAfter(end, start);
}, {
  message: 'startDate must be before endDate',
  path: ['endDate'],
});

// Schema for Google Calendar credentials validation
export const googleCalendarCredentialsSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  scope: z.string().optional(),
});

// Schema for Google Calendar configuration
export const googleCalendarConfigSchema = z.object({
  calendarId: z.string().min(1, 'Calendar ID is required'),
  maxResults: z.number().min(1).max(2500).default(250),
  singleEvents: z.boolean().default(true),
  orderBy: z.enum(['startTime', 'updated']).default('startTime'),
});

// Schema for date range validation
export const dateRangeSchema = z.object({
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
  }),
}).refine((data) => {
  const start = parseISO(data.start);
  const end = parseISO(data.end);
  return isAfter(end, start);
}, {
  message: 'Start date must be before end date',
  path: ['end'],
});

// Type inference from schemas
export type FetchCalendarInput = z.infer<typeof fetchCalendarSchema>;
export type GoogleCalendarCredentialsInput = z.infer<typeof googleCalendarCredentialsSchema>;
export type GoogleCalendarConfigInput = z.infer<typeof googleCalendarConfigSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
