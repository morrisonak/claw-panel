import { createFileRoute } from '@tanstack/react-router'
import { getBucket } from '~/utils/cloudflare'

export const Route = createFileRoute('/api/files/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const bucket = getBucket()
        const key = decodeURIComponent(params._splat || '')

        if (!key) {
          return Response.json({ error: 'Key required' }, { status: 400 })
        }

        const object = await bucket.get(key)
        if (!object) {
          return Response.json({ error: 'File not found' }, { status: 404 })
        }

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Content-Length': object.size.toString(),
            'Cache-Control': 'public, max-age=31536000',
          },
        })
      },
    },
  },
})
