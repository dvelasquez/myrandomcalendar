import { Users, Sessions, Accounts, Verifications } from 'astro:db';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Infer TypeScript types from your database tables
export type User = InferSelectModel<typeof Users>;
export type NewUser = InferInsertModel<typeof Users>;

export type Session = InferSelectModel<typeof Sessions>;
export type NewSession = InferInsertModel<typeof Sessions>;

export type Account = InferSelectModel<typeof Accounts>;
export type NewAccount = InferInsertModel<typeof Accounts>;

export type Verification = InferSelectModel<typeof Verifications>;
export type NewVerification = InferInsertModel<typeof Verifications>;

// You can also create more specific types for different use cases
export type UserProfile = Pick<User, 'id' | 'name' | 'email' | 'image'>;

// Session with user data (for joins)
export type SessionWithUser = Session & {
  user: User;
};
