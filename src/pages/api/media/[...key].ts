import type { APIRoute } from 'astro';
import { getFromR2 } from '@/lib/db-utils';

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const r2 = locals.runtime.env.MEDIA;
    const key = params.key;
    
    if (!key) {
      return new Response('Not found', { status: 404 });
    }

    const object = await getFromR2(r2, key);
    
    if (!object) {
      return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Get media error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
