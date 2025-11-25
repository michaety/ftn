import type { APIRoute } from 'astro';
import { uploadToR2, getSession, getCookie } from '@/lib/db-utils';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const r2 = locals.runtime.env.MEDIA;
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
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'File is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload to R2
    const key = await uploadToR2(r2, file, file.name);
    
    // Construct the full URL for frontend use
    const r2PublicUrl = locals.runtime.env.R2_PUBLIC_URL;
    let url: string;
    if (r2PublicUrl) {
      // Use the R2 public URL if configured
      const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
      url = `${baseUrl}/${key}`;
    } else {
      // Fallback to the API proxy endpoint
      url = `/api/media/${key}`;
    }

    return new Response(JSON.stringify({ success: true, key, url }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
