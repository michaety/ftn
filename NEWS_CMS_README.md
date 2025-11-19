# Fishtank News CMS - Deployment Guide

A fully functional serverless news CMS built with Cloudflare Workers, D1, KV, R2, and Astro. Features admin/editor workflows, Markdown editing, and a brutalist design.

## 🏗️ Architecture

- **Frontend**: Astro (Server-Side Rendered)
- **Database**: Cloudflare D1 (SQLite)
- **Session Storage**: Cloudflare KV
- **Media Storage**: Cloudflare R2
- **Hosting**: Cloudflare Workers
- **Auth**: Session-based with bcrypt password hashing

## 📋 Prerequisites

1. A Cloudflare account
2. Node.js 18+ installed
3. Wrangler CLI installed (`npm install -g wrangler`)

## 🚀 Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ftn
npm install
```

### 2. Create Cloudflare Resources

#### Create D1 Database

```bash
npx wrangler d1 create ftn-db
```

Copy the `database_id` from the output and update it in `wrangler.jsonc`:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "ftn-db",
    "database_id": "YOUR_DATABASE_ID_HERE"
  }
]
```

#### Create KV Namespace (Required for Sessions)

**IMPORTANT**: You must create a KV namespace before deploying. The placeholder IDs in `wrangler.jsonc` will cause deployment to fail.

```bash
# Production KV namespace
npx wrangler kv:namespace create SESSION

# Preview KV namespace (for local development)
npx wrangler kv:namespace create SESSION --preview
```

The commands will output IDs like this:
```
🌀 Creating namespace with title "ftn-SESSION"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "SESSION", id = "abc123def456..." }
```

**Copy both IDs** and update `wrangler.jsonc`:

```json
"kv_namespaces": [
  {
    "binding": "SESSION",
    "id": "abc123def456...",           // ID from production command
    "preview_id": "xyz789ghi012..."    // ID from preview command
  }
]
```

⚠️ **Without valid KV namespace IDs, deployment will fail with error:**
```
KV namespace 'placeholder-kv-id' is not valid. [code: 10042]
```

#### Create R2 Bucket

```bash
# Production
npx wrangler r2 bucket create ft-r2

# Preview (optional, for local development)
npx wrangler r2 bucket create ft-r2-preview
```

Update `wrangler.jsonc`:

```json
"r2_buckets": [
  {
    "binding": "MEDIA",
    "bucket_name": "ft-r2",
    "preview_bucket_name": "ft-r2-preview"
  }
]
```

### 3. Run Database Migrations

```bash
# Local development
npm run db:migrate

# Production (after first deployment)
npm run db:migrate:remote
```

### 4. Build the Application

```bash
npm run build
```

## 🔐 Default Admin Credentials

The first migration creates a default admin account:

- **Email**: `admin@fishtank.news`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after your first login!

## 🌐 Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

This will:
1. Build the Astro application
2. Create the worker wrapper
3. Deploy to Cloudflare Workers

After deployment, run the remote migration:

```bash
npm run db:migrate:remote
```

### Configure Custom Domains (Optional)

In your Cloudflare Dashboard:

1. Go to Workers & Pages → Your Worker
2. Click on "Triggers" tab
3. Add custom domains:
   - `fishtank.news` (public site)
   - `admin.fishtank.news` (admin dashboard)
   - `editor.fishtank.news` (editor dashboard)

## 🏃 Local Development

```bash
npm run dev
```

This will:
1. Run local database migrations
2. Build the application
3. Start Wrangler dev server on port 4321

Access the application at `http://localhost:4321`

## 📁 Project Structure

```
ftn/
├── migrations/           # D1 database migrations
│   ├── 0004_create_users.sql
│   ├── 0005_create_articles.sql
│   └── 0006_create_invites.sql
├── src/
│   ├── components/
│   │   └── news/        # React components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── ArticleCard.tsx
│   │       └── MarkdownEditor.tsx
│   ├── lib/
│   │   └── db-utils.ts  # Database & utility functions
│   ├── pages/
│   │   ├── api/         # API endpoints
│   │   │   ├── auth/    # Authentication
│   │   │   ├── articles/ # Article CRUD
│   │   │   ├── admin/   # Admin endpoints
│   │   │   └── media/   # R2 media upload/serve
│   │   ├── news/        # Public & dashboard pages
│   │   │   ├── index.astro      # Public homepage
│   │   │   ├── admin.astro      # Admin dashboard
│   │   │   ├── editor.astro     # Editor dashboard
│   │   │   ├── editor/new.astro # Create article
│   │   │   └── articles/[slug].astro # Article detail
│   │   └── login.astro  # Login page
│   ├── styles/
│   │   └── news.css     # Brutalist styling
│   └── workflows/       # Cloudflare Workflows
└── wrangler.jsonc       # Cloudflare configuration
```

