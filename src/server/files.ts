import { createServerFn } from '@tanstack/react-start'
import { getBucket } from '~/utils/cloudflare'

export type FileItem = {
  key: string
  size: number
  uploaded: string
  httpMetadata?: {
    contentType?: string
  }
}

export const listFiles = createServerFn({ method: 'GET' }).handler(async () => {
  const bucket = getBucket()
  const listed = await bucket.list({ prefix: 'uploads/' })

  return listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded.toISOString(),
    httpMetadata: obj.httpMetadata,
  }))
})

export const deleteFile = createServerFn({ method: 'POST' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const bucket = getBucket()
    await bucket.delete(key)
    return { success: true }
  })

export const getFileUrl = createServerFn({ method: 'GET' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    // For public access, you'd configure a custom domain or use presigned URLs
    // This returns the key for now - in production, use R2 public bucket or signed URLs
    return { key, url: `/api/files/${encodeURIComponent(key)}` }
  })
