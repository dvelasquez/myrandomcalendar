import type { APIRoute } from 'astro';
import { createUser, authenticateUser, createSession } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const name = formData.get('name')?.toString();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await createUser(email, password, name);

        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create session
        const sessionResult = await createSession(result.userId);

        if (!sessionResult.success) {
            return new Response(JSON.stringify({ error: 'Failed to create session' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Set session cookie
        const response = new Response(JSON.stringify({ success: true, userId: result.userId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

        response.headers.set('Set-Cookie', `session_token=${sessionResult.token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}`);

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ error: 'Registration failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
