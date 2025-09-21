import { column, defineTable, NOW } from 'astro:db';
import { Users } from '../../../../db/config';

// Schedule Block table for user schedule preferences
export const ScheduleBlock = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    title: column.text(),
    type: column.text(), // 'work', 'sleep', 'personal', 'travel', 'meal', 'exercise', 'family', 'study', 'other'
    startTime: column.text(), // "09:00" (24-hour format)
    endTime: column.text(), // "17:00"
    daysOfWeek: column.text(), // JSON array: [1,2,3,4,5] (Mon-Fri)
    isRecurring: column.boolean({ default: true }),
    priority: column.text({ default: 'medium' }), // 'high', 'medium', 'low'
    isActive: column.boolean({ default: true }),
    timezone: column.text({ default: 'UTC' }),
    startDate: column.date({ optional: true }), // Optional: for one-time blocks
    endDate: column.date({ optional: true }), // Optional: for temporary blocks
    description: column.text({ optional: true }),
    color: column.text({ default: '#3b82f6' }),
    bufferBefore: column.number({ default: 0 }), // minutes
    bufferAfter: column.number({ default: 0 }), // minutes
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});
