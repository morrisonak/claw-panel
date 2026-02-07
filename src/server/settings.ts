import { createServerFn } from '@tanstack/react-start'
import { getKV } from '~/utils/cloudflare'

export type SettingItem = {
  key: string
  value: string
}

/**
 * Get a single setting from KV
 */
export const getSetting = createServerFn({ method: 'GET' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const kv = getKV()
    const value = await kv.get(key)
    return value
  })

/**
 * Get all settings from KV (with a prefix)
 */
export const listSettings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const kv = getKV()
    const list = await kv.list({ prefix: 'setting:' })

    const settings: SettingItem[] = await Promise.all(
      list.keys.map(async (key) => ({
        key: key.name.replace('setting:', ''),
        value: (await kv.get(key.name)) ?? '',
      }))
    )

    return settings
  }
)

/**
 * Set a setting in KV
 */
export const setSetting = createServerFn({ method: 'POST' })
  .inputValidator((data: { key: string; value: string }) => data)
  .handler(async ({ data }) => {
    const kv = getKV()
    await kv.put(`setting:${data.key}`, data.value)
    return { key: data.key, value: data.value }
  })

/**
 * Delete a setting from KV
 */
export const deleteSetting = createServerFn({ method: 'POST' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const kv = getKV()
    await kv.delete(`setting:${key}`)
    return { deleted: true }
  })

/**
 * Get cached value or compute and cache it
 * Demonstrates KV as a cache layer
 */
export const getCachedValue = createServerFn({ method: 'GET' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const kv = getKV()
    const cacheKey = `cache:${key}`

    // Try to get from cache
    const cached = await kv.get(cacheKey)
    if (cached) {
      return { value: cached, fromCache: true }
    }

    // Simulate expensive computation
    const computed = `Computed at ${new Date().toISOString()}`
    await kv.put(cacheKey, computed, { expirationTtl: 60 }) // 60 second TTL

    return { value: computed, fromCache: false }
  })

/**
 * Clear a cached value
 */
export const clearCache = createServerFn({ method: 'POST' })
  .inputValidator((key: string) => key)
  .handler(async ({ data: key }) => {
    const kv = getKV()
    await kv.delete(`cache:${key}`)
    return { cleared: true }
  })
