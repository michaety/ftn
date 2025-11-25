// Utility functions for database operations, KV sessions, and R2 uploads
import bcrypt from 'bcryptjs';

// ============== Database Utilities ==============

export async function getUserByEmail(db: any, email: string) {
  const result = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  return result;
}

export async function getUserById(db: any, id: number) {
  const result = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return result;
}

export async function createUser(db: any, { email, password, role, name, authorHandle, status = 'approved' }: { 
  email: string; 
  password: string; 
  role: string; 
  name: string;
  authorHandle?: string;
  status?: string;
}) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.prepare(
    'INSERT INTO users (email, password_hash, role, name, author_handle, status) VALUES (?, ?, ?, ?, ?, ?) RETURNING *'
  ).bind(email, passwordHash, role, name, authorHandle || null, status).first();
  return result;
}

export async function getAllUsers(db: any) {
  const result = await db.prepare('SELECT id, email, role, name, author_handle, status, created_at FROM users ORDER BY created_at DESC').all();
  return result.results || [];
}

export async function getPendingUsers(db: any) {
  const result = await db.prepare('SELECT id, email, role, name, author_handle, status, created_at FROM users WHERE status = ? ORDER BY created_at DESC')
    .bind('pending').all();
  return result.results || [];
}

export async function approveUser(db: any, userId: number) {
  const result = await db.prepare('UPDATE users SET status = ? WHERE id = ? RETURNING *')
    .bind('approved', userId).first();
  return result;
}

export async function rejectUser(db: any, userId: number) {
  const result = await db.prepare('UPDATE users SET status = ? WHERE id = ? RETURNING *')
    .bind('rejected', userId).first();
  return result;
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}

// ============== Article Utilities ==============

export async function getArticles(db: any, status: string | null = null) {
  let query = 'SELECT a.*, u.name as author_name, u.email as author_email, u.author_handle FROM articles a LEFT JOIN users u ON a.author_id = u.id';
  const params: any[] = [];
  
  if (status) {
    query += ' WHERE a.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY a.created_at DESC';
  
  let stmt = db.prepare(query);
  if (params.length > 0) {
    stmt = stmt.bind(...params);
  }
  
  const result = await stmt.all();
  return result.results || [];
}

export async function getArticleById(db: any, id: number) {
  const result = await db.prepare(
    'SELECT a.*, u.name as author_name, u.email as author_email, u.author_handle FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?'
  ).bind(id).first();
  return result;
}

export async function getArticleBySlug(db: any, slug: string) {
  const result = await db.prepare(
    'SELECT a.*, u.name as author_name, u.email as author_email, u.author_handle FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.slug = ?'
  ).bind(slug).first();
  return result;
}

export async function getArticlesByAuthor(db: any, authorId: number) {
  const result = await db.prepare(
    'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC'
  ).bind(authorId).all();
  return result.results || [];
}

export async function createArticle(db: any, data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: number;
  status?: string;
  category?: string;
}) {
  const { title, slug, content, excerpt, featured_image, author_id, status = 'approved', category } = data;
  // Note: The template literal only interpolates SQL constants (CURRENT_TIMESTAMP or NULL), 
  // not user input. The status value is passed through .bind() as a parameterized value.
  // Additionally, the API validates status to only accept 'draft' or 'approved'.
  const result = await db.prepare(
    `INSERT INTO articles (title, slug, content, excerpt, featured_image, author_id, status, category, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${status === 'approved' ? 'CURRENT_TIMESTAMP' : 'NULL'}) RETURNING *`
  ).bind(title, slug, content, excerpt || null, featured_image || null, author_id, status, category || null).first();
  return result;
}

export async function updateArticle(db: any, id: number, data: {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  status?: string;
  category?: string;
}) {
  const { title, slug, content, excerpt, featured_image, status, category } = data;
  const updates: string[] = [];
  const params: any[] = [];
  
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
  if (content !== undefined) { updates.push('content = ?'); params.push(content); }
  if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
  if (featured_image !== undefined) { updates.push('featured_image = ?'); params.push(featured_image); }
  if (status !== undefined) { 
    updates.push('status = ?'); 
    params.push(status);
    // Set published_at when status changes to approved
    if (status === 'approved') {
      updates.push('published_at = CURRENT_TIMESTAMP');
    }
  }
  if (category !== undefined) { updates.push('category = ?'); params.push(category); }
  
  params.push(id);
  
  const result = await db.prepare(
    `UPDATE articles SET ${updates.join(', ')} WHERE id = ? RETURNING *`
  ).bind(...params).first();
  return result;
}

