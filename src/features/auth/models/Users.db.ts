import { defineTable, column } from 'astro:db';

// User table for authentication (BetterAuth compatible)
export const Users = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text({ optional: true }),
    image: column.text({ optional: true }),
    emailVerified: column.boolean({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
