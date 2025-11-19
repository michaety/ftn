import type { APIRoute } from 'astro';
import { deleteSession, deleteCookieHeader, getCookie } from '@/lib/db-utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const sessionId = getCookie(request, 'sessionId');
    
    if (sessionId) {
      const kv = locals.runtime.env.SESSION;
      await deleteSession(kv, sessionId);
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': deleteCookieHeader('sessionId')
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
