import { defineDb, defineTable, column } from 'astro:db';

// User table for authentication
const Users = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    email: column.text({ unique: true }),
    name: column.text({ optional: true }),
    image: column.text({ optional: true }),
    passwordHash: column.text({ optional: true }),
    emailVerified: column.date({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// Session table for managing user sessions
const Sessions = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    expiresAt: column.date(),
    token: column.text({ unique: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Users,
    Sessions,
  }
});
