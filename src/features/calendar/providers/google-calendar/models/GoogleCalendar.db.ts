import { defineTable, column } from 'astro:db';

// Google Calendar cache table for storing fetched events
// This can be used for caching calendar events to reduce API calls
export const GoogleCalendarCache = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(), // Reference to user who owns the calendar
    calendarId: column.text(), // Google Calendar ID (usually 'primary')
    eventId: column.text(), // Google Calendar event ID
    eventData: column.text(), // JSON string of the event data
    startDate: column.date(), // Event start date for efficient querying
    endDate: column.date(), // Event end date for efficient querying
    lastFetched: column.date(), // When this event was last fetched from Google
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Google Calendar settings table for user preferences
export const GoogleCalendarSettings = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ unique: true }), // One settings record per user
    defaultCalendarId: column.text({ optional: true }),
    syncEnabled: column.boolean({ optional: true }),
    syncInterval: column.number({ optional: true }), // Minutes between syncs
    maxResults: column.number({ optional: true }),
    includeDeleted: column.boolean({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Google Calendar API usage tracking
export const GoogleCalendarApiUsage = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    apiCall: column.text(), // Type of API call (list, get, etc.)
    calendarId: column.text(),
    requestDate: column.date(),
    responseTime: column.number(), // Response time in milliseconds
    success: column.boolean(),
    errorMessage: column.text({ optional: true }),
    quotaUsed: column.number({ optional: true }), // API quota units used
    createdAt: column.date(),
  },
});
