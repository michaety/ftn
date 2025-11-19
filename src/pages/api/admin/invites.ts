import type { APIRoute } from 'astro';
import { getAllInvites, createInvite, getSession, getCookie } from '@/lib/db-utils';

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

    const invites = await getAllInvites(db);

    return new Response(JSON.stringify({ invites }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get invites error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
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

    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const invite = await createInvite(db, {
      email,
      createdBy: session.userId,
      expiresInDays: 7
    });

    return new Response(JSON.stringify({ success: true, invite }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create invite error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
