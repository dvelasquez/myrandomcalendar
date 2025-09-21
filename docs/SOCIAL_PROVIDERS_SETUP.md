# Social Providers Setup Guide

This guide explains how to set up additional social authentication providers for MyRandomCalendar.

## Current Authentication Methods

✅ **Email/Password Authentication** - Already configured and working
✅ **Google OAuth** - Already configured and working
🚀 **GitHub OAuth** - Added and ready to configure
🚀 **Discord OAuth** - Added and ready to configure

## Setup Instructions

### 1. GitHub OAuth Setup

1. **Create a GitHub OAuth App:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: MyRandomCalendar
     - **Homepage URL**: `http://localhost:4321` (or your production URL)
     - **Authorization callback URL**: `http://localhost:4321/api/auth/callback/github`

2. **Get Credentials:**
   - Copy the **Client ID** and **Client Secret**
   - Set them as environment variables:
     ```bash
     export GITHUB_CLIENT_ID="your-github-client-id"
     export GITHUB_CLIENT_SECRET="your-github-client-secret"
     ```

### 2. Discord OAuth Setup

1. **Create a Discord Application:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give it a name: "MyRandomCalendar"

2. **Set up OAuth2:**
   - Go to the "OAuth2" section
   - Add redirect URI: `http://localhost:4321/api/auth/callback/discord`
   - Copy the **Client ID** and **Client Secret**

3. **Set Environment Variables:**
   ```bash
   export DISCORD_CLIENT_ID="your-discord-client-id"
   export DISCORD_CLIENT_SECRET="your-discord-client-secret"
   ```

### 3. Additional Providers

BetterAuth supports many more providers. You can easily add them by:

1. **Adding to `better-auth.ts`:**

   ```typescript
   socialProviders: {
     // ... existing providers
     facebook: {
       clientId: process.env.FACEBOOK_CLIENT_ID as string,
       clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
     },
     twitter: {
       clientId: process.env.TWITTER_CLIENT_ID as string,
       clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
     },
     // ... more providers
   }
   ```

2. **Adding handler functions** to `auth-client-browser.ts`

3. **Adding UI buttons** to login and register pages

## Supported Providers

BetterAuth supports these social providers out of the box:

- ✅ Google
- ✅ GitHub
- ✅ Discord
- 🚀 Facebook
- 🚀 Twitter/X
- 🚀 Microsoft
- 🚀 Apple
- 🚀 LinkedIn
- 🚀 Spotify
- 🚀 Twitch
- 🚀 And many more...

## Testing

After setting up the environment variables:

1. **Restart the development server:**

   ```bash
   npm run dev
   ```

2. **Test each authentication method:**
   - Visit `/login` and test email/password login
   - Test Google sign-in (should work immediately)
   - Test GitHub sign-in (after setting up credentials)
   - Test Discord sign-in (after setting up credentials)

## Production Setup

For production deployment:

1. **Update callback URLs** in provider settings to use your production domain
2. **Set environment variables** in your production environment
3. **Update `trustedOrigins`** in `better-auth.ts` to include your production URL

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error:**
   - Ensure callback URLs in provider settings match exactly
   - Check for trailing slashes or http vs https

2. **"Client ID not found" error:**
   - Verify environment variables are set correctly
   - Restart the development server after setting variables

3. **Provider not working:**
   - Check browser console for errors
   - Verify provider credentials are correct
   - Ensure the provider is properly configured in BetterAuth

### Debug Mode:

You can enable debug logging by adding to your environment:

```bash
export BETTER_AUTH_DEBUG=true
```

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate OAuth credentials
- Monitor OAuth usage in provider dashboards
- Use HTTPS in production (required by most OAuth providers)

## Next Steps

Once you have the additional providers set up, you can:

1. **Test all authentication flows**
2. **Customize the UI** further if needed
3. **Add more providers** as required
4. **Implement account linking** to allow users to connect multiple providers to one account
