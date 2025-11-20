import type { APIRoute } from 'astro';
import { getUserByEmail, verifyPassword, createSession, setCookieHeader } from '@/lib/db-utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;

    // Get user from database
    const user = await getUserByEmail(db, email);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if user is approved
    if (user.status === 'pending') {
      return new Response(JSON.stringify({ error: 'Your account is pending admin approval' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.status === 'rejected') {
      return new Response(JSON.stringify({ error: 'Your account registration was rejected' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session
    const sessionId = await createSession(kv, user.id, user.email, user.role);

    // Return success with cookie
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': setCookieHeader('sessionId', sessionId)
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
