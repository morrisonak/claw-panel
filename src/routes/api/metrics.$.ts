import { createFileRoute } from '@tanstack/react-router'
import * as openclaw from '~/server/openclaw'
import { getDB } from '~/utils/cloudflare'

export const Route = createFileRoute('/api/metrics/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace('/api/metrics/', '')

        // Route based on path
        if (path === 'status') {
          const gateway = await openclaw.getGatewayStatus()
          
          // Get task stats from D1 as activity proxy
          let taskStats = { total: 0, pending: 0, completed: 0, failed: 0 }
          try {
            const db = getDB()
            if (db) {
              const rows = await db.prepare(
                `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
              ).all()
              for (const r of rows.results as any[]) {
                taskStats.total += r.count
                if (r.status === 'pending') taskStats.pending = r.count
                if (r.status === 'completed') taskStats.completed = r.count
                if (r.status === 'failed') taskStats.failed = r.count
              }
            }
          } catch {}

          return Response.json({
            gateway,
            sessions: {
              activeSessions: gateway.ok ? 1 : 0,
              totalSessions: gateway.ok ? 1 : 0,
              totalTokens: 0,
            },
            tasks: taskStats,
            timestamp: Date.now(),
          })
        }

        if (path === 'cost') {
          const status = await openclaw.getSessionStatus()
          const dailySpend = 0.15
          const monthlySpend = dailySpend * 30
          return Response.json({
            dailySpend,
            monthlySpend,
            estimatedDaily: 0.10,
            estimatedMonthly: 3,
            budget: { daily: 5, monthly: 100 },
            usagePercent: Math.round((dailySpend / 5) * 100),
          })
        }

        if (path === 'models') {
          return Response.json({
            models: [
              {
                model: 'claude-haiku-4-5',
                tokensIn: 15000,
                tokensOut: 45000,
                callCount: 128,
                costEstimate: 0.008,
              },
              {
                model: 'claude-sonnet-4-5',
                tokensIn: 3000,
                tokensOut: 12000,
                callCount: 8,
                costEstimate: 0.045,
              },
            ],
          })
        }

        if (path === 'agents') {
          // Would need DB access here
          return Response.json({ agents: [] })
        }

        if (path === 'cron') {
          const jobs = await openclaw.listCronJobs()
          return Response.json({ jobs })
        }

        return Response.json({ error: 'Not found' }, { status: 404 })
      },

      POST: async ({ request }) => {
        const url = new URL(request.url)
        const path = url.pathname.replace('/api/metrics/', '')

        if (path === 'cron') {
          try {
            const data = await request.json()
            const result = await openclaw.addCronJob(data)
            return Response.json(result)
          } catch (error) {
            return Response.json({ error: String(error) }, { status: 500 })
          }
        }

        if (path === 'heartbeat') {
          try {
            const result = await openclaw.sendToMainSession('Trigger a heartbeat now. Run the cron wake tool with mode "now".')
            return Response.json({ ok: true })
          } catch (error) {
            return Response.json({ error: String(error) }, { status: 500 })
          }
        }

        if (path === 'restart') {
          try {
            const result = await openclaw.sendToMainSession('Restart the gateway now. Use the gateway restart tool.')
            return Response.json({ ok: true })
          } catch (error) {
            return Response.json({ error: String(error) }, { status: 500 })
          }
        }

        if (path === 'gateway-restart') {
          try {
            const result = await openclaw.sendToMainSession('Restart the gateway now. Use the gateway restart tool.')
            return Response.json({ ok: true })
          } catch (error) {
            return Response.json({ error: String(error) }, { status: 500 })
          }
        }

        return Response.json({ error: 'Not found' }, { status: 404 })
      },

      DELETE: async ({ request }) => {
        const url = new URL(request.url)
        const pathParts = url.pathname.split('/')

        if (pathParts[3] === 'cron' && pathParts[4]) {
          try {
            const result = await openclaw.deleteCronJob(pathParts[4])
            return Response.json(result)
          } catch (error) {
            return Response.json({ error: String(error) }, { status: 500 })
          }
        }

        return Response.json({ error: 'Not found' }, { status: 404 })
      },
    },
  },
})
