// Schedule Block types
export type ScheduleBlockType = 
  | 'work'           // Work hours
  | 'sleep'          // Sleep schedule
  | 'personal'       // Personal time, hobbies
  | 'travel'         // Commute time
  | 'meal'           // Meal times
  | 'exercise'       // Gym, workout
  | 'family'         // Family time
  | 'study'          // Study/learning time
  | 'other';         // Custom categories

export type SchedulePriority = 'high' | 'medium' | 'low';

// Schedule Block interface
export interface ScheduleBlock {
  id: string;
  userId: string;
  title: string;
  type: ScheduleBlockType;
  startTime: string;                 // "09:00" (24-hour format)
  endTime: string;                   // "17:00"
  daysOfWeek: number[];              // [1,2,3,4,5] (Mon-Fri)
  isRecurring: boolean;
  priority: SchedulePriority;
  isActive: boolean;
  timezone: string;
  startDate?: Date;                  // Optional: for one-time blocks
  endDate?: Date;                    // Optional: for temporary blocks
  description?: string;
  color: string;
  bufferBefore: number;              // minutes
  bufferAfter: number;               // minutes
  createdAt: Date;
  updatedAt: Date;
}