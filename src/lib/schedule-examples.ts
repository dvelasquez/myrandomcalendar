import { scheduleBlocksToCalendarEvents, combineCalendarEvents } from './schedule-transformers';
import type { ScheduleBlock, CalendarEvent } from './types';

/**
 * Example usage of the ScheduleBlock architecture
 */

// Example 1: User's schedule preferences (stored in database)
const userScheduleBlocks: ScheduleBlock[] = [
  {
    id: 'work-1',
    userId: 'user-123',
    title: 'Work Hours',
    type: 'work',
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    isRecurring: true,
    priority: 'high',
    isActive: true,
    timezone: 'UTC',
    description: 'Regular work hours',
    color: '#3b82f6',
    bufferBefore: 15, // 15 min commute
    bufferAfter: 15,  // 15 min wrap-up
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sleep-1',
    userId: 'user-123',
    title: 'Sleep Time',
    type: 'sleep',
    startTime: '23:00',
    endTime: '07:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
    isRecurring: true,
    priority: 'high',
    isActive: true,
    timezone: 'UTC',
    description: 'Sleep schedule',
    color: '#6366f1',
    bufferBefore: 30, // Wind-down time
    bufferAfter: 30,  // Wake-up routine
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'gym-1',
    userId: 'user-123',
    title: 'Gym Session',
    type: 'exercise',
    startTime: '18:00',
    endTime: '19:30',
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    isRecurring: true,
    priority: 'medium',
    isActive: true,
    timezone: 'UTC',
    description: 'Workout session',
    color: '#ef4444',
    bufferBefore: 10, // Travel to gym
    bufferAfter: 20,   // Shower/change
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Example 2: Google Calendar events (from API)
const googleCalendarEvents: CalendarEvent[] = [
  {
    id: 'google-event-1',
    title: 'Team Meeting',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    allDay: false,
    description: 'Weekly team sync',
    backgroundColor: '#10b981',
    borderColor: '#059669',
    textColor: '#ffffff'
  },
  {
    id: 'google-event-2',
    title: 'Doctor Appointment',
    start: '2024-01-16T14:00:00Z',
    end: '2024-01-16T15:00:00Z',
    allDay: false,
    description: 'Annual checkup',
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    textColor: '#ffffff'
  }
];

// Example 3: Generate schedule block events for a date range
const startDate = new Date('2024-01-15');
const endDate = new Date('2024-01-21');

const generatedScheduleEvents = scheduleBlocksToCalendarEvents(
  userScheduleBlocks,
  startDate,
  endDate
);

// Example 4: Combine all events for FullCalendar display
const allCalendarEvents = combineCalendarEvents(
  googleCalendarEvents,
  generatedScheduleEvents
);

console.log('Generated Schedule Events:', generatedScheduleEvents.length);
console.log('Total Calendar Events:', allCalendarEvents.length);

// Example 5: Filter events by type
const workEvents = allCalendarEvents.filter(event => 
  event.extendedProps?.scheduleBlockType === 'work'
);

const sleepEvents = allCalendarEvents.filter(event => 
  event.extendedProps?.scheduleBlockType === 'sleep'
);

console.log('Work Events:', workEvents.length);
console.log('Sleep Events:', sleepEvents.length);

export {
  userScheduleBlocks,
  googleCalendarEvents,
  generatedScheduleEvents,
  allCalendarEvents
};