export async function deleteArticle(db: any, id: number) {
  await db.prepare('DELETE FROM articles WHERE id = ?').bind(id).run();
  return true;
}

export async function approveArticle(db: any, id: number) {
  const result = await db.prepare(
    'UPDATE articles SET status = ?, published_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
  ).bind('approved', id).first();
  return result;
}

export async function rejectArticle(db: any, id: number) {
  const result = await db.prepare(
    'UPDATE articles SET status = ? WHERE id = ? RETURNING *'
  ).bind('rejected', id).first();
  return result;
}

export async function incrementArticleViews(db: any, id: number) {
  const result = await db.prepare(
    'UPDATE articles SET view_count = view_count + 1 WHERE id = ? RETURNING *'
  ).bind(id).first();
  return result;
}

export async function getTrendingArticles(db: any, limit: number = 2) {
  // Check if manual mode is enabled
  const settings = await getTrendingSettings(db);
  
  if (settings.mode === 'manual' && settings.articleIds.length > 0) {
    // Use manually selected articles
    const placeholders = settings.articleIds.map(() => '?').join(',');
    const result = await db.prepare(
      `SELECT a.*, u.name as author_name, u.email as author_email, u.author_handle 
       FROM articles a 
       LEFT JOIN users u ON a.author_id = u.id 
       WHERE a.id IN (${placeholders}) AND a.status = ?
       ORDER BY CASE ${settings.articleIds.map((id: number, idx: number) => `WHEN a.id = ${id} THEN ${idx}`).join(' ')} END
       LIMIT ?`
    ).bind(...settings.articleIds, 'approved', limit).all();
    return result.results || [];
  }
  
  // Default to automatic mode (by view count)
  const result = await db.prepare(
    'SELECT a.*, u.name as author_name, u.email as author_email, u.author_handle FROM articles a LEFT JOIN users u ON a.author_id = u.id WHERE a.status = ? ORDER BY a.view_count DESC LIMIT ?'
  ).bind('approved', limit).all();
  return result.results || [];
}

// ============== Site Settings Utilities ==============

export async function getSiteSetting(db: any, key: string): Promise<string | null> {
  const result = await db.prepare(
    'SELECT setting_value FROM site_settings WHERE setting_key = ?'
  ).bind(key).first();
  return result?.setting_value || null;
}

export async function setSiteSetting(db: any, key: string, value: string): Promise<void> {
  await db.prepare(
    'INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP'
  ).bind(key, value).run();
}

export async function getTrendingSettings(db: any): Promise<{ mode: 'automatic' | 'manual'; articleIds: number[] }> {
  const mode = await getSiteSetting(db, 'trending_mode');
  const articleIdsStr = await getSiteSetting(db, 'trending_manual_articles');
  
  let articleIds: number[] = [];
  if (articleIdsStr) {
    try {
      articleIds = JSON.parse(articleIdsStr);
    } catch (e) {
      articleIds = [];
    }
  }
  
  return {
    mode: (mode === 'manual' ? 'manual' : 'automatic') as 'automatic' | 'manual',
    articleIds
  };
}

export async function setTrendingSettings(db: any, settings: { mode: 'automatic' | 'manual'; articleIds: number[] }): Promise<void> {
  await setSiteSetting(db, 'trending_mode', settings.mode);
  await setSiteSetting(db, 'trending_manual_articles', JSON.stringify(settings.articleIds));
}

// ============== Invite Utilities ==============

export async function createInvite(db: any, { email, createdBy, expiresInDays = 7 }: {
  email: string;
  createdBy: number;
  expiresInDays?: number;
}) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  const result = await db.prepare(
    'INSERT INTO invites (email, token, created_by, expires_at) VALUES (?, ?, ?, ?) RETURNING *'
  ).bind(email, token, createdBy, expiresAt.toISOString()).first();
  return result;
}

export async function getInviteByToken(db: any, token: string) {
  const result = await db.prepare(
    'SELECT * FROM invites WHERE token = ? AND used = 0 AND expires_at > datetime("now")'
  ).bind(token).first();
  return result;
}

