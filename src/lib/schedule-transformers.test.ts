import { describe, it, expect } from 'vitest';
import { scheduleBlocksToCalendarEvents, combineCalendarEvents, getDefaultColorForScheduleType, validateScheduleBlock } from '../lib/schedule-transformers';
import type { ScheduleBlock, CalendarEvent } from '../lib/types';

describe('schedule-transformers', () => {
  describe('scheduleBlocksToCalendarEvents', () => {
    it('should generate events for a regular work schedule', () => {
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
        bufferBefore: 15,
        bufferAfter: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([workBlock], startDate, endDate);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Work Hours');
      
      // Check that the event starts and ends at the correct times (accounting for timezone)
      const startTime = new Date(events[0].start);
      const endTime = new Date(events[0].end || events[0].start);
      expect(startTime.getHours()).toBe(8); // 09:00 - 15min buffer = 08:45
      expect(startTime.getMinutes()).toBe(45);
      expect(endTime.getHours()).toBe(17); // 17:00 + 15min buffer = 17:15
      expect(endTime.getMinutes()).toBe(15);
      
      expect(events[0].extendedProps?.isScheduleBlock).toBe(true);
      expect(events[0].extendedProps?.scheduleBlockType).toBe('work');
    });

    it('should generate events for an overnight sleep schedule', () => {
      const sleepBlock: ScheduleBlock = {
        id: 'sleep-1',
        userId: 'user-123',
        title: 'Sleep Time',
        type: 'sleep',
        startTime: '23:00',
        endTime: '07:00',
        daysOfWeek: [1], // Monday only for testing
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
      expect(events[0].title).toBe('Sleep Time');
      
      // Check that the event starts and ends at the correct times (accounting for timezone)
      const startTime = new Date(events[0].start);
      const endTime = new Date(events[0].end || events[0].start);
      expect(startTime.getHours()).toBe(22); // 23:00 - 30min buffer = 22:30
      expect(startTime.getMinutes()).toBe(30);
      expect(endTime.getHours()).toBe(7); // 07:00 + 30min buffer = 07:30
      expect(endTime.getMinutes()).toBe(30);
      
      // Check that it spans to the next day
      expect(endTime.getDate()).toBe(startTime.getDate() + 1);
      
      expect(events[0].extendedProps?.isScheduleBlock).toBe(true);
      expect(events[0].extendedProps?.scheduleBlockType).toBe('sleep');
    });

    it('should generate multiple events for multiple days', () => {
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

      const events = scheduleBlocksToCalendarEvents([workBlock], startDate, endDate);

      expect(events).toHaveLength(3); // Mon, Tue, Wed
      
      // Check that events are generated for consecutive days
      const event1Start = new Date(events[0].start);
      const event2Start = new Date(events[1].start);
      const event3Start = new Date(events[2].start);
      
      expect(event1Start.getHours()).toBe(9);
      expect(event2Start.getHours()).toBe(9);
      expect(event3Start.getHours()).toBe(9);
      
      // Check that they're on consecutive days
      expect(event2Start.getDate()).toBe(event1Start.getDate() + 1);
      expect(event3Start.getDate()).toBe(event2Start.getDate() + 1);
    });

    it('should skip inactive schedule blocks', () => {
      const inactiveBlock: ScheduleBlock = {
        id: 'inactive-1',
        userId: 'user-123',
        title: 'Inactive Block',
        type: 'work',
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [1],
        isRecurring: true,
        priority: 'high',
        isActive: false, // Inactive
        timezone: 'UTC',
        color: '#3b82f6',
        bufferBefore: 0,
        bufferAfter: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([inactiveBlock], startDate, endDate);

      expect(events).toHaveLength(0);
    });

    it('should handle invalid time formats gracefully', () => {
      const invalidBlock: ScheduleBlock = {
        id: 'invalid-1',
        userId: 'user-123',
        title: 'Invalid Block',
        type: 'work',
        startTime: 'invalid-time',
        endTime: '17:00',
        daysOfWeek: [1],
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

      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-15');

      const events = scheduleBlocksToCalendarEvents([invalidBlock], startDate, endDate);

      expect(events).toHaveLength(0);
    });
  });

  describe('combineCalendarEvents', () => {
    it('should combine and sort events by start time', () => {
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
  });

  describe('getDefaultColorForScheduleType', () => {
    it('should return correct colors for each schedule type', () => {
      expect(getDefaultColorForScheduleType('work')).toBe('#3b82f6');
      expect(getDefaultColorForScheduleType('sleep')).toBe('#6366f1');
      expect(getDefaultColorForScheduleType('personal')).toBe('#10b981');
      expect(getDefaultColorForScheduleType('travel')).toBe('#f59e0b');
      expect(getDefaultColorForScheduleType('meal')).toBe('#f97316');
      expect(getDefaultColorForScheduleType('exercise')).toBe('#ef4444');
      expect(getDefaultColorForScheduleType('family')).toBe('#8b5cf6');
      expect(getDefaultColorForScheduleType('study')).toBe('#06b6d4');
      expect(getDefaultColorForScheduleType('other')).toBe('#6b7280');
    });

    it('should return default color for unknown types', () => {
      expect(getDefaultColorForScheduleType('unknown' as any)).toBe('#6b7280');
    });
  });

  describe('validateScheduleBlock', () => {
    it('should validate a correct schedule block', () => {
      const validBlock: Partial<ScheduleBlock> = {
        title: 'Valid Block',
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        type: 'work',
        priority: 'high',
        isActive: true,
        timezone: 'UTC',
        color: '#3b82f6',
        bufferBefore: 0,
        bufferAfter: 0
      };

      const errors = validateScheduleBlock(validBlock);
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid schedule block', () => {
      const invalidBlock: Partial<ScheduleBlock> = {
        title: '',
        startTime: 'invalid',
        endTime: '25:00',
        daysOfWeek: [],
        type: 'work',
        priority: 'high',
        isActive: true,
        timezone: 'UTC',
        color: '#3b82f6',
        bufferBefore: -10,
        bufferAfter: 0
      };

      const errors = validateScheduleBlock(invalidBlock);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Valid start time is required (format: HH:MM)');
      expect(errors).toContain('Valid end time is required (format: HH:MM)');
      expect(errors).toContain('At least one day of the week must be selected');
    });
  });
});
