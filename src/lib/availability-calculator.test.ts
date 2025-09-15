import { isSameDay } from 'date-fns';
import { describe, it, expect } from 'vitest';
import {
  calculateAvailability,
  getStartOfDay,
  getEndOfDay,
  generateTimeSlots,
  findConflictingEvent,
  calculateAvailabilityStats,
  filterTimeSlotsByType,
  getAvailableTimeSlots,
  getBusyTimeSlots,
  getScheduleBlockTimeSlots,
  DEFAULT_AVAILABILITY_CONFIG
} from './availability-calculator';
import type { TimeSlot } from './availability-calculator';
import type { ScheduleBlock, CalendarEvent } from './types';

describe('Availability Calculator', () => {
  const mockDate = new Date('2024-01-15T12:00:00Z');
  const mockScheduleBlocks: ScheduleBlock[] = [
    {
      id: 'work-1',
      userId: 'user-1',
      title: 'Work Hours',
      type: 'work',
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      isRecurring: true,
      priority: 'high',
      isActive: true,
      timezone: 'UTC',
      color: '#3b82f6',
      bufferBefore: 0,
      bufferAfter: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: 'meeting-1',
      title: 'Team Meeting',
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z',
      allDay: false,
      backgroundColor: '#ef4444',
      extendedProps: {
        isScheduleBlock: false
      }
    }
  ];

  describe('getStartOfDay', () => {
    it('should return start of day for a given date', () => {
      const result = getStartOfDay(mockDate);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle different dates correctly', () => {
      // Use local dates to avoid timezone issues
      const date1 = new Date(2024, 0, 15, 15, 30, 45); // Jan 15, 2024 3:30 PM local
      const date2 = new Date(2024, 0, 15, 23, 59, 59); // Jan 15, 2024 11:59 PM local
      
      const result1 = getStartOfDay(date1);
      const result2 = getStartOfDay(date2);
      
      // Both should return the same start of day (midnight) in local timezone
      expect(result1.getHours()).toBe(0);
      expect(result1.getMinutes()).toBe(0);
      expect(result1.getSeconds()).toBe(0);
      expect(result1.getMilliseconds()).toBe(0);
      
      expect(result2.getHours()).toBe(0);
      expect(result2.getMinutes()).toBe(0);
      expect(result2.getSeconds()).toBe(0);
      expect(result2.getMilliseconds()).toBe(0);
      
      // Both should be on the same day - using date-fns for better comparison
      expect(isSameDay(result1, result2)).toBe(true);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day for a given date', () => {
      const result = getEndOfDay(mockDate);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('findConflictingEvent', () => {
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Event 1',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T12:00:00Z',
        allDay: false,
        extendedProps: {}
      },
      {
        id: 'event-2',
        title: 'Event 2',
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T16:00:00Z',
        allDay: false,
        extendedProps: {}
      }
    ];

    it('should find conflicting event when slot overlaps', () => {
      const slotStart = new Date('2024-01-15T11:00:00Z');
      const slotEnd = new Date('2024-01-15T13:00:00Z');
      
      const result = findConflictingEvent(slotStart, slotEnd, events);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('event-1');
    });

    it('should return undefined when no conflict exists', () => {
      const slotStart = new Date('2024-01-15T13:00:00Z');
      const slotEnd = new Date('2024-01-15T14:00:00Z');
      
      const result = findConflictingEvent(slotStart, slotEnd, events);
      
      expect(result).toBeUndefined();
    });

    it('should handle edge cases correctly', () => {
      const slotStart = new Date('2024-01-15T13:00:00Z');
      const slotEnd = new Date('2024-01-15T15:00:00Z');
      
      const result = findConflictingEvent(slotStart, slotEnd, events);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe('event-2');
    });
  });

  describe('generateTimeSlots', () => {
    const startOfDay = new Date('2024-01-15T00:00:00Z');
    const endOfDay = new Date('2024-01-15T23:59:59Z');
    const events: CalendarEvent[] = [
      {
        id: 'event-1',
        title: 'Event 1',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T12:00:00Z',
        allDay: false,
        extendedProps: { isScheduleBlock: false }
      }
    ];

    it('should generate merged contiguous time slots', () => {
      const result = generateTimeSlots(startOfDay, endOfDay, events);
      
      // Should have fewer slots than 24 because we merge contiguous ones
      expect(result.length).toBeLessThan(24);
      expect(result.length).toBeGreaterThan(0);
      
      // Each slot should have valid start/end times
      result.forEach(slot => {
        expect(new Date(slot.start)).toBeInstanceOf(Date);
        expect(new Date(slot.end)).toBeInstanceOf(Date);
        expect(new Date(slot.end).getTime()).toBeGreaterThan(new Date(slot.start).getTime());
      });
    });

    it('should mark conflicting slots as busy', () => {
      const result = generateTimeSlots(startOfDay, endOfDay, events);
      
      const busySlots = result.filter(slot => slot.type === 'busy');
      expect(busySlots.length).toBeGreaterThan(0);
    });

    it('should mark non-conflicting slots as available', () => {
      const result = generateTimeSlots(startOfDay, endOfDay, events);
      
      const availableSlots = result.filter(slot => slot.type === 'available');
      expect(availableSlots.length).toBeGreaterThan(0);
    });
  });

  describe('calculateAvailabilityStats', () => {
    const timeSlots: TimeSlot[] = [
      { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' },
      { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', type: 'busy' },
      { start: '2024-01-15T11:00:00Z', end: '2024-01-15T12:00:00Z', type: 'schedule-block' },
      { start: '2024-01-15T12:00:00Z', end: '2024-01-15T13:00:00Z', type: 'available' }
    ];

    it('should calculate correct statistics', () => {
      const result = calculateAvailabilityStats(timeSlots);
      
      expect(result.totalSlots).toBe(4);
      expect(result.availableSlots).toBe(2);
      expect(result.busySlots).toBe(1);
      expect(result.scheduleBlockSlots).toBe(1);
      expect(result.availabilityPercentage).toBe(50);
    });

    it('should handle empty array', () => {
      const result = calculateAvailabilityStats([]);
      
      expect(result.totalSlots).toBe(0);
      expect(result.availableSlots).toBe(0);
      expect(result.busySlots).toBe(0);
      expect(result.scheduleBlockSlots).toBe(0);
      expect(result.availabilityPercentage).toBe(0);
    });
  });

  describe('filterTimeSlotsByType', () => {
    const timeSlots: TimeSlot[] = [
      { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' },
      { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', type: 'busy' },
      { start: '2024-01-15T11:00:00Z', end: '2024-01-15T12:00:00Z', type: 'schedule-block' }
    ];

    it('should filter available slots correctly', () => {
      const result = filterTimeSlotsByType(timeSlots, 'available');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('available');
    });

    it('should filter busy slots correctly', () => {
      const result = filterTimeSlotsByType(timeSlots, 'busy');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('busy');
    });

    it('should filter schedule block slots correctly', () => {
      const result = filterTimeSlotsByType(timeSlots, 'schedule-block');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('schedule-block');
    });
  });

  describe('getAvailableTimeSlots', () => {
    const timeSlots: TimeSlot[] = [
      { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' },
      { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', type: 'busy' }
    ];

    it('should return only available slots', () => {
      const result = getAvailableTimeSlots(timeSlots);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('available');
    });
  });

  describe('getBusyTimeSlots', () => {
    const timeSlots: TimeSlot[] = [
      { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' },
      { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', type: 'busy' }
    ];

    it('should return only busy slots', () => {
      const result = getBusyTimeSlots(timeSlots);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('busy');
    });
  });

  describe('getScheduleBlockTimeSlots', () => {
    const timeSlots: TimeSlot[] = [
      { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' },
      { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', type: 'schedule-block' }
    ];

    it('should return only schedule block slots', () => {
      const result = getScheduleBlockTimeSlots(timeSlots);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('schedule-block');
    });
  });

  describe('calculateAvailability', () => {
    it('should calculate availability for a given date', async () => {
      const result = await calculateAvailability(
        mockDate,
        mockScheduleBlocks,
        mockCalendarEvents,
        DEFAULT_AVAILABILITY_CONFIG
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(24); // Merged slots, fewer than 24
    });

    it('should handle empty schedule blocks', async () => {
      const result = await calculateAvailability(
        mockDate,
        [],
        mockCalendarEvents,
        DEFAULT_AVAILABILITY_CONFIG
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(24); // Merged slots
    });

    it('should handle empty calendar events', async () => {
      const result = await calculateAvailability(
        mockDate,
        mockScheduleBlocks,
        [],
        DEFAULT_AVAILABILITY_CONFIG
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(24); // Merged slots
    });

    it('should handle both empty inputs', async () => {
      const result = await calculateAvailability(
        mockDate,
        [],
        [],
        DEFAULT_AVAILABILITY_CONFIG
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(24); // Merged slots
      // All slots should be available
      expect(result.every(slot => slot.type === 'available')).toBe(true);
    });
  });
});
