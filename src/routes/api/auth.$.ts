import { createFileRoute } from '@tanstack/react-router'
import { auth, getSessionToken, setSessionCookie, clearSessionCookie } from '~/lib/auth'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const action = params._splat

        if (action === 'get-session') {
          const token = getSessionToken(request)
          if (!token) {
            return Response.json({ user: null, session: null })
          }

          const result = await auth.getSession(token)
          return Response.json(result || { user: null, session: null })
        }

        return Response.json({ error: 'Not found' }, { status: 404 })
      },

      POST: async ({ request, params }) => {
        const action = params._splat

        try {
          if (action === 'sign-up/email') {
            const body = await request.json() as { name: string; email: string; password: string }
            const result = await auth.signUp({
              name: body.name,
              email: body.email,
              password: body.password,
            })

            return Response.json(result, {
              headers: {
                'Set-Cookie': setSessionCookie(result.token),
              },
            })
          }

          if (action === 'sign-in/email') {
            const body = await request.json() as { email: string; password: string }
            const result = await auth.signIn({
              email: body.email,
              password: body.password,
            })

            return Response.json(result, {
              headers: {
                'Set-Cookie': setSessionCookie(result.token),
              },
            })
          }

          if (action === 'sign-out') {
            const token = getSessionToken(request)
            if (token) {
              await auth.signOut(token)
            }

            return Response.json({ success: true }, {
              headers: {
                'Set-Cookie': clearSessionCookie(),
              },
            })
          }

          return Response.json({ error: 'Not found' }, { status: 404 })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          return Response.json({ error: message }, { status: 400 })
        }
      },
    },
  },
})
