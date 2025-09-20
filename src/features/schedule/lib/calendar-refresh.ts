import { actions } from 'astro:actions';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { createFetchCalendarFormData } from '../../calendar/models/Calendar.types';
import type { GoogleCalendarListResponse } from '@/features/calendar/providers/google-calendar/models/GoogleCalendar.types';

// Calendar refresh functionality for client-side use

export interface CalendarRefreshOptions {
  startDate?: Date;
  endDate?: Date;
  onSuccess?: (data: GoogleCalendarListResponse) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

// Refresh calendar data for a specific date range
export async function refreshCalendarData(options: CalendarRefreshOptions = {}): Promise<GoogleCalendarListResponse> {
  const {
    startDate = startOfMonth(new Date()),
    endDate = endOfMonth(new Date()),
    onSuccess,
    onError,
    onComplete
  } = options;

  try {
    const formData = createFetchCalendarFormData(startDate, endDate);
    const result = await actions.calendar.providers.google.fetchCalendar(formData);
    
    if (result.data?.success) {
      onSuccess?.(result.data);
      return result.data;
    } else {
      const error = result.error?.message || 'Failed to fetch calendar data';
      onError?.(error);
      throw new Error(error);
    }
  } catch (error) {
    const errorMessage = (error as Error).message || 'An error occurred while refreshing calendar';
    onError?.(errorMessage);
    throw error;
  } finally {
    onComplete?.();
  }
}

// Refresh calendar for current month
export async function refreshCurrentMonthCalendar(
  onSuccess?: (data: GoogleCalendarListResponse) => void,
  onError?: (error: string) => void
): Promise<GoogleCalendarListResponse> {
  const today = new Date();
  return refreshCalendarData({
    startDate: startOfMonth(today),
    endDate: endOfMonth(today),
    onSuccess,
    onError
  });
}

// Refresh calendar for current day
export async function refreshCurrentDayCalendar(
  onSuccess?: (data: GoogleCalendarListResponse) => void,
  onError?: (error: string) => void
): Promise<GoogleCalendarListResponse> {
  const today = new Date();
  return refreshCalendarData({
    startDate: startOfDay(today),
    endDate: endOfDay(today),
    onSuccess,
    onError
  });
}

// Setup calendar refresh button handler
export function setupCalendarRefreshButton(
  buttonId: string,
  options: CalendarRefreshOptions = {}
): void {
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (!button) return;

    const originalText = button.textContent;
    
    button.addEventListener('click', async () => {
      button.textContent = 'Refreshing...';
      button.disabled = true;
      
      try {
        await refreshCalendarData({
          ...options,
          onComplete: () => {
            button.textContent = originalText;
            button.disabled = false;
          }
        });
        
        // Reload page to update with fresh data
        window.location.reload();
      } catch (error) {
        console.error('Calendar refresh failed:', error);
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  });
}

// Setup calendar refresh with JSON output update
export function setupCalendarRefreshWithJsonOutput(
  buttonId: string,
  jsonOutputId: string,
  options: CalendarRefreshOptions = {}
): void {
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    const jsonOutput = document.getElementById(jsonOutputId) as HTMLPreElement;
    
    if (!button || !jsonOutput) return;

    const originalText = button.textContent;
    
    button.addEventListener('click', async () => {
      button.textContent = 'Refreshing...';
      button.disabled = true;
      
      try {
        await refreshCalendarData({
          ...options,
          onSuccess: (data) => {
            jsonOutput.textContent = JSON.stringify(data, null, 2);
            
            // Update events count display if it exists
            const eventsCountElement = document.querySelector('p:has(strong:contains("Events Found"))');
            if (eventsCountElement && data.events) {
              eventsCountElement.textContent = `Events Found: ${data.events.length}`;
            }
          },
          onError: (error) => {
            jsonOutput.textContent = JSON.stringify({ error }, null, 2);
          },
          onComplete: () => {
            button.textContent = originalText;
            button.disabled = false;
          }
        });
        
        // Reload page to update FullCalendar with new data
        window.location.reload();
      } catch (error) {
        console.error('Calendar refresh failed:', error);
        jsonOutput.textContent = JSON.stringify({ 
          error: (error as Error).message || 'An error occurred' 
        }, null, 2);
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  });
}

// Handle date range changes from FullCalendar
export function setupDateRangeChangeHandler(
  onDateRangeChange: (startDate: Date, endDate: Date) => void
): void {
  // Make the function globally available for FullCalendar component
  (window as unknown as { 
    handleDateRangeChange: (startDate: Date, endDate: Date) => void 
  }).handleDateRangeChange = onDateRangeChange;
}

// Create a date range change handler that fetches calendar data
export function createDateRangeChangeHandler(
  jsonOutputId?: string
): (startDate: Date, endDate: Date) => void {
  return async (startDate: Date, endDate: Date) => {
    console.log('Date range changed:', { startDate, endDate });
    
    try {
      await refreshCalendarData({
        startDate,
        endDate,
        onSuccess: (data) => {
          if (jsonOutputId) {
            const jsonOutput = document.getElementById(jsonOutputId) as HTMLPreElement;
            if (jsonOutput) {
              jsonOutput.textContent = JSON.stringify(data, null, 2);
            }
          }
          
          // Update events count display if it exists
          const eventsCountElement = document.querySelector('p:has(strong:contains("Events Found"))');
          if (eventsCountElement && data.events) {
            eventsCountElement.textContent = `Events Found: ${data.events.length}`;
          }
        },
        onError: (error) => {
          if (jsonOutputId) {
            const jsonOutput = document.getElementById(jsonOutputId) as HTMLPreElement;
            if (jsonOutput) {
              jsonOutput.textContent = JSON.stringify({ error }, null, 2);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching calendar for date range:', error);
    }
  };
}
