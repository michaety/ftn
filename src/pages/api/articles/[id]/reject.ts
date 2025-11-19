import type { APIRoute } from 'astro';
import { rejectArticle, getSession, getCookie } from '@/lib/db-utils';

export const POST: APIRoute = async ({ request, params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;
    const id = parseInt(params.id || '0');
    
    // Check authentication and admin role
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const article = await rejectArticle(db, id);
    
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, article }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Reject article error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
