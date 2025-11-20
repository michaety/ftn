import type { APIRoute } from 'astro';
import { getSession, getCookie, approveUser, rejectUser, getPendingUsers } from '@/lib/db-utils';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const sessionId = getCookie(request, 'sessionId');
    const kv = locals.runtime.env.SESSION;
    const session = await getSession(kv, sessionId);

    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = locals.runtime.env.DB;
    const pendingUsers = await getPendingUsers(db);

    return new Response(JSON.stringify({ users: pendingUsers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const sessionId = getCookie(request, 'sessionId');
    const kv = locals.runtime.env.SESSION;
    const session = await getSession(kv, sessionId);

    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const userId = parseInt(formData.get('userId')?.toString() || '');
    const action = formData.get('action')?.toString();

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = locals.runtime.env.DB;

    let result;
    if (action === 'approve') {
      result = await approveUser(db, userId);
    } else {
      result = await rejectUser(db, userId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      user: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('User approval error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
