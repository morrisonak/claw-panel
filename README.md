# CF Template

Full-stack template with TanStack Start, Shadcn UI, and Cloudflare Workers featuring authentication, database, file storage, and KV.

## Features

- **Authentication** - Custom lightweight auth with email/password, sessions, and protected routes
- **Database** - D1 serverless SQLite with posts CRUD example
- **File Storage** - R2 object storage with upload/download/delete
- **Key-Value Store** - KV namespace for settings and caching
- **Protected Routes** - Dashboard and profile pages requiring authentication
- **Modern UI** - Shadcn UI components with Tailwind CSS

## Stack

- **TanStack Start** - Full-stack React framework with file-based routing and server functions
- **Shadcn UI** - Accessible components built with Radix and Tailwind CSS
- **Cloudflare Workers** - Edge deployment with 0ms cold starts
- **D1** - Serverless SQLite database at the edge
- **R2** - S3-compatible object storage with no egress fees
- **KV** - Low-latency key-value storage
- **Bun** - Fast JavaScript runtime for local development

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/       # UI components (Shadcn)
├── lib/
│   ├── auth.ts       # Authentication logic
│   └── auth-client.ts # Client-side auth hooks
├── routes/
│   ├── api/          # API routes
│   │   └── auth.$.ts # Auth endpoints
│   ├── dashboard.tsx # Protected dashboard
│   ├── profile.tsx   # Protected profile
│   ├── posts.tsx     # Posts CRUD
│   ├── files.tsx     # File management
│   ├── settings.tsx  # KV settings
│   ├── login.tsx     # Login page
│   └── signup.tsx    # Signup page
├── server/           # Server functions
└── utils/
    └── cloudflare.ts # CF bindings helpers
```

## Authentication

Custom lightweight authentication using:
- Web Crypto API for password hashing (SHA-256)
- Secure session tokens with HttpOnly cookies
- Protected route middleware via server functions

### Auth Endpoints

- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/get-session` - Get current session

### Protected Routes

Routes like `/dashboard` and `/profile` check authentication server-side and redirect to `/login` if not authenticated.

## Deployment

### 1. Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create cf-template-db

# Create R2 bucket
wrangler r2 bucket create cf-template-bucket

# Create KV namespace
wrangler kv namespace create KV
```

### 2. Configure wrangler.jsonc

Update `wrangler.jsonc` with your resource IDs:

```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "cf-template-db",
    "database_id": "YOUR_DATABASE_ID"
  }],
  "r2_buckets": [{
    "binding": "BUCKET",
    "bucket_name": "cf-template-bucket"
  }],
  "kv_namespaces": [{
    "binding": "KV",
    "id": "YOUR_KV_NAMESPACE_ID"
  }]
}
```

### 3. Set Secrets

```bash
# Set auth secret for password hashing
wrangler secret put BETTER_AUTH_SECRET
```

### 4. Run Migrations

```bash
# Apply migrations to production
bun run db:migrate:prod
```

### 5. Deploy

```bash
bun run deploy
```

## Database Commands

```bash
bun run db:migrate       # Apply migrations locally
bun run db:migrate:prod  # Apply migrations to production
bun run db:studio        # Open D1 Studio
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Secret key for password hashing (set via `wrangler secret`) |
| `ENVIRONMENT` | `development` or `production` |

## API Examples

### Create a Post

```bash
curl -X POST https://your-worker.workers.dev/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "content": "My first post"}'
```

### Upload a File

```bash
curl -X POST https://your-worker.workers.dev/api/files/upload \
  -F "file=@/path/to/file.pdf"
```

### Sign Up

```bash
curl -X POST https://your-worker.workers.dev/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "password": "password123"}'
```

## License

MIT
