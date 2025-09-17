import { defineTable, column } from 'astro:db';

// Verification table for email verification (BetterAuth compatible)
export const Verifications = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.date(),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
