import type {
  ScheduleBlockType,
  SchedulePriority,
} from '../models/ScheduleBlocks.types';

// Schedule types for forms and display
export const SCHEDULE_TYPES: { value: ScheduleBlockType; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'personal', label: 'Personal' },
  { value: 'travel', label: 'Travel' },
  { value: 'meal', label: 'Meals' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'family', label: 'Family' },
  { value: 'study', label: 'Study' },
  { value: 'other', label: 'Other' },
];

// Priority options for forms and display
export const PRIORITIES: { value: SchedulePriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Days of week for forms and display
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

// Priority colors for display
export const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

// Default values
export const DEFAULT_SCHEDULE_VALUES = {
  title: '',
  type: 'work' as ScheduleBlockType,
  startTime: '09:00',
  endTime: '17:00',
  priority: 'medium' as SchedulePriority,
  color: '#3b82f6',
  bufferBefore: 0,
  bufferAfter: 0,
  isRecurring: true,
  isActive: true,
  timezone: 'UTC',
  daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
};

// Day names for display
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to format days of week for display
export function formatDaysOfWeek(daysOfWeekString: string): string {
  try {
    const daysArray = JSON.parse(daysOfWeekString);
    return daysArray.map((day: number) => DAY_NAMES[day]).join(', ');
  } catch {
    return 'Invalid days';
  }
}

// Helper function to check if a day is selected
export function isDaySelected(
  daysOfWeekString: string,
  dayValue: number
): boolean {
  try {
    const daysArray = JSON.parse(daysOfWeekString);
    return daysArray.includes(dayValue);
  } catch {
    return false;
  }
}
