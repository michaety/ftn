import type { APIRoute } from 'astro';
import { getArticles, createArticle, getSession, getCookie, generateSlug } from '@/lib/db-utils';

export const GET: APIRoute = async ({ request, locals, url }) => {
  try {
    const db = locals.runtime.env.DB;
    const status = url.searchParams.get('status');
    
    const articles = await getArticles(db, status);
    
    return new Response(JSON.stringify({ articles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get articles error:', error);
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
    
    // Check authentication
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session || !['admin', 'editor'].includes(session.userRole)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();
    const excerpt = formData.get('excerpt')?.toString();
    const featured_image = formData.get('featured_image')?.toString();
    const status = formData.get('status')?.toString() || 'approved';
    const category = formData.get('category')?.toString();

    if (!title || !content) {
      return new Response(JSON.stringify({ error: 'Title and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!category) {
      return new Response(JSON.stringify({ error: 'Category is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const slug = generateSlug(title);
    
    const article = await createArticle(db, {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      author_id: session.userId,
      status,
      category
    });

    return new Response(JSON.stringify({ success: true, article }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create article error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
