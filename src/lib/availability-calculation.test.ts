import { describe, it, expect } from 'vitest';
import { scheduleBlocksToCalendarEvents, combineCalendarEvents } from '../lib/schedule-transformers';
import type { ScheduleBlock, CalendarEvent } from '../lib/types';

describe('availability-calculation', () => {
  describe('overnight event conflict detection', () => {
    it('should properly detect conflicts for overnight sleep schedule', () => {
      const sleepBlock: ScheduleBlock = {
        id: 'sleep-1',
        userId: 'user-123',
        title: 'Sleep Time',
        type: 'sleep',
        startTime: '23:00',
        endTime: '07:00',
        daysOfWeek: [1], // Monday
        isRecurring: true,
        priority: 'high',
        isActive: true,
        timezone: 'UTC',
        color: '#6366f1',
        bufferBefore: 30,
        bufferAfter: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([sleepBlock], startDate, endDate);
      expect(events).toHaveLength(1);

      const sleepEvent = events[0];
      
      // Check that the event starts and ends at the correct times (accounting for timezone)
      const startTime = new Date(sleepEvent.start);
      const endTime = new Date(sleepEvent.end || sleepEvent.start);
      expect(startTime.getHours()).toBe(22); // 23:00 - 30min buffer = 22:30
      expect(startTime.getMinutes()).toBe(30);
      expect(endTime.getHours()).toBe(7); // 07:00 + 30min buffer = 07:30
      expect(endTime.getMinutes()).toBe(30);
      
      // Check that it spans to the next day
      expect(endTime.getDate()).toBe(startTime.getDate() + 1);

      // Test basic conflict detection logic
      const eventStart = new Date(sleepEvent.start);
      const eventEnd = new Date(sleepEvent.end || sleepEvent.start);
      
      // Test that the event conflicts with a slot that should conflict
      const conflictingSlotStart = new Date(eventStart);
      conflictingSlotStart.setHours(23, 0, 0, 0); // 23:00
      const conflictingSlotEnd = new Date(eventStart);
      conflictingSlotEnd.setHours(24, 0, 0, 0); // 24:00 (midnight)
      
      const conflicts = eventStart < conflictingSlotEnd && eventEnd > conflictingSlotStart;
      expect(conflicts).toBe(true);
      
      // Test that the event conflicts with early morning slot
      const earlyMorningSlotStart = new Date(eventStart);
      earlyMorningSlotStart.setDate(earlyMorningSlotStart.getDate() + 1);
      earlyMorningSlotStart.setHours(0, 0, 0, 0); // 00:00 next day
      const earlyMorningSlotEnd = new Date(eventStart);
      earlyMorningSlotEnd.setDate(earlyMorningSlotEnd.getDate() + 1);
      earlyMorningSlotEnd.setHours(1, 0, 0, 0); // 01:00 next day
      
      const earlyMorningConflicts = eventStart < earlyMorningSlotEnd && eventEnd > earlyMorningSlotStart;
      expect(earlyMorningConflicts).toBe(true);
      
      // Test that the event does NOT conflict with afternoon slot
      const afternoonSlotStart = new Date(eventStart);
      afternoonSlotStart.setHours(14, 0, 0, 0); // 14:00
      const afternoonSlotEnd = new Date(eventStart);
      afternoonSlotEnd.setHours(15, 0, 0, 0); // 15:00
      
      const afternoonConflicts = eventStart < afternoonSlotEnd && eventEnd > afternoonSlotStart;
      expect(afternoonConflicts).toBe(false);
    });

    it('should handle multiple overnight events correctly', () => {
      const sleepBlock: ScheduleBlock = {
        id: 'sleep-1',
        userId: 'user-123',
        title: 'Sleep Time',
        type: 'sleep',
        startTime: '23:00',
        endTime: '07:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
        isRecurring: true,
        priority: 'high',
        isActive: true,
        timezone: 'UTC',
        color: '#6366f1',
        bufferBefore: 0,
        bufferAfter: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const workBlock: ScheduleBlock = {
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
        color: '#3b82f6',
        bufferBefore: 0,
        bufferAfter: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-17'); // Wednesday

      const events = scheduleBlocksToCalendarEvents([sleepBlock, workBlock], startDate, endDate);
      
      // Should generate 6 events: 3 sleep events + 3 work events
      expect(events).toHaveLength(6);
      
      // Check that sleep events span overnight
      const sleepEvents = events.filter(e => e.extendedProps?.scheduleBlockType === 'sleep');
      expect(sleepEvents).toHaveLength(3);
      
      sleepEvents.forEach(sleepEvent => {
        const startTime = new Date(sleepEvent.start);
        const endTime = new Date(sleepEvent.end || sleepEvent.start);
        
        // Sleep should start on one day and end on the next
        expect(startTime.getDate()).not.toBe(endTime.getDate());
        expect(startTime.getHours()).toBe(23);
        expect(endTime.getHours()).toBe(7);
      });
      
      // Check that work events are same-day
      const workEvents = events.filter(e => e.extendedProps?.scheduleBlockType === 'work');
      expect(workEvents).toHaveLength(3);
      
      workEvents.forEach(workEvent => {
        const startTime = new Date(workEvent.start);
        const endTime = new Date(workEvent.end || workEvent.start);
        
        // Work should be same day
        expect(startTime.getDate()).toBe(endTime.getDate());
        expect(startTime.getHours()).toBe(9);
        expect(endTime.getHours()).toBe(17);
      });
    });
  });

  describe('event combination and sorting', () => {
    it('should properly combine and sort mixed event types', () => {
      const googleEvents: CalendarEvent[] = [
        {
          id: 'google-1',
          title: 'Google Event',
          start: '2024-01-15T14:00:00.000Z',
          end: '2024-01-15T15:00:00.000Z',
          allDay: false,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          textColor: '#ffffff'
        }
      ];

      const scheduleEvents: CalendarEvent[] = [
        {
          id: 'schedule-1',
          title: 'Schedule Event',
          start: '2024-01-15T10:00:00.000Z',
          end: '2024-01-15T11:00:00.000Z',
          allDay: false,
          backgroundColor: '#3b82f6',
          borderColor: '#1d4ed8',
          textColor: '#ffffff',
          extendedProps: { isScheduleBlock: true }
        }
      ];

      const combined = combineCalendarEvents(googleEvents, scheduleEvents);

      expect(combined).toHaveLength(2);
      expect(combined[0].title).toBe('Schedule Event'); // Earlier start time
      expect(combined[1].title).toBe('Google Event'); // Later start time
    });

    it('should handle overlapping events correctly', () => {
      const event1: CalendarEvent = {
        id: 'event-1',
        title: 'Event 1',
        start: '2024-01-15T10:00:00.000Z',
        end: '2024-01-15T12:00:00.000Z',
        allDay: false,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        textColor: '#ffffff'
      };

      const event2: CalendarEvent = {
        id: 'event-2',
        title: 'Event 2',
        start: '2024-01-15T11:00:00.000Z',
        end: '2024-01-15T13:00:00.000Z',
        allDay: false,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        textColor: '#ffffff'
      };

      const combined = combineCalendarEvents([event1], [event2]);

      expect(combined).toHaveLength(2);
      expect(combined[0].title).toBe('Event 1'); // Earlier start time
      expect(combined[1].title).toBe('Event 2'); // Later start time
    });
  });

  describe('edge cases', () => {
    it('should handle events at midnight boundary', () => {
      const midnightBlock: ScheduleBlock = {
        id: 'midnight-1',
        userId: 'user-123',
        title: 'Midnight Event',
        type: 'other',
        startTime: '00:00',
        endTime: '01:00',
        daysOfWeek: [1], // Monday
        isRecurring: true,
        priority: 'medium',
        isActive: true,
        timezone: 'UTC',
        color: '#6b7280',
        bufferBefore: 0,
        bufferAfter: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([midnightBlock], startDate, endDate);

      expect(events).toHaveLength(1);
      
      const startTime = new Date(events[0].start);
      const endTime = new Date(events[0].end || events[0].start);
      expect(startTime.getHours()).toBe(0);
      expect(startTime.getMinutes()).toBe(0);
      expect(endTime.getHours()).toBe(1);
      expect(endTime.getMinutes()).toBe(0);
    });

    it('should handle events spanning exactly 24 hours', () => {
      const fullDayBlock: ScheduleBlock = {
        id: 'fullday-1',
        userId: 'user-123',
        title: 'Full Day Event',
        type: 'other',
        startTime: '00:00',
        endTime: '00:00', // Next day
        daysOfWeek: [1], // Monday
        isRecurring: true,
        priority: 'medium',
        isActive: true,
        timezone: 'UTC',
        color: '#6b7280',
        bufferBefore: 0,
        bufferAfter: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([fullDayBlock], startDate, endDate);

      expect(events).toHaveLength(1);
      
      const startTime = new Date(events[0].start);
      const endTime = new Date(events[0].end || events[0].start);
      expect(startTime.getHours()).toBe(0);
      expect(startTime.getMinutes()).toBe(0);
      expect(endTime.getHours()).toBe(0);
      expect(endTime.getMinutes()).toBe(0);
      
      // Check that it spans to the next day
      expect(endTime.getDate()).toBe(startTime.getDate() + 1);
    });
  });
});
