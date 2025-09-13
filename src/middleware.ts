import { getUserFromToken } from './lib/auth';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
    const cookieHeader = context.request.headers.get('cookie');
    const sessionToken = cookieHeader
        ?.split(';')
        .find(c => c.trim().startsWith('session_token='))
        ?.split('=')[1];

    if (sessionToken) {
        const result = await getUserFromToken(sessionToken);
        if (result.success) {
            context.locals.user = result.user!;
            context.locals.session = result.session!;
        } else {
            context.locals.user = null;
            context.locals.session = null;
        }
    } else {
        context.locals.user = null;
        context.locals.session = null;
    }

    return next();
});
