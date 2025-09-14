import { defineAction, ActionError } from 'astro:actions';
import { db, Accounts } from 'astro:db';
import { eq, and } from 'drizzle-orm';
import { google } from 'googleapis';
import { auth } from '../lib/better-auth';

export const fetchCalendar = defineAction({
  accept: 'form',
  handler: async (_, { request }) => {
    try {
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

      // Get the user's Google account information directly from database
      const googleAccounts = await db
        .select()
        .from(Accounts)
        .where(and(
          eq(Accounts.userId, session.user.id),
          eq(Accounts.providerId, 'google')
        ))
        .limit(1);

      const googleAccount = googleAccounts[0];
      
      if (!googleAccount || !googleAccount.accessToken) {
        throw new ActionError({
          code: 'NOT_FOUND',
          message: 'No Google account with calendar access found. Please sign in with Google again.',
        });
      }

      // Check if the account has the calendar scope
      if (!googleAccount.scope || !googleAccount.scope.includes('calendar.readonly')) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Google account needs calendar access. Please sign out and sign in with Google again to grant calendar permissions.',
        });
      }

      // Set up Google OAuth2 client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: googleAccount.accessToken,
        refresh_token: googleAccount.refreshToken,
      });

      // Create Calendar API client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      // Fetch calendar events
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return {
        success: true,
        events: response.data.items || [],
        calendarId: response.data.kind,
        timeZone: response.data.timeZone,
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
