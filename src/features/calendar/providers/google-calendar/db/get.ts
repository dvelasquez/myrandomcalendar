import { db, Accounts } from 'astro:db';
import { eq, and } from 'drizzle-orm';
import type { GoogleCalendarCredentials } from '../models/GoogleCalendar.types';

/**
 * Get Google Calendar credentials for a user
 * @param userId - The user ID
 * @returns Google Calendar credentials or null if not found
 */
export async function getGoogleCalendarCredentials(userId: string): Promise<GoogleCalendarCredentials | null> {
  try {
    const googleAccounts = await db
      .select()
      .from(Accounts)
      .where(and(
        eq(Accounts.userId, userId),
        eq(Accounts.providerId, 'google')
      ))
      .limit(1);

    const googleAccount = googleAccounts[0];
    
    if (!googleAccount || !googleAccount.accessToken) {
      return null;
    }

    return {
      accessToken: googleAccount.accessToken,
      refreshToken: googleAccount.refreshToken || undefined,
      scope: googleAccount.scope || undefined,
    };
  } catch (error) {
    console.error('Error fetching Google Calendar credentials:', error);
    return null;
  }
}

/**
 * Check if user has Google Calendar access
 * @param userId - The user ID
 * @returns True if user has calendar access, false otherwise
 */
export async function hasGoogleCalendarAccess(userId: string): Promise<boolean> {
  const credentials = await getGoogleCalendarCredentials(userId);
  
  if (!credentials) {
    return false;
  }

  // Check if the account has the calendar scope
  return credentials.scope?.includes('calendar.readonly') ?? false;
}

/**
 * Get Google Calendar account for a user
 * @param userId - The user ID
 * @returns Google Calendar account or null if not found
 */
export async function getGoogleCalendarAccount(userId: string) {
  try {
    const googleAccounts = await db
      .select()
      .from(Accounts)
      .where(and(
        eq(Accounts.userId, userId),
        eq(Accounts.providerId, 'google')
      ))
      .limit(1);

    return googleAccounts[0] || null;
  } catch (error) {
    console.error('Error fetching Google Calendar account:', error);
    return null;
  }
}
