import { defineTable, column } from 'astro:db';
import { Users } from './Users.db';

// Session table for managing user sessions (BetterAuth compatible)
export const Sessions = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    expiresAt: column.date(),
    token: column.text({ unique: true }),
    ipAddress: column.text({ optional: true }),
    userAgent: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
