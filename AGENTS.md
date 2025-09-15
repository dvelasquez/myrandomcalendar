# Agent Information for MyRandomCalendar

## 🎯 **Project Overview**
A calendar application built with Astro 5, featuring BetterAuth authentication with Google OAuth integration.

## 🛠 **Tech Stack**
- **Astro 5** - Web framework
- **TailwindCSS 4** - Styling
- **React 19** - UI components, pure and functional. Only manage presentational state, NO DATA FETCHING.
- **ESLint 9** - Code linting
- **Astro DB** - Database with Drizzle ORM client (accessible from "astro:db")
- **libsql** - Database provider
- **BetterAuth** - Authentication system (replaces custom auth)
- **Date-FNS** - For handling dates and times. Always prefer using this.

## 🔐 **Authentication Status: WORKING**
- **BetterAuth Migration**: Complete - all custom auth code removed
- **Google OAuth**: Fully functional and tested
- **Email/Password**: Available as alternative
- **Session Management**: Handled by BetterAuth automatically

## 🗄 **Database Schema (CRITICAL)**
The database schema MUST match BetterAuth's exact field names:

```typescript
// CRITICAL: These field names are non-negotiable
const Accounts = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    accountId: column.text({ unique: true }),
    userId: column.text({ references: () => Users.columns.id }),
    providerId: column.text(),                    // NOT "provider"
    providerAccountId: column.text({ optional: true }),
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

## 🔧 **Environment Variables (System Environment)**
```bash
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
BETTER_AUTH_SECRET=your-secret-key-here
```
**⚠️ IMPORTANT**: These are in system environment, NOT in `.env.local` files.

## 📁 **Key File Structure**
```
src/
├── lib/
│   ├── better-auth.ts      # BetterAuth configuration (CRITICAL)
│   ├── auth-client.ts      # Client-side auth utilities
│   └── types.ts           # Database type definitions
├── pages/
│   ├── api/auth/[...all].ts # Catch-all BetterAuth API route
│   └── login.astro         # Login page with Google button
├── actions/
│   ├── login.ts            # Uses auth.api.signInEmail()
│   ├── register.ts         # Uses auth.api.signUpEmail()
│   └── logout.ts           # Uses auth.api.signOut()
└── middleware.ts           # Uses auth.api.getSession()
```

## 🚨 **Critical Configuration**
```typescript
// src/lib/better-auth.ts - MUST have this exact configuration
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET as string,  // CRITICAL: Session encryption
  trustedOrigins: [                                  // CRITICAL: For local development
    "http://localhost:4321",
    "http://randomcalendar-dev.d13z.dev",
    "https://randomcalendar-dev.d13z.dev"
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: Users,
      session: Sessions,
      account: Accounts,      // Singular names
      verification: Verifications,
    },
    usePlural: false,        // CRITICAL: Must be false
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
```

## 🔍 **Common Issues & Quick Fixes**
- **Schema Errors**: Use `npm astro -- db push --force-reset` for breaking changes
- **Field Name Errors**: Check BetterAuth documentation for exact field names
- **OAuth Errors**: Verify Google Cloud Console redirect URI: `http://localhost:4321/api/auth/callback/google`
- **Environment Issues**: Check system environment variables, not .env files
- **Trusted Origins Error**: Add `trustedOrigins` array to BetterAuth config for local development

## 📚 **Documentation Location**
- **`docs/README.md`** - Navigation guide
- **`docs/GOOGLE_OAUTH_SETUP.md`** - Overview and status
- **`docs/BETTERAUTH_DOCUMENTATION.md`** - Detailed technical reference

## ⚡ **Quick Commands**
```bash
npm run dev                    # Start development server
npm run astro -- db push --force-reset    # Reset database schema
npm test -- --run # Run tests without waiting for user input
npm run astro -- check # to check typescript errors in astro and ts files
printenv | grep GOOGLE         # Check Google credentials
```

## Components and Presentation

- Use the **rule of least power**: Privilege use native html elements, then css and finally javascript if is inevitable
- **React components should be Pure**: Data flows in one direction. If something in React needs to make a POST update, it happens on a form.

## 📊 **Data Fetching Architecture (CRITICAL)**

### **Preferred Pattern: Server-Side Data Fetching**
- ✅ **Astro Actions**: Use `defineAction` for all server-side operations
- ✅ **Server-Side Fetching**: Data fetching should happen in `.astro` components
- ✅ **Props Passing**: Pass fetched data as props to React components
- ✅ **No Client-Side Fetching**: Avoid `useEffect` for initial data loading

### **Implementation Pattern**
```typescript
// ✅ CORRECT: Astro page (.astro)
---
import { getScheduleBlocks } from '../actions/schedule-blocks';

// Fetch data server-side
let scheduleBlocks = [];
if (user) {
  scheduleBlocks = await getScheduleBlocks(user.id);
}
---

<ReactComponent 
  initialData={scheduleBlocks}
  client:load
/>
```

```typescript
// ❌ AVOID: React component fetching
const [data, setData] = useState([]);

useEffect(() => {
  // Don't do this for initial data
  fetchData();
}, []);
```

### **Benefits**
- **Performance**: Data available immediately on page load
- **SEO**: Content present in initial HTML
- **UX**: No loading states or empty screens
- **Architecture**: Clean separation of concerns

## 🎯 **Current Status**
- ✅ BetterAuth fully integrated
- ✅ Google OAuth working and tested
- ✅ Database schema aligned
- ✅ All authentication flows functional
- ✅ Server-side data fetching implemented
- ✅ **Background Events System** - Availability visualization with FullCalendar
- ✅ **Pure Function Architecture** - Comprehensive test coverage (91 tests)
- ✅ Documentation complete

---
*Last Updated: September 13, 2025 - After successful BetterAuth + Google OAuth implementation*