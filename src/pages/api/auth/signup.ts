import type { APIRoute } from 'astro';
import { getInviteByToken, useInvite, createUser, createSession, setCookieHeader } from '@/lib/db-utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const name = formData.get('name')?.toString();
    const token = formData.get('token')?.toString();

    if (!email || !password || !name || !token) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;

    // Verify invite token
    const invite = await getInviteByToken(db, token);
    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if email matches invite
    if (invite.email !== email) {
      return new Response(JSON.stringify({ error: 'Email does not match invite' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create user
    const user = await createUser(db, {
      email,
      password,
      role: 'editor',
      name
    });

    // Mark invite as used
    await useInvite(db, token);

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
      status: 201,
      headers
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
