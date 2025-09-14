import { defineDb, defineTable, column } from 'astro:db';

// User table for authentication (BetterAuth compatible)
const Users = defineTable({
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

// Session table for managing user sessions (BetterAuth compatible)
const Sessions = defineTable({
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

// Account table for OAuth providers (BetterAuth compatible)
const Accounts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    accountId: column.text({ unique: true }),
    userId: column.text({ references: () => Users.columns.id }),
    providerId: column.text(),
    providerAccountId: column.text({ optional: true }),
    accessToken: column.text({ optional: true }),
    refreshToken: column.text({ optional: true }),
    accessTokenExpiresAt: column.date({ optional: true }),
    tokenType: column.text({ optional: true }),
    scope: column.text({ optional: true }),
    idToken: column.text({ optional: true }),
    sessionState: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Verification table for email verification (BetterAuth compatible)
const Verifications = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    identifier: column.text(),
    value: column.text(),
    expiresAt: column.date(),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Schedule Blocks table for user schedule preferences
const ScheduleBlocks = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    title: column.text(),
    type: column.text(), // 'work', 'sleep', 'personal', 'travel', 'meal', 'exercise', 'family', 'study', 'other'
    startTime: column.text(), // "09:00" (24-hour format)
    endTime: column.text(),   // "17:00"
    daysOfWeek: column.text(), // JSON array: [1,2,3,4,5] (Mon-Fri)
    isRecurring: column.boolean({ default: true }),
    priority: column.text({ default: 'medium' }), // 'high', 'medium', 'low'
    isActive: column.boolean({ default: true }),
    timezone: column.text({ default: 'UTC' }),
    startDate: column.date({ optional: true }), // Optional: for one-time blocks
    endDate: column.date({ optional: true }),   // Optional: for temporary blocks
    description: column.text({ optional: true }),
    color: column.text({ default: '#3b82f6' }),
    bufferBefore: column.number({ default: 0 }), // minutes
    bufferAfter: column.number({ default: 0 }),  // minutes
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Users,
    Sessions,
    Accounts,
    Verifications,
    ScheduleBlocks,
  }
});
