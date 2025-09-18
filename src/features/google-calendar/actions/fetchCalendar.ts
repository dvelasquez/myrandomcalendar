import { defineAction, ActionError } from 'astro:actions';
import { parseISO } from 'date-fns';
import { google } from 'googleapis';
import { auth } from '../../../lib/better-auth';
import { getGoogleCalendarCredentials, hasGoogleCalendarAccess } from '../db/get';
import { fetchCalendarSchema } from '../models/GoogleCalendar.schema';
import type { GoogleCalendarListResponse } from '../models/GoogleCalendar.types';

export const fetchCalendar = defineAction({
  accept: 'form',
  input: fetchCalendarSchema,
  handler: async ({ startDate, endDate }, { request }): Promise<GoogleCalendarListResponse> => {
    try {
      // Parse dates using date-fns (already validated by Zod)
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      // Get the current session
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access calendar data',
        });
      }

      // Check if user has Google Calendar access
      const hasAccess = await hasGoogleCalendarAccess(session.user.id);
      if (!hasAccess) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'No Google account with calendar access found. Please sign in with Google again.',
        });
      }

      // Get Google Calendar credentials
      const credentials = await getGoogleCalendarCredentials(session.user.id);
      if (!credentials) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'No Google account with calendar access found. Please sign in with Google again.',
        });
      }

      // Set up Google OAuth2 client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
      });

      // Create Calendar API client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Fetch calendar events for the specified date range
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 250, // Increased to handle larger date ranges
        singleEvents: true,
        orderBy: 'startTime',
      });

      return {
        success: true,
        events: response.data.items || [],
        calendarId: response.data.kind,
        timeZone: response.data.timeZone,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
    } catch (error) {
      console.error('Calendar fetch error:', error);
      
      if (error instanceof ActionError) {
        throw error;
      }

      // Handle Google API specific errors
      if (error instanceof Error && error.message.includes('invalid_grant')) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Google authentication expired. Please sign in again.',
        });
      }

      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch calendar data',
      });
    }
  },
});
