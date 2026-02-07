import { createFileRoute } from '@tanstack/react-router'
import { getBucket } from '~/utils/cloudflare'

export const Route = createFileRoute('/api/files/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bucket = getBucket()
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
          return Response.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
          return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 })
        }

        const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        await bucket.put(key, file.stream(), {
          httpMetadata: {
            contentType: file.type || 'application/octet-stream',
          },
        })

        return Response.json({
          key,
          name: file.name,
          size: file.size,
          type: file.type,
        }, { status: 201 })
      },
    },
  },
})
