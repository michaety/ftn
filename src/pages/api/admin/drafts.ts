import type { APIRoute } from 'astro';
import { getArticles, getSession, getCookie } from '@/lib/db-utils';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const sessionId = getCookie(request, 'sessionId');
    const kv = locals.runtime.env.SESSION;
    const session = await getSession(kv, sessionId);

    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = locals.runtime.env.DB;
    const drafts = await getArticles(db, 'draft');
    return new Response(JSON.stringify({ drafts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get drafts error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
