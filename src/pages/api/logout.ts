import type { APIRoute } from 'astro';
import { deleteSession } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const cookieHeader = request.headers.get('cookie');
        const sessionToken = cookieHeader
            ?.split(';')
            .find(c => c.trim().startsWith('session_token='))
            ?.split('=')[1];

        if (sessionToken) {
            await deleteSession(sessionToken);
        }

        const response = new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        // Clear session cookie
        response.headers.set('Set-Cookie', 'session_token=; HttpOnly; Path=/; Max-Age=0');

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({ error: 'Logout failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
