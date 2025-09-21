import { defineMiddleware } from 'astro:middleware';
import { auth } from './features/auth/lib/better-auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = session?.user || null;
  context.locals.session = session?.session || null;

  const { user } = context.locals;
  const { pathname } = context.url;

  // Protect all /app/* routes - require authentication
  if (pathname.startsWith('/app') && !user) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', context.site || context.url.origin);
    loginUrl.searchParams.set('return', pathname);
    return context.redirect(loginUrl.toString());
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/register') && user) {
    return context.redirect('/app/dashboard');
  }

  return next();
});
