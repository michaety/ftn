# R2 Image Display Fix Documentation

## Latest Update - Legacy URL Handling Fix

**Issue:** Images stored with legacy `/api/media/` prefix in the database were creating malformed URLs when R2_PUBLIC_URL was configured.

**Example:**
- Database value: `/api/media/uploads/1763615180856-GuiLaEsWsAA-uDd.jpg`
- With R2_PUBLIC_URL: `https://img.fishtank.news`
- Old behavior: `https://img.fishtank.news/api/media/uploads/1763615180856-GuiLaEsWsAA-uDd.jpg` ❌
- New behavior: `https://img.fishtank.news/uploads/1763615180856-GuiLaEsWsAA-uDd.jpg` ✅

**Solution:** Enhanced `getImageUrl()` function to detect and strip `/api/media/` prefix from legacy URLs before constructing the final URL.

---

## Problem Summary

Images stored in Cloudflare R2 public bucket were loading correctly when accessed directly at URLs like:
```
https://img.fishtank.news/uploads/1763615090211-GuiLaEsWsAA-uDd.jpg
```

However, they were **not displaying** when embedded on the main fishtank.news website.

## Root Causes Identified

### 1. Inconsistent URL Storage
- **Issue**: The upload API (`/api/media/upload.ts`) was returning URLs like `/api/media/uploads/filename.jpg` 
- **Problem**: When stored in the database and later used with `R2_PUBLIC_URL`, it created malformed URLs like `https://img.fishtank.news//api/media/uploads/...`

### 2. Inconsistent URL Construction
- **Issue**: Each page had its own URL construction logic with variations in handling
- **Problem**: Led to maintenance issues and potential bugs across different pages

### 3. Missing CSP Configuration
- **Issue**: No Content-Security-Policy headers to explicitly allow images from `img.fishtank.news`
- **Problem**: Some browsers might block images from external domains without proper CSP

### 4. Undocumented Environment Variable
- **Issue**: `R2_PUBLIC_URL` was used but not documented
- **Problem**: Developers might not know to set this variable in production

## Solution Implemented

### 1. Fixed Upload API (`src/pages/api/media/upload.ts`)
**Before:**
```typescript
const url = `/api/media/${encodeURIComponent(key)}`;
```

**After:**
```typescript
// Return the R2 key (e.g., "uploads/123-image.jpg") 
// Frontend will construct the full URL using R2_PUBLIC_URL or /api/media/ fallback
const url = key;
```

### 2. Created Helper Function (`src/lib/db-utils.ts`)
Added `getImageUrl()` function with consistent logic:

```typescript
export function getImageUrl(imageKey: string | null | undefined, r2PublicUrl: string = ''): string | null {
  // Returns null for null/undefined input
  if (!imageKey) return null;
  
  // Pass through full URLs unchanged
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey;
  }
  
  // Handle legacy URLs that start with /api/media/ - extract just the R2 key
  let cleanKey = imageKey;
  if (cleanKey.startsWith('/api/media/')) {
    cleanKey = cleanKey.substring('/api/media/'.length);
  } else if (cleanKey.startsWith('api/media/')) {
    cleanKey = cleanKey.substring('api/media/'.length);
  }
  
  // Production: Use R2 public URL
  if (r2PublicUrl) {
    const key = cleanKey.startsWith('/') ? cleanKey.substring(1) : cleanKey;
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    return `${baseUrl}/${key}`;
  }
  
  // Development: Proxy through /api/media/
  const key = cleanKey.startsWith('uploads/') ? cleanKey : `uploads/${cleanKey}`;
  return `/api/media/${key}`;
}
```

**Update (Latest Fix):** The function now properly handles legacy URLs that include the `/api/media/` prefix. This prevents malformed URLs like `https://img.fishtank.news/api/media/uploads/...` from being constructed.

### 3. Updated All Display Pages
Modified these files to use the helper function consistently:
- `src/components/news/NewsArticleCard.astro`
- `src/pages/news/articles/[slug].astro`
- `src/pages/news/editor.astro`
- `src/pages/news/admin.astro`
- `src/pages/[slug].astro`
- `src/pages/article/[slug].astro`

