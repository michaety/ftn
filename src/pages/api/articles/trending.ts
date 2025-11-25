import type { APIRoute } from 'astro';
import { getTrendingArticles } from '@/lib/db-utils';

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const db = locals.runtime.env.DB;
    const limit = parseInt(url.searchParams.get('limit') || '2');
    
    const articles = await getTrendingArticles(db, limit);

    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get trending articles error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
