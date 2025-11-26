import type { APIRoute } from 'astro';
import { getSession, getCookie, getTrendingSettings, setTrendingSettings, getArticles } from '@/lib/db-utils';

interface ArticleRecord {
  id: number;
  title: string;
  slug: string;
  [key: string]: unknown;
}

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;
    
    // Check authentication - only admins can access this
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const settings = await getTrendingSettings(db);
    
    // Also get approved articles for the selection UI
    const articles = await getArticles(db, 'approved') as ArticleRecord[];

    return new Response(JSON.stringify({ 
      settings,
      articles: articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get trending settings error:', error);
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
    
    // Check authentication - only admins can access this
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session || session.userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body with error handling for invalid JSON
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { mode, articleIds } = body;

    // Validate mode
    if (mode !== 'automatic' && mode !== 'manual') {
      return new Response(JSON.stringify({ error: 'Invalid mode. Must be "automatic" or "manual"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate articleIds
    if (!Array.isArray(articleIds)) {
      return new Response(JSON.stringify({ error: 'articleIds must be an array' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate articleIds are numbers and limit to 4
    const validArticleIds = articleIds
      .filter((id: unknown) => typeof id === 'number' && Number.isInteger(id) && id > 0)
      .slice(0, 4);

    await setTrendingSettings(db, { mode, articleIds: validArticleIds });

    return new Response(JSON.stringify({ 
      success: true, 
      settings: { mode, articleIds: validArticleIds }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set trending settings error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