**Pattern used:**
```typescript
import { getImageUrl } from '@/lib/db-utils';

// In component
const imageUrl = getImageUrl(article.featured_image, r2PublicUrl);
```

### 4. Added CSP Headers (`src/layouts/NewsLayout.astro`)
```html
<meta http-equiv="Content-Security-Policy" 
      content="img-src 'self' https://img.fishtank.news https://*.twimg.com https://pbs.twimg.com data: blob:; 
               default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://platform.twitter.com; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self'; 
               font-src 'self' data:; 
               frame-src https://platform.twitter.com https://twitter.com https://x.com;" />
```

### 5. Documented Environment Variable (`.dev.vars.example`)
```
API_TOKEN=your_token_here
R2_PUBLIC_URL=https://img.fishtank.news
```

## Configuration Required

### For Production (Cloudflare Workers)
Set the environment variable in Cloudflare Workers dashboard:
```
R2_PUBLIC_URL=https://img.fishtank.news
```

### For Local Development
Create `.dev.vars` file:
```
API_TOKEN=your_token_here
R2_PUBLIC_URL=https://img.fishtank.news
```

Or leave `R2_PUBLIC_URL` unset to use local proxy mode.

## How It Works

### With R2_PUBLIC_URL Set (Production)
1. Image uploaded → stored as `uploads/1234567890-image.jpg` in R2
2. Key returned to frontend and stored in database
3. When displaying: `getImageUrl('uploads/1234567890-image.jpg', 'https://img.fishtank.news')`
4. Result: `https://img.fishtank.news/uploads/1234567890-image.jpg`

### Without R2_PUBLIC_URL (Local Dev)
1. Image uploaded → stored as `uploads/1234567890-image.jpg` in R2
2. Key returned to frontend and stored in database
3. When displaying: `getImageUrl('uploads/1234567890-image.jpg', '')`
4. Result: `/api/media/uploads/1234567890-image.jpg`
5. Request proxied through `/api/media/[key].ts` endpoint

## Testing

All test cases passed:
- ✓ Full HTTPS URL passed through unchanged
- ✓ R2 key with R2_PUBLIC_URL produces correct URL
- ✓ R2 key without R2_PUBLIC_URL falls back to /api/media/
- ✓ R2 key with leading slash handled correctly
- ✓ Null/undefined input returns null
- ✓ R2_PUBLIC_URL with trailing slash normalized correctly

## DNS Configuration Required

For `img.fishtank.news` to work:
1. DNS record for `img.fishtank.news` should be **DNS Only** (grey cloud)
2. Should point directly to R2 bucket public URL
3. **No Worker** should be bound to `img.fishtank.news/*` route

## Verification Steps

After deploying:
1. Upload a new image through the editor
2. Create/edit an article with the uploaded image
3. Verify image displays correctly on article page
4. Check browser DevTools Network tab - image should load from `img.fishtank.news`
5. No CSP errors in browser console
6. Direct URL access should also work: `https://img.fishtank.news/uploads/[filename]`

## Migration Notes

### For Existing Articles
Articles with old-style URLs (e.g., `/api/media/uploads/...`) will still work because:
1. The `getImageUrl()` function doesn't recognize them as full URLs
2. They'll be treated as relative paths and processed accordingly

For a complete migration, run a database update:
```sql
UPDATE articles 
SET featured_image = REPLACE(featured_image, '/api/media/', '')
WHERE featured_image LIKE '/api/media/%';
```

## Troubleshooting

### Images still not loading?
1. Verify `R2_PUBLIC_URL` is set in production environment
2. Check DNS record for `img.fishtank.news` is DNS Only (not proxied)
3. Verify no Worker route is bound to `img.fishtank.news/*`
4. Check browser console for CSP errors
5. Test direct URL: `https://img.fishtank.news/uploads/[your-file]`

### Mixed content errors?
- Ensure `R2_PUBLIC_URL` uses `https://` not `http://`

### CORS errors?
- Should not occur for public R2 bucket
- Verify bucket has public access enabled
- DNS should be DNS Only, not proxied through Cloudflare Worker
