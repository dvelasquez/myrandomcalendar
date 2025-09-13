import { Users, Sessions } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Infer TypeScript types from your database tables
export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export type Session = InferSelectModel<typeof Sessions>;
export type NewSession = InferInsertModel<typeof Sessions>;

// You can also create more specific types for different use cases
export type UserWithoutPassword = Omit<User, 'passwordHash'>;
export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image'>;

// Session with user data (for joins)
export type SessionWithUser = Session & {
  user: UserWithoutPassword;
};

// Example usage in your auth functions
export interface AuthResult {
  success: boolean;
  user?: UserWithoutPassword;
  error?: string;
}

export interface SessionResult {
  success: boolean;
  session?: SessionWithUser;
  error?: string;
}
