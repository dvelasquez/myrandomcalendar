import { randomBytes, createHash } from 'crypto';
import { db, Users, Sessions, eq, and, gt } from 'astro:db';
import type { User, NewUser, Session, NewSession, UserWithoutPassword } from './types';

// Generate a secure random token
function generateToken(): string {
    return randomBytes(32).toString('hex');
}

// Hash a password
function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

// Create a new user
export async function createUser(email: string, password: string, name?: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    const hashedPassword = hashPassword(password);
    const userId = generateToken();

    const newUser: NewUser = {
        id: userId,
        email,
        name: name || null,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await db.insert(Users).values(newUser);
        return { success: true, userId };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'User already exists' };
    }
}

// Authenticate a user
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const hashedPassword = hashPassword(password);

    try {
        const result = await db.select().from(Users).where(
            and(
                eq(Users.email, email),
                eq(Users.passwordHash, hashedPassword)
            )
        ).limit(1);

        if (result.length === 0) {
            return { success: false, error: 'Invalid credentials' };
        }

        const user = result[0];
        return { success: true, user };
    } catch (error) {
        console.error('Error authenticating user:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

// Create a session
export async function createSession(userId: string): Promise<{ success: boolean; sessionId?: string; token?: string; error?: string }> {
    const sessionId = generateToken();
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newSession: NewSession = {
        id: sessionId,
        userId,
        token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        await db.insert(Sessions).values(newSession);
        return { success: true, sessionId, token };
    } catch (error) {
        console.error('Error creating session:', error);
        return { success: false, error: 'Session creation failed' };
    }
}

// Get user from session token
export async function getUserFromToken(token: string): Promise<{ success: boolean; user?: UserWithoutPassword; session?: Session; error?: string }> {
    try {
        const result = await db.select({
            user: Users,
            session: Sessions,
        }).from(Sessions)
            .innerJoin(Users, eq(Sessions.userId, Users.id))
            .where(
                and(
                    eq(Sessions.token, token),
                    gt(Sessions.expiresAt, new Date())
                )
            )
            .limit(1);

        if (result.length === 0) {
            return { success: false, error: 'Invalid or expired session' };
        }

        const { user, session } = result[0];
        // Remove password hash from user object
        const { ...userWithoutPassword } = user;

        return { success: true, user: userWithoutPassword, session };
    } catch (error) {
        console.error('Error getting user from token:', error);
        return { success: false, error: 'Session validation failed' };
    }
}

// Delete a session
export async function deleteSession(token: string): Promise<{ success: boolean; error?: string }> {
    try {
        await db.delete(Sessions).where(eq(Sessions.token, token));
        return { success: true };
    } catch (error) {
        console.error('Error deleting session:', error);
        return { success: false, error: 'Session deletion failed' };
    }
}
