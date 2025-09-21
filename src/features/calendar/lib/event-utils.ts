import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

/**
 * Formats event time range for display
 * @param startDate - ISO string of start date
 * @param endDate - Optional ISO string of end date
 * @param allDay - Whether the event is all day
 * @returns Formatted time string
 */
export const formatEventTime = (
  startDate: string,
  endDate?: string,
  allDay?: boolean
): string => {
  if (allDay) {
    return 'All Day Event';
  }

  try {
    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : null;

    // Format start time
    const startTime = format(start, 'h:mm a');

    if (!end) {
      return startTime;
    }

    // Check if it's the same day
    const isSameDay = format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd');

    if (isSameDay) {
      const endTime = format(end, 'h:mm a');
      return `${startTime} - ${endTime}`;
    } else {
      const endTime = format(end, 'h:mm a');
      return `${startTime} - ${endTime}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Formats event date for display with relative dates
 * @param startDate - ISO string of start date
 * @returns Formatted date string
 */
export const formatEventDate = (startDate: string): string => {
  try {
    const date = parseISO(startDate);

    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
