import { describe, it, expect } from 'vitest';
import { formatEventTime, formatEventDate } from './event-utils';

describe('event-utils', () => {
  describe('formatEventTime', () => {
    it('should format all-day events', () => {
      const result = formatEventTime(
        '2024-01-15T10:00:00Z',
        '2024-01-15T11:00:00Z',
        true
      );
      expect(result).toBe('All Day Event');
    });

    it('should format single time events', () => {
      const result = formatEventTime('2024-01-15T10:00:00Z');
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M/); // Should match time format
    });

    it('should format same-day time ranges', () => {
      const result = formatEventTime(
        '2024-01-15T10:00:00Z',
        '2024-01-15T11:30:00Z'
      );
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M/); // Should match time range format
    });

    it('should format multi-day time ranges', () => {
      const result = formatEventTime(
        '2024-01-15T10:00:00Z',
        '2024-01-16T11:30:00Z'
      );
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M/); // Should match time range format
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatEventTime('invalid-date');
      expect(result).toBe('Invalid date');
    });

    it('should handle invalid end dates gracefully', () => {
      const result = formatEventTime(
        '2024-01-15T10:00:00Z',
        'invalid-end-date'
      );
      expect(result).toBe('Invalid date'); // Both start and end are invalid in this case
    });
  });

  describe('formatEventDate', () => {
    it('should format today', () => {
      const today = new Date();
      const todayISO = today.toISOString();
      const result = formatEventDate(todayISO);
      expect(result).toBe('Today');
    });

    it('should format tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowISO = tomorrow.toISOString();
      const result = formatEventDate(tomorrowISO);
      expect(result).toBe('Tomorrow');
    });

    it('should format yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();
      const result = formatEventDate(yesterdayISO);
      expect(result).toBe('Yesterday');
    });

    it('should format other dates', () => {
      const result = formatEventDate('2024-01-15T10:00:00Z');
      expect(result).toBe('Monday, January 15, 2024');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatEventDate('invalid-date');
      expect(result).toBe('Invalid date');
    });
  });
});
