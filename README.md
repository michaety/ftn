# Fishtank News CMS

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/michaety/ftn)

A complete serverless news CMS built with Astro, Cloudflare Workers, D1, KV, and R2. Features admin/editor workflows, Markdown editing, image uploads, and a brutalist design matching fishtank-news.pages.dev.

## 🚀 Quick Start

See **[NEWS_CMS_README.md](./NEWS_CMS_README.md)** for complete setup and deployment instructions.

## ✨ Features

- **Admin Dashboard**: Approve/reject articles, manage users, send editor invites
- **Editor Dashboard**: Create articles with Markdown editor, upload images to R2
- **Public Site**: Browse and read approved articles with beautiful brutalist design
- **Authentication**: Session-based auth with bcrypt, role-based access control
- **Serverless**: 100% deployable via Cloudflare Workers + GitHub

## 🏗️ Tech Stack

- **Frontend**: Astro (SSR)
- **Database**: Cloudflare D1 (SQLite)
- **Sessions**: Cloudflare KV
- **Storage**: Cloudflare R2
- **Hosting**: Cloudflare Workers

## 📖 Documentation

- [Full Deployment Guide](./NEWS_CMS_README.md) - Complete setup instructions
- [API Documentation](./NEWS_CMS_README.md#-api-endpoints) - All endpoints documented
- [User Workflows](./NEWS_CMS_README.md#-user-workflows) - Admin, editor, and public flows
- [Style Guide](./STYLE.md) - CSS architecture, design system, and customization guide

## 🎨 Frontend Architecture

The public-facing Fishtank News site uses a clean, componentized Astro architecture:

### Core Components
- **MainLayout.astro**: Base HTML wrapper with `<head>` and stylesheet
- **Header.astro**: Site header with role-based navigation (public/admin/editor)
- **Footer.astro**: Consistent footer across all pages
- **ArticleCard.astro**: Reusable article preview cards with R2 image support

### Pages
- **index.astro** (`/`): Homepage with article grid (featured + regular articles)
- **[slug].astro** (`/{slug}`): Article detail pages with full content

### Styling
- **Brutalist Design**: Bold borders, high contrast, monospace typography
- **CSS Variables**: Complete design system with colors, spacing, borders, and typography variables
- **Mobile-First**: Responsive design with breakpoints at 768px and 480px
- **R2 Integration**: Images served from Cloudflare R2 with graceful fallbacks

See [STYLE.md](./STYLE.md) for complete styling documentation and customization guide.

## 🔐 Default Credentials

- Email: `michaety@pm.me`
- Password: `rohypnol`
- Handle: `@5wcol`
- Name: `soon`

**⚠️ Change immediately after first login!**

## 📦 Installation

⚠️ **Before deployment**: You must create Cloudflare resources (D1, KV, R2). See the [Full Deployment Guide](./NEWS_CMS_README.md) for complete setup instructions.

```bash
npm install

# Create KV namespace for sessions (REQUIRED)
npx wrangler kv:namespace create SESSION
npx wrangler kv:namespace create SESSION --preview
# Update wrangler.jsonc with the returned IDs

# Run migrations and deploy
npm run db:migrate
npm run build
npm run deploy
```

---

## Original SaaS Admin Template Documentation

## Setup Steps

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
# Create a .dev.vars file for local development
cp .dev.vars.example .dev.vars
```

Add your API token:

```
API_TOKEN=your_token_here
```

_An API token is required to authenticate requests to the API. You should generate this before trying to run the project locally or deploying it._

3. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "admin-db":

```bash
npx wrangler d1 create admin-db
```

...and update the `database_id` field in `wrangler.json` with the new database ID.

4. Run the database migrations locally:

```bash
$ npm run db:migrate
```

Run the development server:

```bash
npm run dev
```

_If you're testing Workflows, you should run `npm run wrangler:dev` instead._

5. Build the application:

```bash
npm run build
```

6. Deploy to Cloudflare Workers:

```bash
npm run deploy
```

7. Run the database migrations remotely:

```bash
$ npm run db:migrate:remote
```

8. Set your production API token:

```bash
npx wrangler secret put API_TOKEN
```

## Usage

This project includes a fully functional admin dashboard with customer and subscription management capabilities. It also includes an API with token authentication to access resources via REST, returning JSON data.

It also includes a "Customer Workflow", built with [Cloudflare Workflows](https://developers.cloudflare.com/workflows). This workflow can be triggered in the UI or via the REST API to do arbitrary actions in the background for any given user. See [`customer_workflow.ts`]() to learn more about what you can do in this workflow.
