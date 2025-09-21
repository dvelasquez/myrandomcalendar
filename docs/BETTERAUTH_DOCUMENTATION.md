# BetterAuth + Google OAuth Setup Documentation

## 🎯 **Critical Information for Future Development**

### **1. Database Schema Requirements**

The database schema MUST match BetterAuth's exact expectations:

```typescript
// db/config.ts - CRITICAL: These field names are required by BetterAuth
const Accounts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }), // Primary key
    accountId: column.text({ unique: true }), // Unique identifier
    userId: column.text({ references: () => Users.columns.id }),
    providerId: column.text(), // NOT "provider"
    providerAccountId: column.text({ optional: true }), // Optional for some providers
    accessToken: column.text({ optional: true }),
    refreshToken: column.text({ optional: true }),
    accessTokenExpiresAt: column.date({ optional: true }), // NOT "expiresAt"
    tokenType: column.text({ optional: true }),
    scope: column.text({ optional: true }),
    idToken: column.text({ optional: true }),
    sessionState: column.text({ optional: true }),
    createdAt: column.date(),
    updatedAt: column.date(),
  },
});
```

**⚠️ CRITICAL:** Field names like `providerId` (not `provider`) and `accessTokenExpiresAt` (not `expiresAt`) are non-negotiable.

### **2. BetterAuth Configuration**

```typescript
// src/lib/better-auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: Users,
      session: Sessions,
      account: Accounts, // Singular names
      verification: Verifications,
    },
    usePlural: false, // CRITICAL: Must be false
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

### **3. Environment Variables**

**System Environment Variables (NOT .env.local):**

- `GOOGLE_CLIENT_ID=your-client-id-here`
- `GOOGLE_CLIENT_SECRET=your-client-secret-here`

**⚠️ IMPORTANT:** These are set in system environment, not in `.env.local` file.

### **4. Google Cloud Console Configuration**

**Authorized redirect URIs:**

- `http://localhost:4321/api/auth/callback/google`

**Authorized JavaScript origins:**

- `http://localhost:4321`

### **5. API Route Structure**

```typescript
// src/pages/api/auth/[...all].ts - Catch-all route for BetterAuth
export const ALL: APIRoute = async ctx => {
  return auth.handler(ctx.request);
};
```

### **6. Common Issues & Solutions**

#### **Database Schema Errors:**

- **Error:** `The field "providerId" does not exist`
- **Solution:** Use `providerId` not `provider` in Accounts table

- **Error:** `The field "accessTokenExpiresAt" does not exist`
- **Solution:** Use `accessTokenExpiresAt` not `expiresAt`

- **Error:** `NOT NULL constraint failed: Accounts.providerAccountId`
- **Solution:** Make `providerAccountId` optional: `column.text({ optional: true })`

#### **OAuth Errors:**

- **Error:** `redirect_uri_mismatch`
- **Solution:** Ensure exact URI `http://localhost:4321/api/auth/callback/google` is in Google Cloud Console

#### **Schema Changes:**

- **When changing schema:** Use `astro db push --force-reset` to reset database
- **Breaking changes:** Always force reset when changing column types

### **7. File Structure**

```
src/
├── lib/
│   ├── better-auth.ts      # BetterAuth configuration
│   ├── auth-client.ts      # Client-side auth utilities
│   └── types.ts           # Database type definitions
├── pages/
│   ├── api/auth/[...all].ts # Catch-all auth API route
│   └── login.astro         # Login page with Google button
├── actions/
│   ├── login.ts            # Uses auth.api.signInEmail()
│   ├── register.ts         # Uses auth.api.signUpEmail()
│   └── logout.ts           # Uses auth.api.signOut()
└── middleware.ts           # Uses auth.api.getSession()
```

### **8. Testing Google OAuth**

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:4321/login`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Should redirect to home page with successful login

### **9. Key Dependencies**

```json
{
  "better-auth": "^0.x.x",
  "better-auth/adapters/drizzle": "^0.x.x",
  "better-auth/client": "^0.x.x"
}
```

## 🚨 **Critical Notes for Future Development:**

- **NEVER** change field names in database schema without checking BetterAuth documentation
- **ALWAYS** use `usePlural: false` in drizzleAdapter configuration
- **REMEMBER** that Google credentials are in system environment, not .env files
- **TEST** OAuth flow after any schema changes
- **USE** `astro db push --force-reset` for breaking schema changes

---

_Last Updated: September 13, 2025 - After successful Google OAuth implementation_
