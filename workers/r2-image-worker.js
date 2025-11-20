/**
 * Cloudflare Worker for serving images from R2 bucket
 * 
 * This worker should be bound to img.fishtank.news/* route
 * and configured with R2_BUCKET binding to the fishtank-news bucket
 * 
 * Configuration:
 * - Route: img.fishtank.news/*
 * - R2 Binding: R2_BUCKET -> fishtank-news
 * 
 * Usage:
 * Deploy this worker separately from the main Astro application
 * Example: wrangler deploy workers/r2-image-worker.js --name r2-image-worker
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Extract the key from the pathname (remove leading slash)
    const key = url.pathname.slice(1);
    
    // If no key provided, return 404
    if (!key) {
      return new Response("Not found", { status: 404 });
    }
    
    try {
      // Fetch the object from R2
      const object = await env.R2_BUCKET.get(key);
      
      // If object doesn't exist, return 404
      if (!object) {
        return new Response("Not found", { status: 404 });
      }
      
      // Create headers for the response
      const headers = new Headers();
      
      // Write HTTP metadata from R2 object (content-type, etc.)
      object.writeHttpMetadata(headers);
      
      // Add cache control header for optimal performance
      headers.set("Cache-Control", "public, max-age=31536000");
      
      // Add CORS headers to allow cross-origin access
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      
      // Handle OPTIONS requests for CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }
      
      // Return the object body with appropriate headers
      return new Response(object.body, { headers });
    } catch (error) {
      console.error("Error serving R2 object:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }
};
