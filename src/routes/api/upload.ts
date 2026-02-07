import { createFileRoute } from '@tanstack/react-router'
import { getBucket } from '~/utils/cloudflare'

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bucket = getBucket()
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
          return Response.json({ error: 'No file provided' }, { status: 400 })
        }

        const key = `uploads/${Date.now()}-${file.name}`
        await bucket.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        })

        return Response.json({ key, size: file.size, type: file.type }, { status: 201 })
      },

      GET: async ({ request }) => {
        const bucket = getBucket()
        const url = new URL(request.url)
        const key = url.searchParams.get('key')

        if (!key) {
          return Response.json({ error: 'Key parameter required' }, { status: 400 })
        }

        const object = await bucket.get(key)
        if (!object) {
          return Response.json({ error: 'Object not found' }, { status: 404 })
        }

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
          },
        })
      },
    },
  },
})
