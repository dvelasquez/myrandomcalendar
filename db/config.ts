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

// https://astro.build/db/config
export default defineDb({
  tables: {
    Users,
    Sessions,
    Accounts,
    Verifications,
  }
});
