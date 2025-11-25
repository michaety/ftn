import type { APIRoute } from 'astro';
import { getArticleById, updateArticle, deleteArticle, getSession, getCookie } from '@/lib/db-utils';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const id = parseInt(params.id || '0');
    
    const article = await getArticleById(db, id);
    
    if (!article) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ article }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get article error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;
    const id = parseInt(params.id || '0');
    
    // Check authentication
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get existing article
    const existingArticle = await getArticleById(db, id);
    if (!existingArticle) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permissions: editors can only edit their own articles
    if (session.userRole === 'editor' && existingArticle.author_id !== session.userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const updates: any = {};
    
    if (formData.has('title')) updates.title = formData.get('title')?.toString();
    if (formData.has('slug')) updates.slug = formData.get('slug')?.toString();
    if (formData.has('content')) updates.content = formData.get('content')?.toString();
    if (formData.has('excerpt')) updates.excerpt = formData.get('excerpt')?.toString();
    if (formData.has('featured_image')) updates.featured_image = formData.get('featured_image')?.toString();
    if (formData.has('status')) {
      const statusInput = formData.get('status')?.toString();
      // Validate status to only allow known values
      const validStatuses = ['draft', 'approved'];
      if (statusInput && validStatuses.includes(statusInput)) {
        updates.status = statusInput;
      }
    }
    if (formData.has('category')) updates.category = formData.get('category')?.toString();

    const article = await updateArticle(db, id, updates);

    return new Response(JSON.stringify({ success: true, article }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update article error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  try {
    const db = locals.runtime.env.DB;
    const kv = locals.runtime.env.SESSION;
    const id = parseInt(params.id || '0');
    
    // Check authentication
    const sessionId = getCookie(request, 'sessionId');
    const session = await getSession(kv, sessionId);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get existing article
    const existingArticle = await getArticleById(db, id);
    if (!existingArticle) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check permissions: editors can only delete their own articles, admins can delete any
    if (session.userRole === 'editor' && existingArticle.author_id !== session.userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteArticle(db, id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete article error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
