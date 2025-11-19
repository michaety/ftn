import type { APIRoute } from 'astro';
import { getAllUsers, getSession, getCookie } from '@/lib/db-utils';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;
    
    // Check authentication and admin role
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const users = await getAllUsers(db);

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