## 🎨 Features

### Admin Features
- ✅ Approve/reject pending articles
- ✅ Manage users and roles
- ✅ Send editor invites
- ✅ View all articles by status

### Editor Features
- ✅ Create articles with Markdown editor
- ✅ Upload images to R2
- ✅ Submit articles for review
- ✅ Edit/delete own articles
- ✅ Track article status (draft, pending, approved, rejected)

### Public Features
- ✅ Browse approved articles
- ✅ Read full articles with Markdown rendering
- ✅ Responsive brutalist design
- ✅ Image display from R2

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/signup` - Signup (invite-only)

### Articles
- `GET /api/articles?status=<status>` - List articles
- `GET /api/articles/[id]` - Get article by ID
- `POST /api/articles` - Create article
- `PUT /api/articles/[id]` - Update article
- `DELETE /api/articles/[id]` - Delete article
- `POST /api/articles/[id]/approve` - Approve article (admin only)
- `POST /api/articles/[id]/reject` - Reject article (admin only)

### Admin
- `GET /api/admin/users` - List users (admin only)
- `GET /api/admin/invites` - List invites (admin only)
- `POST /api/admin/invites` - Create invite (admin only)

### Media
- `POST /api/media/upload` - Upload file to R2
- `GET /api/media/[key]` - Retrieve file from R2

## 🎭 User Workflows

### Admin Workflow
1. Login at `/login`
2. Navigate to `/news/admin`
3. Review pending articles
4. Approve or reject articles
5. Manage invites at `/news/admin/invites` (to be implemented)

### Editor Workflow
1. Receive invite email with token
2. Signup at `/signup?token=<invite_token>` (to be implemented)
3. Login at `/login`
4. Navigate to `/news/editor`
5. Create new article at `/news/editor/new`
6. Write in Markdown, upload images
7. Submit for review (status: pending)
8. Admin approves → article goes live

### Public User
1. Visit `/news`
2. Browse approved articles
3. Click to read full article at `/news/articles/[slug]`

## 🔒 Security

- Passwords hashed with bcrypt (10 rounds)
- Session-based authentication stored in KV
- Role-based access control (admin, editor)
- HTTPS enforced by Cloudflare
- HttpOnly cookies for session management

## 🐛 Troubleshooting

### KV Namespace Errors

**Error: `KV namespace 'placeholder-kv-id' is not valid. [code: 10042]`**

This means you haven't created a KV namespace or updated `wrangler.jsonc` with the actual IDs.

```bash
# Create the KV namespaces
npx wrangler kv:namespace create SESSION
npx wrangler kv:namespace create SESSION --preview

# Update wrangler.jsonc with the IDs returned from the commands above
```

**Error: `Invalid binding 'SESSION'`**

Ensure your `wrangler.jsonc` has the KV namespace configured:
```json
"kv_namespaces": [
  {
    "binding": "SESSION",
    "id": "your-actual-kv-id",
    "preview_id": "your-actual-preview-id"
  }
]
```

### Database Errors
```bash
# Reset local database
rm -rf .wrangler/state
npm run db:migrate
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### KV/R2 Binding Errors
- Ensure all bindings in `wrangler.jsonc` have valid IDs
- Check Cloudflare dashboard for resource existence
- Verify resource names match exactly

## 📝 To-Do / Future Enhancements

- [ ] Add user management UI for admins
- [ ] Add invite management UI for admins
- [ ] Add article editing page for editors
- [ ] Add signup page with invite token validation
- [ ] Add article categories/tags
- [ ] Add article search functionality
- [ ] Add pagination for article lists
- [ ] Add draft autosave
- [ ] Add article preview before publishing
- [ ] Add email notifications (via Cloudflare Email Workers)
- [ ] Add analytics dashboard
- [ ] Add SEO metadata management
- [ ] Add RSS feed generation

## 📄 License

MIT License - feel free to use this project as a template for your own CMS!

## 🙏 Credits

Built with:
- [Astro](https://astro.build)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [marked](https://marked.js.org) - Markdown parsing
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing

Design inspired by fishtank-news.pages.dev - brutalist, bold, and functional.