export async function useInvite(db: any, token: string) {
  const result = await db.prepare(
    'UPDATE invites SET used = 1, used_at = CURRENT_TIMESTAMP WHERE token = ? RETURNING *'
  ).bind(token).first();
  return result;
}

export async function getAllInvites(db: any) {
  const result = await db.prepare(
    'SELECT i.*, u.name as created_by_name FROM invites i LEFT JOIN users u ON i.created_by = u.id ORDER BY i.created_at DESC'
  ).all();
  return result.results || [];
}

// ============== KV Session Management ==============

export async function createSession(kv: any, userId: number, userEmail: string, userRole: string) {
  const sessionId = generateToken();
  const sessionData = {
    userId,
    userEmail,
    userRole,
    createdAt: Date.now()
  };
  
  // Store session in KV with 7 days expiration
  await kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
    expirationTtl: 60 * 60 * 24 * 7 // 7 days
  });
  
  return sessionId;
}

export async function getSession(kv: any, sessionId: string | null) {
  if (!sessionId) return null;
  
  const sessionData = await kv.get(`session:${sessionId}`, 'json');
  return sessionData;
}

export async function deleteSession(kv: any, sessionId: string | null) {
  if (!sessionId) return;
  await kv.delete(`session:${sessionId}`);
}

export async function refreshSession(kv: any, sessionId: string) {
  const session = await getSession(kv, sessionId);
  if (!session) return null;
  
  // Refresh by re-setting with new expiration
  await kv.put(`session:${sessionId}`, JSON.stringify(session), {
    expirationTtl: 60 * 60 * 24 * 7 // 7 days
  });
  
  return session;
}

// ============== R2 Upload Utilities ==============

export async function uploadToR2(r2: any, file: File, filename: string) {
  const buffer = await file.arrayBuffer();
  const key = `uploads/${Date.now()}-${filename}`;
  
  await r2.put(key, buffer, {
    httpMetadata: {
      contentType: file.type
    }
  });
  
  return key;
}

export async function getFromR2(r2: any, key: string) {
  const object = await r2.get(key);
  return object;
}

export async function deleteFromR2(r2: any, key: string) {
  await r2.delete(key);
  return true;
}

export async function getR2Url(key: string) {
  // For production, you'd want to use a custom domain or Cloudflare R2 public URL
  return `/api/media/${key}`;
}

/**
 * Constructs the proper image URL for display
 * @param imageKey - The R2 key or full URL stored in the database
 * @param r2PublicUrl - The R2_PUBLIC_URL environment variable (e.g., https://img.fishtank.news)
 * @returns The full URL to use in img src attributes
 */
export function getImageUrl(imageKey: string | null | undefined, r2PublicUrl: string = ''): string | null {
  if (!imageKey) return null;
  
  // If it's already a full URL (starts with http:// or https://), return as-is
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
  
  // If R2_PUBLIC_URL is configured, use it with the R2 key
  if (r2PublicUrl) {
    // Remove leading slash from cleanKey if present
    const key = cleanKey.startsWith('/') ? cleanKey.substring(1) : cleanKey;
    // Ensure r2PublicUrl doesn't end with slash
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl.slice(0, -1) : r2PublicUrl;
    return `${baseUrl}/${key}`;
  }
  
  // Fallback to proxying through /api/media/ for local development
  // Remove 'uploads/' prefix if present since /api/media/ expects the full key
  const key = cleanKey.startsWith('uploads/') ? cleanKey : `uploads/${cleanKey}`;
  return `/api/media/${key}`;
}

// ============== Helper Functions ==============

export function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  return cookie ? cookie.split('=')[1] : null;
}

export function setCookieHeader(name: string, value: string, options: {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  path?: string;
} = {}) {
  const {
    maxAge = 60 * 60 * 24 * 7, // 7 days
    httpOnly = true,
    secure = true,
    sameSite = 'Lax',
    path = '/'
  } = options;
  
  let cookie = `${name}=${value}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  if (httpOnly) cookie += '; HttpOnly';
  if (secure) cookie += '; Secure';
  
  return cookie;
}

export function deleteCookieHeader(name: string) {
  return `${name}=; Path=/; Max-Age=0`;
}
