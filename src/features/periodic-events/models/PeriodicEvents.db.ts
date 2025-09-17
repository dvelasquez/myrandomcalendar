import { column, defineTable } from "astro:db";
import { Users } from "../../../../db/config";

 // Periodic Events table for recurring activities without fixed times
 export const PeriodicEvents = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    title: column.text(), // "Go to the gym", "Walk the dogs"
    description: column.text({ optional: true }),
    frequency: column.text(), // 'daily', 'weekly', 'monthly'
    frequencyCount: column.number(), // 3 (for "3 times a week")
    duration: column.number(), // Duration in minutes (60 for "1 hour")
    category: column.text({ default: 'personal' }), // 'exercise', 'personal', 'family', 'work', 'health', 'hobby', 'other'
    priority: column.text({ default: 'medium' }), // 'high', 'medium', 'low'
    isActive: column.boolean({ default: true }),
    color: column.text({ default: '#10b981' }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});