import { db, Users, Sessions, Accounts, Verifications } from "astro:db"; 
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET as string,
  trustedOrigins: [
    "http://localhost:4321",
    "https://randomcalendar-dev.d13z.dev"
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: Users,
      session: Sessions,
      account: Accounts,
      verification: Verifications,
    },
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar.readonly"
      ],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      image: {
        type: "string",
        required: false,
      },
    },
  },
});
