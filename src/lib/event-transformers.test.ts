import { describe, it, expect } from 'vitest';
import { transformGoogleApiEventsToFullCalendar } from '../lib/event-transformers';
import type { GoogleCalendarApiEvent, CalendarEvent } from '../lib/types';

describe('event-transformers', () => {
  describe('transformGoogleApiEventsToFullCalendar', () => {
    it('should transform a basic Google Calendar event', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-1',
        summary: 'Test Event',
        description: 'A test event',
        location: 'Test Location',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        },
        htmlLink: 'https://calendar.google.com/event/test',
        status: 'confirmed',
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z'
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].id).toBe('google-event-1');
      expect(transformed[0].title).toBe('Test Event');
      expect(transformed[0].start).toBe('2024-01-15T10:00:00Z');
      expect(transformed[0].end).toBe('2024-01-15T11:00:00Z');
      expect(transformed[0].allDay).toBe(false);
      expect(transformed[0].description).toBe('A test event');
      expect(transformed[0].location).toBe('Test Location');
      expect(transformed[0].url).toBe('https://calendar.google.com/event/test');
      expect(transformed[0].backgroundColor).toBeDefined();
      expect(transformed[0].borderColor).toBeDefined();
      expect(transformed[0].textColor).toBe('#ffffff');
    });

    it('should transform an all-day event', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-2',
        summary: 'All Day Event',
        start: {
          date: '2024-01-15'
        },
        end: {
          date: '2024-01-16'
        }
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].allDay).toBe(true);
      expect(transformed[0].start).toBe('2024-01-15');
      expect(transformed[0].end).toBe('2024-01-16');
    });

    it('should handle events without end time', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-3',
        summary: 'Event Without End',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        }
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].end).toBeUndefined();
    });

    it('should handle events with missing summary', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-4',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        }
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].title).toBe('Untitled Event');
    });

    it('should handle events with missing ID', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        summary: 'Event Without ID',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        }
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].id).toMatch(/^event-0-\d+$/);
    });

    it('should handle invalid date formats gracefully', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-5',
        summary: 'Invalid Date Event',
        start: {
          dateTime: 'invalid-date'
        },
        end: {
          dateTime: 'also-invalid'
        }
      };

      const transformed = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed).toHaveLength(1);
      expect(transformed[0].start).toBeDefined();
      expect(transformed[0].end).toBeUndefined(); // Invalid end date should be undefined
    });

    it('should generate consistent colors for the same event', () => {
      const googleEvent: GoogleCalendarApiEvent = {
        id: 'google-event-6',
        summary: 'Consistent Color Event',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        }
      };

      const transformed1 = transformGoogleApiEventsToFullCalendar([googleEvent]);
      const transformed2 = transformGoogleApiEventsToFullCalendar([googleEvent]);

      expect(transformed1[0].backgroundColor).toBe(transformed2[0].backgroundColor);
      expect(transformed1[0].borderColor).toBe(transformed2[0].borderColor);
    });

    it('should transform multiple events', () => {
      const googleEvents: GoogleCalendarApiEvent[] = [
        {
          id: 'google-event-7',
          summary: 'First Event',
          start: { dateTime: '2024-01-15T10:00:00Z' },
          end: { dateTime: '2024-01-15T11:00:00Z' }
        },
        {
          id: 'google-event-8',
          summary: 'Second Event',
          start: { dateTime: '2024-01-15T14:00:00Z' },
          end: { dateTime: '2024-01-15T15:00:00Z' }
        }
      ];

      const transformed = transformGoogleApiEventsToFullCalendar(googleEvents);

      expect(transformed).toHaveLength(2);
      expect(transformed[0].title).toBe('First Event');
      expect(transformed[1].title).toBe('Second Event');
    });

    it('should handle empty array', () => {
      const transformed = transformGoogleApiEventsToFullCalendar([]);
      expect(transformed).toHaveLength(0);
    });
  });
});
