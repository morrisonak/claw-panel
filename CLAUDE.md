# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun install              # Install dependencies
bun run dev              # Start dev server on port 3000
bun run build            # Build for production
bun run preview          # Build and preview locally

# Deployment
bun run deploy           # Build and deploy to Cloudflare Workers
bun run cf-typegen       # Regenerate Cloudflare binding types

# Database (D1)
bun run db:migrate       # Apply migrations locally
bun run db:migrate:prod  # Apply migrations to production
bun run db:studio        # Open D1 Studio for local DB
```

## Architecture

**Stack:** TanStack Start + Shadcn UI + Cloudflare Workers + D1 + R2 + KV + Better Auth

### Project Structure
```
src/
├── routes/
│   ├── __root.tsx        # Root layout with nav
│   ├── index.tsx         # Home page
│   ├── about.tsx         # About page
│   ├── posts.tsx         # Posts CRUD demo (D1)
│   ├── files.tsx         # File management (R2)
│   ├── settings.tsx      # KV settings demo
│   ├── login.tsx         # Login page
│   ├── signup.tsx        # Signup page
│   └── api/
│       ├── auth.$.ts         # Better Auth handler
│       ├── files.upload.ts   # File upload endpoint
│       └── files.$.ts        # File serving endpoint
├── server/
│   ├── posts.ts          # Posts server functions
│   ├── files.ts          # Files server functions
│   └── settings.ts       # KV settings server functions
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── DefaultCatchBoundary.tsx
│   └── NotFound.tsx
├── lib/
│   ├── utils.ts          # cn() utility
│   ├── auth.ts           # Better Auth server config
│   └── auth-client.ts    # Better Auth client
├── styles/app.css        # Tailwind v4 theme
└── utils/
    ├── cloudflare.ts     # getDB(), getBucket(), getKV()
    └── seo.ts
migrations/               # D1 SQL migrations
```

## Server Functions

Use `createServerFn` for RPC-style server functions:
```ts
import { createServerFn } from '@tanstack/react-start'
import { getDB } from '~/utils/cloudflare'

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDB()
  const result = await db.prepare('SELECT * FROM posts').all()
  return result.results
})

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; content?: string }) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    return await db.prepare('INSERT INTO posts ...').bind(data.title).first()
  })
```

Call from components:
```ts
const posts = await getPosts()
await createPost({ data: { title: 'Hello', content: 'World' } })
```

## Server Routes (API)

Use `createFileRoute` with `server.handlers` for REST endpoints:
```ts
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/example')({
  server: {
    handlers: {
      GET: async ({ request }) => Response.json({ message: 'Hello' }),
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json(body, { status: 201 })
      },
    },
  },
})
```

## Cloudflare Bindings

Access D1, R2, and KV via `~/utils/cloudflare`:
```ts
import { getDB, getBucket, getKV } from '~/utils/cloudflare'

const db = getDB()        // D1Database
const bucket = getBucket() // R2Bucket
const kv = getKV()        // KVNamespace
```

### KV Usage
```ts
// Get value
const value = await kv.get('key')

// Set value (optional TTL)
await kv.put('key', 'value')
await kv.put('key', 'value', { expirationTtl: 60 }) // 60 seconds

// Delete value
await kv.delete('key')

// List keys with prefix
const list = await kv.list({ prefix: 'setting:' })
```

Types auto-generated in `worker-configuration.d.ts` - run `bun run cf-typegen` after changing `wrangler.jsonc`.

## Authentication (Better Auth)

Uses [Better Auth](https://better-auth.com) with email/password authentication.

### Server Setup (`~/lib/auth.ts`)
```ts
import { getAuth } from '~/lib/auth'

// In API route handler
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => getAuth().handler(request),
      POST: ({ request }) => getAuth().handler(request),
    },
  },
})
```

### Client Usage (`~/lib/auth-client.ts`)
```ts
import { signIn, signUp, signOut, useSession } from '~/lib/auth-client'

// Sign up
await signUp.email({ name, email, password })

// Sign in
await signIn.email({ email, password })

// Sign out
await signOut()

// Get session (React hook)
const { data: session, isPending } = useSession()
if (session?.user) {
  console.log(session.user.name, session.user.email)
}
```

### Auth Routes
- `/login` - Login page
- `/signup` - Registration page
- `/api/auth/*` - Better Auth API endpoints

## Shadcn UI Components

Available in `src/components/ui/`:
- `button.tsx` - Button with variants
- `card.tsx` - Card, CardHeader, CardContent, etc.
- `input.tsx` - Text input
- `label.tsx` - Form label
- `textarea.tsx` - Multiline input
- `alert-dialog.tsx` - Confirmation dialogs

Add more components:
```bash
bunx shadcn@latest add [component]
```

## Demo Features

### Posts CRUD (`/posts`)
- List, create, edit, delete posts
- Server functions with D1 database
- Form handling with validation

### File Management (`/files`)
- Drag & drop upload to R2
- File listing with icons
- Download and delete files
- 10MB file size limit

### Settings & Cache (`/settings`)
- Key-value storage with KV
- Add, view, delete settings
- Cache demo with 60-second TTL
- Demonstrates KV as cache layer

### Authentication (`/login`, `/signup`)
- Email/password authentication
- User registration with validation
- Session management with cookies
- Protected route support

## Cloudflare Setup

1. Create resources:
   ```bash
   bunx wrangler d1 create cf-template-db
   bunx wrangler r2 bucket create cf-template-bucket
   bunx wrangler kv namespace create KV
   ```

2. Update `wrangler.jsonc` with D1 database ID and KV namespace ID

3. Set auth secret:
   ```bash
   openssl rand -base64 32 | bunx wrangler secret put BETTER_AUTH_SECRET
   ```

4. Run migrations:
   ```bash
   bun run db:migrate:prod
   ```

5. Deploy:
   ```bash
   bun run deploy
   ```

## Tailwind v4

Uses `@theme` directive for custom colors in `src/styles/app.css`:
```css
@theme {
  --color-background: hsl(0 0% 100%);
  --color-primary: hsl(240 5.9% 10%);
  /* ... */
}
```

Colors available as utilities: `bg-background`, `text-primary`, `text-muted-foreground`, etc.
