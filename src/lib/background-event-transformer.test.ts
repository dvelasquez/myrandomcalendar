import { describe, it, expect } from 'vitest';
import type { TimeSlot } from './availability-calculator';
import {
  transformTimeSlotsToBackgroundEvents,
  getBackgroundEventTitle,
  getBackgroundEventColor,
  getBackgroundEventClassName,
  filterBackgroundEventsByType,
  getAvailableBackgroundEvents,
  getBusyBackgroundEvents,
  getScheduleBlockBackgroundEvents,
  combineCalendarAndBackgroundEvents,
  createBackgroundEventConfig,
  validateBackgroundEventConfig,
  isValidColor,
  getBackgroundEventStats,
  DEFAULT_BACKGROUND_EVENT_CONFIG
} from './background-event-transformer';
import type { BackgroundEvent } from './background-event-transformer';
import type { CalendarEvent } from './types';

describe('Background Event Transformer', () => {
  const mockTimeSlots: TimeSlot[] = [
    {
      start: '2024-01-15T09:00:00Z',
      end: '2024-01-15T10:00:00Z',
      type: 'available'
    },
    {
      start: '2024-01-15T10:00:00Z',
      end: '2024-01-15T11:00:00Z',
      type: 'busy',
      title: 'Meeting',
      priority: 'high'
    },
    {
      start: '2024-01-15T11:00:00Z',
      end: '2024-01-15T12:00:00Z',
      type: 'schedule-block',
      title: 'Work Hours',
      color: '#3b82f6'
    }
  ];

  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: 'event-1',
      title: 'Regular Event',
      start: '2024-01-15T14:00:00Z',
      end: '2024-01-15T15:00:00Z',
      allDay: false,
      backgroundColor: '#ef4444',
      extendedProps: {}
    }
  ];

  describe('getBackgroundEventTitle', () => {
    it('should return correct title for available slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' };
      const result = getBackgroundEventTitle(slot);
      expect(result).toBe('Available');
    });

    it('should return correct title for busy slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'busy' };
      const result = getBackgroundEventTitle(slot);
      expect(result).toBe('Busy');
    });

    it('should return correct title for schedule block slot', () => {
      const slot: TimeSlot = { 
        start: '2024-01-15T09:00:00Z', 
        end: '2024-01-15T10:00:00Z', 
        type: 'schedule-block',
        title: 'Work Hours'
      };
      const result = getBackgroundEventTitle(slot);
      expect(result).toBe('Work Hours');
    });

    it('should return default title for schedule block without title', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'schedule-block' };
      const result = getBackgroundEventTitle(slot);
      expect(result).toBe('Schedule Block');
    });
  });

  describe('getBackgroundEventColor', () => {
    it('should return correct color for available slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' };
      const result = getBackgroundEventColor(slot, DEFAULT_BACKGROUND_EVENT_CONFIG);
      expect(result).toBe('#10b981');
    });

    it('should return correct color for busy slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'busy' };
      const result = getBackgroundEventColor(slot, DEFAULT_BACKGROUND_EVENT_CONFIG);
      expect(result).toBe('#ef4444');
    });

    it('should return correct color for schedule block slot', () => {
      const slot: TimeSlot = { 
        start: '2024-01-15T09:00:00Z', 
        end: '2024-01-15T10:00:00Z', 
        type: 'schedule-block',
        color: '#3b82f6'
      };
      const result = getBackgroundEventColor(slot, DEFAULT_BACKGROUND_EVENT_CONFIG);
      expect(result).toBe('#3b82f6');
    });

    it('should return default color for schedule block without color', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'schedule-block' };
      const result = getBackgroundEventColor(slot, DEFAULT_BACKGROUND_EVENT_CONFIG);
      expect(result).toBe('#3b82f6');
    });
  });

  describe('getBackgroundEventClassName', () => {
    it('should return correct class name for available slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'available' };
      const result = getBackgroundEventClassName(slot);
      expect(result).toBe('availability-available');
    });

    it('should return correct class name for busy slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'busy' };
      const result = getBackgroundEventClassName(slot);
      expect(result).toBe('availability-busy');
    });

    it('should return correct class name for schedule block slot', () => {
      const slot: TimeSlot = { start: '2024-01-15T09:00:00Z', end: '2024-01-15T10:00:00Z', type: 'schedule-block' };
      const result = getBackgroundEventClassName(slot);
      expect(result).toBe('availability-schedule-block');
    });
  });

  describe('transformTimeSlotsToBackgroundEvents', () => {
    it('should transform time slots to background events', () => {
      const result = transformTimeSlotsToBackgroundEvents(mockTimeSlots);
      
      expect(result).toHaveLength(3);
      expect(result[0].rendering).toBe('background');
      expect(result[0].display).toBe('background');
    });

    it('should include correct extended props', () => {
      const result = transformTimeSlotsToBackgroundEvents(mockTimeSlots);
      
      expect(result[0].extendedProps?.availabilityType).toBe('available');
      expect(result[1].extendedProps?.availabilityType).toBe('busy');
      expect(result[2].extendedProps?.availabilityType).toBe('schedule-block');
    });

    it('should handle empty array', () => {
      const result = transformTimeSlotsToBackgroundEvents([]);
      expect(result).toHaveLength(0);
    });

    it('should use custom config when provided', () => {
      const customConfig = {
        ...DEFAULT_BACKGROUND_EVENT_CONFIG,
        availableColor: '#00ff00'
      };
      
      const result = transformTimeSlotsToBackgroundEvents(mockTimeSlots, customConfig);
      
      expect(result[0].backgroundColor).toBe('#00ff00');
    });
  });

  describe('filterBackgroundEventsByType', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Available',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#10b981',
        extendedProps: { availabilityType: 'available' }
      },
      {
        id: 'availability-2',
        title: 'Busy',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#ef4444',
        extendedProps: { availabilityType: 'busy' }
      }
    ];

    it('should filter available events correctly', () => {
      const result = filterBackgroundEventsByType(backgroundEvents, 'available');
      expect(result).toHaveLength(1);
      expect(result[0].extendedProps?.availabilityType).toBe('available');
    });

    it('should filter busy events correctly', () => {
      const result = filterBackgroundEventsByType(backgroundEvents, 'busy');
      expect(result).toHaveLength(1);
      expect(result[0].extendedProps?.availabilityType).toBe('busy');
    });
  });

  describe('getAvailableBackgroundEvents', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Available',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#10b981',
        extendedProps: { availabilityType: 'available' }
      }
    ];

    it('should return only available events', () => {
      const result = getAvailableBackgroundEvents(backgroundEvents);
      expect(result).toHaveLength(1);
      expect(result[0].extendedProps?.availabilityType).toBe('available');
    });
  });

  describe('getBusyBackgroundEvents', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Busy',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#ef4444',
        extendedProps: { availabilityType: 'busy' }
      }
    ];

    it('should return only busy events', () => {
      const result = getBusyBackgroundEvents(backgroundEvents);
      expect(result).toHaveLength(1);
      expect(result[0].extendedProps?.availabilityType).toBe('busy');
    });
  });

  describe('getScheduleBlockBackgroundEvents', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Schedule Block',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#3b82f6',
        extendedProps: { availabilityType: 'schedule-block' }
      }
    ];

    it('should return only schedule block events', () => {
      const result = getScheduleBlockBackgroundEvents(backgroundEvents);
      expect(result).toHaveLength(1);
      expect(result[0].extendedProps?.availabilityType).toBe('schedule-block');
    });
  });

  describe('combineCalendarAndBackgroundEvents', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Available',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#10b981',
        extendedProps: { availabilityType: 'available' }
      }
    ];

    it('should combine calendar and background events', () => {
      const result = combineCalendarAndBackgroundEvents(mockCalendarEvents, backgroundEvents);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('event-1');
      expect(result[1].id).toBe('availability-1');
    });

    it('should handle empty calendar events', () => {
      const result = combineCalendarAndBackgroundEvents([], backgroundEvents);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('availability-1');
    });

    it('should handle empty background events', () => {
      const result = combineCalendarAndBackgroundEvents(mockCalendarEvents, []);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('event-1');
    });
  });

  describe('createBackgroundEventConfig', () => {
    it('should create config with defaults', () => {
      const result = createBackgroundEventConfig({});
      
      expect(result.availableColor).toBe('#10b981');
      expect(result.busyColor).toBe('#ef4444');
      expect(result.scheduleBlockColor).toBe('#3b82f6');
    });

    it('should override defaults with provided values', () => {
      const result = createBackgroundEventConfig({
        availableColor: '#00ff00',
        opacity: 0.5
      });
      
      expect(result.availableColor).toBe('#00ff00');
      expect(result.opacity).toBe(0.5);
      expect(result.busyColor).toBe('#ef4444'); // Should keep default
    });
  });

  describe('validateBackgroundEventConfig', () => {
    it('should validate correct config', () => {
      const result = validateBackgroundEventConfig(DEFAULT_BACKGROUND_EVENT_CONFIG);
      expect(result).toHaveLength(0);
    });

    it('should detect invalid colors', () => {
      const invalidConfig = {
        ...DEFAULT_BACKGROUND_EVENT_CONFIG,
        availableColor: 'invalid-color'
      };
      
      const result = validateBackgroundEventConfig(invalidConfig);
      expect(result).toContain('Invalid available color');
    });

    it('should detect invalid opacity', () => {
      const invalidConfig = {
        ...DEFAULT_BACKGROUND_EVENT_CONFIG,
        opacity: 1.5
      };
      
      const result = validateBackgroundEventConfig(invalidConfig);
      expect(result).toContain('Opacity must be between 0 and 1');
    });

    it('should detect negative border width', () => {
      const invalidConfig = {
        ...DEFAULT_BACKGROUND_EVENT_CONFIG,
        borderWidth: -1
      };
      
      const result = validateBackgroundEventConfig(invalidConfig);
      expect(result).toContain('Border width must be non-negative');
    });
  });

  describe('isValidColor', () => {
    it('should validate hex colors', () => {
      expect(isValidColor('#ffffff')).toBe(true);
      expect(isValidColor('#000000')).toBe(true);
      expect(isValidColor('#abc123')).toBe(true);
      expect(isValidColor('#ABC123')).toBe(true);
    });

    it('should validate short hex colors', () => {
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('#000')).toBe(true);
      expect(isValidColor('#abc')).toBe(true);
    });

    it('should reject invalid colors', () => {
      expect(isValidColor('ffffff')).toBe(false);
      expect(isValidColor('#gggggg')).toBe(false);
      expect(isValidColor('#12345')).toBe(false);
      expect(isValidColor('red')).toBe(false);
    });
  });

  describe('getBackgroundEventStats', () => {
    const backgroundEvents: BackgroundEvent[] = [
      {
        id: 'availability-1',
        title: 'Available',
        start: '2024-01-15T09:00:00Z',
        end: '2024-01-15T10:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#10b981',
        extendedProps: { availabilityType: 'available' }
      },
      {
        id: 'availability-2',
        title: 'Busy',
        start: '2024-01-15T10:00:00Z',
        end: '2024-01-15T11:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#ef4444',
        extendedProps: { availabilityType: 'busy' }
      },
      {
        id: 'availability-3',
        title: 'Schedule Block',
        start: '2024-01-15T11:00:00Z',
        end: '2024-01-15T12:00:00Z',
        allDay: false,
        rendering: 'background',
        display: 'background',
        backgroundColor: '#3b82f6',
        extendedProps: { availabilityType: 'schedule-block' }
      }
    ];

    it('should calculate correct statistics', () => {
      const result = getBackgroundEventStats(backgroundEvents);
      
      expect(result.totalEvents).toBe(3);
      expect(result.availableEvents).toBe(1);
      expect(result.busyEvents).toBe(1);
      expect(result.scheduleBlockEvents).toBe(1);
    });

    it('should handle empty array', () => {
      const result = getBackgroundEventStats([]);
      
      expect(result.totalEvents).toBe(0);
      expect(result.availableEvents).toBe(0);
      expect(result.busyEvents).toBe(0);
      expect(result.scheduleBlockEvents).toBe(0);
    });
  });
});
