import { createFileRoute } from '@tanstack/react-router'
import { getDB } from '~/utils/cloudflare'
import { requireApiAuth } from '~/server/api-auth'

export const Route = createFileRoute('/api/tasks/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await requireApiAuth(request))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const db = getDB()
        if (!db) {
          return Response.json({ error: 'DB not available' }, { status: 500 })
        }

        try {
          const tasks = await db
            .prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100')
            .all()
          return Response.json({ tasks: tasks.results })
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },

      POST: async ({ request }) => {
        const db = getDB()
        if (!db) {
          return Response.json({ error: 'DB not available' }, { status: 500 })
        }

        try {
          const data = await request.json()
          const { title, prompt } = data as any

          if (!title || !prompt) {
            return Response.json({ error: 'Title and prompt required' }, { status: 400 })
          }

          // Insert task as pending, then retrieve the generated hex ID
          const now = Math.floor(Date.now() / 1000)
          await db
            .prepare('INSERT INTO tasks (title, description, priority, status, created_at) VALUES (?, ?, ?, ?, ?)')
            .bind(title, prompt, 'medium', 'pending', now)
            .run()

          const row = await db
            .prepare('SELECT id FROM tasks WHERE title = ? AND created_at = ? ORDER BY rowid DESC LIMIT 1')
            .bind(title, now)
            .first() as any

          const taskId = row?.id || 'unknown'

          // Queue into main agent session (fire-and-forget via waitUntil)
          const { queueTask } = await import('~/server/openclaw')
          // Use waitUntil to not block the response
          const ctx = (request as any).ctx
          const queuePromise = queueTask(taskId, title, prompt).catch((err: any) => {
            console.error('Failed to queue task:', err)
          })

          if (ctx?.waitUntil) {
            ctx.waitUntil(queuePromise)
          } else {
            await queuePromise
          }

          return Response.json({
            id: taskId,
            title,
            status: 'pending',
            created_at: now,
          })
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },

      PUT: async ({ request }) => {
        const db = getDB()
        if (!db) {
          return Response.json({ error: 'DB not available' }, { status: 500 })
        }

        const url = new URL(request.url)
        const id = url.pathname.split('/').pop()

        try {
          const data = await request.json()
          const { title, description, status, priority } = data as any

          const updates: string[] = []
          const values: any[] = []

          if (title) {
            updates.push('title = ?')
            values.push(title)
          }
          if (description !== undefined) {
            updates.push('description = ?')
            values.push(description)
          }
          if (status) {
            updates.push('status = ?')
            values.push(status)
          }
          if (priority) {
            updates.push('priority = ?')
            values.push(priority)
          }

          updates.push('updated_at = ?')
          values.push(Math.floor(Date.now() / 1000))

          if (status === 'completed') {
            updates.push('completed_at = ?')
            values.push(Math.floor(Date.now() / 1000))
          }

          values.push(id)

          await db
            .prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run()

          return Response.json({ ok: true })
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },

      DELETE: async ({ request }) => {
        const db = getDB()
        if (!db) {
          return Response.json({ error: 'DB not available' }, { status: 500 })
        }

        const url = new URL(request.url)
        const id = url.pathname.split('/').pop()

        try {
          await db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run()
          return Response.json({ ok: true })
        } catch (error) {
          return Response.json({ error: String(error) }, { status: 500 })
        }
      },
    },
  },
})
