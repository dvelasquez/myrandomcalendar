import { defineTable, column } from 'astro:db';
import { Users } from './Users.db';

// Account table for OAuth providers (BetterAuth compatible)
export const Accounts = defineTable({
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
    password: column.text({ optional: true }), // For email/password authentication
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
