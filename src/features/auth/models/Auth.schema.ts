import { z } from 'astro:schema';

// User validation schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  image: z.string().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Session validation schema
export const sessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.date(),
  token: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Account validation schema
export const accountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  userId: z.string(),
  providerId: z.string(),
  providerAccountId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  tokenType: z.string().optional(),
  scope: z.string().optional(),
  idToken: z.string().optional(),
  sessionState: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Verification validation schema
export const verificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
