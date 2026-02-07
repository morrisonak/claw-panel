import { createFileRoute } from '@tanstack/react-router'
import { getDB } from '~/utils/cloudflare'

export const Route = createFileRoute('/api/users')({
  server: {
    handlers: {
      GET: async () => {
        const db = getDB()
        const users = await db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
        return Response.json(users.results)
      },

      POST: async ({ request }) => {
        const db = getDB()
        const body = await request.json()
        const { email, name } = body as { email: string; name?: string }

        if (!email) {
          return Response.json({ error: 'Email is required' }, { status: 400 })
        }

        const result = await db
          .prepare('INSERT INTO users (email, name) VALUES (?, ?) RETURNING *')
          .bind(email, name ?? null)
          .first()

        return Response.json(result, { status: 201 })
      },
    },
  },
})
