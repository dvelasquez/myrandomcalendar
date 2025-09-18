import { defineTable, column } from 'astro:db';

// Calendar events cache table for storing fetched events from all providers
export const CalendarEventsCache = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(), // Reference to user who owns the calendar
    provider: column.text(), // 'google', 'outlook', 'schedule', etc.
    providerEventId: column.text(), // Original event ID from provider
    eventData: column.text(), // JSON string of the event data
    startDate: column.date(), // Event start date for efficient querying
    endDate: column.date(), // Event end date for efficient querying
    lastFetched: column.date(), // When this event was last fetched
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Calendar settings table for user preferences
export const CalendarSettings = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ unique: true }), // One settings record per user
    showAvailability: column.boolean({ optional: true }),
    showScheduleBlocks: column.boolean({ optional: true }),
    showExternalEvents: column.boolean({ optional: true }),
    defaultTimezone: column.text({ optional: true }),
    workingHoursStart: column.text({ optional: true }), // "09:00"
    workingHoursEnd: column.text({ optional: true }), // "17:00"
    includeOvernightEvents: column.boolean({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Calendar provider settings table
export const CalendarProviderSettings = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    provider: column.text(), // 'google', 'outlook', etc.
    isEnabled: column.boolean({ optional: true }),
    syncEnabled: column.boolean({ optional: true }),
    syncInterval: column.number({ optional: true }), // Minutes between syncs
    lastSync: column.date({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Availability calculation cache
export const AvailabilityCache = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    date: column.date(),
    timeSlots: column.text(), // JSON string of TimeSlot[]
    lastCalculated: column.date(),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
