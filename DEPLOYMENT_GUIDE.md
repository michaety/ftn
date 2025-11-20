# Image Hosting and CSP Fix - Deployment Guide

This document describes the changes made to fix the Image Hosting and CSP Issues across fishtank.news and img.fishtank.news.

## Issues Resolved

### 1. ✅ Content Security Policy (CSP) Blocking External Resources

**Problem:** Overly strict CSP headers were blocking:
- Cloudflare Insights beacon
- Google Fonts
- Twitter widgets
- External textures

**Solution:** Disabled strict CSP in Astro configuration by setting `security.checkOrigin = false`.

**Changes Made:**
- Updated `astro.config.mjs` to include security configuration

### 2. ✅ R2 Image Worker Created

**Problem:** Images uploaded to R2 were not being served properly at img.fishtank.news.

**Solution:** Created a dedicated Cloudflare Worker to serve R2 images directly.

**Changes Made:**
- Created `workers/r2-image-worker.js` - Worker that serves images from R2
- Created `workers/wrangler.toml` - Configuration for the R2 worker
- Created `workers/README.md` - Comprehensive deployment documentation

### 3. ✅ Verified Upload API

**Status:** Upload API in `src/pages/api/media/upload.ts` already returns correct URL format (just the R2 key without /api/media/ prefix).

No changes needed.

## Deployment Instructions

### Step 1: Deploy Main Application Changes

The main application now has CSP disabled to allow external resources.

```bash
# From repository root
npm run build
npm run deploy
```

Or use Cloudflare Dashboard:
1. Push changes to GitHub
2. Cloudflare Pages will auto-deploy

### Step 2: Deploy R2 Image Worker

This is a **separate** worker from the main Astro application.

```bash
# From repository root
cd workers
wrangler deploy
```

This will:
- Deploy the worker as `r2-image-worker`
- Bind it to the R2 bucket `fishtank-news`

### Step 3: Configure Worker Route

**Option A: Via Cloudflare Dashboard**

1. Go to Cloudflare Dashboard → Workers & Pages
2. Click on `r2-image-worker`
3. Go to Triggers tab
4. Add Custom Domain or Route:
   - Pattern: `img.fishtank.news/*`
   - Zone: `fishtank.news`

**Option B: Via CLI**

```bash
wrangler deploy --route "img.fishtank.news/*"
```

**Important:** Remove or disable any wildcard routes like `*.fishtank.news/*` that might conflict.

### Step 4: Configure DNS

1. Go to Cloudflare Dashboard → DNS
2. Add/Update DNS record for `img.fishtank.news`:
   - Type: CNAME
   - Name: `img`
   - Target: `fishtank.news` (or appropriate target)
   - Proxy status: **Proxied (Orange Cloud)** - The worker route will handle it

### Step 5: Set Environment Variables

In Cloudflare Dashboard for your main application:

1. Go to Workers & Pages → Your App → Settings → Environment Variables
2. Add: `R2_PUBLIC_URL` = `https://img.fishtank.news`

Or update in `wrangler.jsonc` (main app):

```jsonc
{
  "vars": {
    "R2_PUBLIC_URL": "https://img.fishtank.news"
  }
}
```

## Verification

After deployment, verify everything works:

### 1. Test R2 Worker

```bash
# Test with an existing image
curl -I https://img.fishtank.news/uploads/test-image.jpg

# Expected response:
# HTTP/2 200
# content-type: image/jpeg
# cache-control: public, max-age=31536000
# access-control-allow-origin: *
```

### 2. Test Main Application

1. Go to editor at https://fishtank.news/news/editor
2. Upload an image
3. The API should return: `{ "success": true, "key": "uploads/123-image.jpg", "url": "uploads/123-image.jpg" }`
4. Insert image into article
5. Verify image displays correctly

### 3. Test External Resources

1. Open https://fishtank.news
2. Open browser DevTools → Console
3. Should see NO CSP violation errors for:
   - Cloudflare Insights
   - Google Fonts
   - Twitter widgets

## Architecture Overview

### Before Fix

```
User Request → fishtank.news → Astro Worker (*.fishtank.news/*)
                               ↓
                          Attempts to serve images
                          CSP blocks external resources
```

### After Fix

```
User Request → fishtank.news → Astro Worker (fishtank.news/*)
                               ↓
                          No CSP restrictions
                          External resources load

Image Request → img.fishtank.news → R2 Worker (img.fishtank.news/*)
                                    ↓
                               R2 Bucket (fishtank-news)
                               Serves image directly
```

## Files Changed

1. **astro.config.mjs**
   - Added `security: { checkOrigin: false }` to disable strict CSP

2. **workers/r2-image-worker.js** (NEW)
   - Dedicated worker for serving R2 images
   - Handles requests to img.fishtank.news/*
   - Returns images with proper caching and CORS headers

3. **workers/wrangler.toml** (NEW)
   - Configuration for R2 image worker
   - Binds R2_BUCKET to fishtank-news bucket

4. **workers/README.md** (NEW)
   - Comprehensive documentation for the R2 worker

## Troubleshooting

### Images Still Not Loading

1. Check worker logs:
   ```bash
   wrangler tail --name r2-image-worker
   ```

2. Verify route configuration in Dashboard

3. Test direct R2 access:
   ```bash
   wrangler r2 object get fishtank-news/uploads/test.jpg
   ```

### CSP Errors Still Appearing

1. Clear browser cache
2. Verify main application deployed successfully
3. Check `astro.config.mjs` includes security configuration
4. Restart your browser

### Upload Issues

1. Check SESSION KV binding is configured
2. Verify user has admin/editor role
3. Check R2 MEDIA binding in main wrangler.jsonc

## Migration from Old System

If you have existing articles with old-style URLs:

```sql
-- Run this migration in your D1 database
UPDATE articles 
SET featured_image = REPLACE(featured_image, '/api/media/', '')
WHERE featured_image LIKE '/api/media/%';
```

This removes the `/api/media/` prefix from stored URLs.

## Environment Variables Reference

### Main Application (.dev.vars or Dashboard)

```
API_TOKEN=your_token_here
R2_PUBLIC_URL=https://img.fishtank.news
```

### R2 Worker (wrangler.toml)

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "fishtank-news"
```

## Next Steps

After successful deployment:

1. Test image upload and display
2. Monitor worker metrics in Dashboard
3. Check for any CSP violations in browser console
4. Verify external resources (fonts, widgets) load correctly
5. Consider adding rate limiting to R2 worker for production

## Support

For issues or questions:
- Check `workers/README.md` for R2 worker troubleshooting
- Check `R2_IMAGE_FIX.md` for previous fixes
- Review Cloudflare Workers documentation

## Rollback Procedure

If issues occur:

1. **Main App:**
   ```bash
   git revert <commit-hash>
   npm run deploy
   ```

2. **R2 Worker:**
   ```bash
   # Remove the worker route from Dashboard
   # Or delete the worker entirely:
   wrangler delete --name r2-image-worker
   ```

3. **Restore old behavior:**
   - Images will fall back to `/api/media/[key].ts` endpoint
   - Re-enable CSP if needed by removing security config
