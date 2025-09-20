import type { SchedulePriority } from '../../schedule/models/ScheduleBlocks.types'; 
import type { PeriodicFrequency, PeriodicCategory } from '../models/PeriodicEvents.types';

// Form options for periodic events
export const FREQUENCY_OPTIONS: { value: PeriodicFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const CATEGORY_OPTIONS: { value: PeriodicCategory; label: string }[] = [
  { value: 'exercise', label: 'Exercise' },
  { value: 'personal', label: 'Personal' },
  { value: 'family', label: 'Family' },
  { value: 'work', label: 'Work' },
  { value: 'health', label: 'Health' },
  { value: 'hobby', label: 'Hobby' },
  { value: 'other', label: 'Other' },
];

export const PRIORITY_OPTIONS: { value: SchedulePriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const COLOR_OPTIONS = [
  { value: '#10b981', label: 'Green', class: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#f59e0b', label: 'Orange', class: 'bg-orange-500' },
  { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
] as const;
