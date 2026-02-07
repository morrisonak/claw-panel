import { createServerFn } from '@tanstack/react-start'
import { getDB } from '~/utils/cloudflare'

export type Post = {
  id: number
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export const getPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDB()
  const result = await db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC')
    .all<Post>()
  return result.results
})

export const getPost = createServerFn({ method: 'GET' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const db = getDB()
    const post = await db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .bind(id)
      .first<Post>()
    return post
  })

export const createPost = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; content?: string }) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    const result = await db
      .prepare(
        'INSERT INTO posts (title, content) VALUES (?, ?) RETURNING *'
      )
      .bind(data.title, data.content ?? null)
      .first<Post>()
    return result
  })

export const updatePost = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; title: string; content?: string }) => data)
  .handler(async ({ data }) => {
    const db = getDB()
    const result = await db
      .prepare(
        'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *'
      )
      .bind(data.title, data.content ?? null, data.id)
      .first<Post>()
    return result
  })

export const deletePost = createServerFn({ method: 'POST' })
  .inputValidator((id: number) => id)
  .handler(async ({ data: id }) => {
    const db = getDB()
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
    return { success: true }
  })
