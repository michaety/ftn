# R2 Image Worker

This directory contains the Cloudflare Worker that serves images directly from the R2 bucket at `img.fishtank.news`.

## Overview

The R2 Image Worker is a dedicated worker that:
- Serves images from the R2 bucket without going through the main Astro application
- Provides optimal caching with 1-year cache control headers
- Handles CORS for cross-origin image access
- Returns appropriate content-type headers from R2 metadata

## Deployment

### Prerequisites

1. Cloudflare account with R2 enabled
2. R2 bucket named `fishtank-news` (or update `wrangler.toml` with your bucket name)
3. Wrangler CLI installed (`npm install -g wrangler`)

### Steps

1. **Deploy the worker:**
   ```bash
   cd workers
   wrangler deploy
   ```

2. **Configure the route in Cloudflare Dashboard:**
   - Go to your Worker in the Cloudflare Dashboard
   - Add route: `img.fishtank.news/*`
   - Make sure this route is NOT proxied through the main Astro worker

   **OR via CLI:**
   ```bash
   wrangler deploy --route "img.fishtank.news/*"
   ```

3. **Verify the binding:**
   - Ensure the R2_BUCKET binding is correctly configured
   - The bucket should be `fishtank-news` (or your bucket name)

### DNS Configuration

For `img.fishtank.news` to work:

1. Add a DNS CNAME or A record for `img.fishtank.news`
2. Set it to **DNS Only** (grey cloud) in Cloudflare
3. The worker route will handle requests to this subdomain

**Note:** If using Cloudflare's orange cloud (proxied), the worker route will intercept requests.

## Testing

After deployment, test the worker:

```bash
# Test with an existing image in your R2 bucket
curl -I https://img.fishtank.news/uploads/test-image.jpg

# Should return:
# - HTTP 200 OK (if image exists)
# - Content-Type: image/jpeg (or appropriate type)
# - Cache-Control: public, max-age=31536000
# - Access-Control-Allow-Origin: *
```

## Configuration

### Bucket Name

If your R2 bucket has a different name, update `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "your-bucket-name"  # Change this
```

### Preview/Development

For local development or preview environments:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "fishtank-news"
preview_bucket_name = "fishtank-news-preview"  # Uncomment and set
```

## How It Works

1. User requests `https://img.fishtank.news/uploads/image.jpg`
2. Request hits the R2 Image Worker (via route configuration)
3. Worker extracts key: `uploads/image.jpg`
4. Worker fetches object from R2 bucket using `env.R2_BUCKET.get(key)`
5. Worker returns image with appropriate headers
6. Browser caches image for 1 year

## Integration with Main Application

The main Astro application uses the `R2_PUBLIC_URL` environment variable to construct image URLs:

```typescript
// In main application's .dev.vars or environment
R2_PUBLIC_URL=https://img.fishtank.news
```

When uploading images:
```typescript
// Upload returns just the R2 key
const key = "uploads/1234567890-image.jpg"

// Application constructs full URL
const imageUrl = `${R2_PUBLIC_URL}/${key}`
// Result: https://img.fishtank.news/uploads/1234567890-image.jpg
```

## Troubleshooting

### Images not loading

1. **Check worker deployment:**
   ```bash
   wrangler tail --name r2-image-worker
   ```
   Then request an image and see if logs appear.

2. **Verify route:**
   - Check Cloudflare Dashboard → Workers & Pages → r2-image-worker → Triggers
   - Ensure `img.fishtank.news/*` route is listed

3. **Check R2 binding:**
   ```bash
   wrangler r2 bucket list
   ```
   Verify `fishtank-news` bucket exists

4. **Test direct R2 access:**
   ```bash
   wrangler r2 object get fishtank-news/uploads/test.jpg
   ```

### 404 Errors

- Verify the file exists in R2:
  ```bash
  wrangler r2 object list fishtank-news --prefix=uploads/
  ```
- Check the key matches exactly (case-sensitive)

### CORS Issues

The worker includes CORS headers by default:
```javascript
headers.set("Access-Control-Allow-Origin", "*");
```

To restrict to specific origins, modify `r2-image-worker.js`:
```javascript
headers.set("Access-Control-Allow-Origin", "https://fishtank.news");
```

## Related Documentation

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Main Application R2_IMAGE_FIX.md](../R2_IMAGE_FIX.md)

## Maintenance

### Updating the Worker

1. Make changes to `r2-image-worker.js`
2. Deploy: `wrangler deploy`
3. Changes take effect immediately

### Monitoring

View logs in real-time:
```bash
wrangler tail --name r2-image-worker
```

Check usage in Cloudflare Dashboard:
- Workers & Pages → r2-image-worker → Metrics

## Security Considerations

1. **Public Access:** This worker serves all files in the R2 bucket publicly
2. **Authentication:** No authentication is implemented - suitable for public images only
3. **Rate Limiting:** Consider adding rate limiting for production use
4. **Path Traversal:** The worker uses R2 key as-is - R2 prevents path traversal

For private images, implement authentication in the worker before serving files.
