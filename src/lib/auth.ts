import { env } from 'cloudflare:workers'

// Simple password hashing using Web Crypto API (available in Workers)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + env.BETTER_AUTH_SECRET)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password)
  return newHash === hash
}

function generateId(): string {
  return crypto.randomUUID()
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '')
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: string
}

export const auth = {
  async signUp(data: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    const db = env.DB

    // Check if user exists
    const existing = await db.prepare('SELECT id FROM user WHERE email = ?').bind(data.email).first()
    if (existing) {
      throw new Error('User already exists')
    }

    const userId = generateId()
    const passwordHash = await hashPassword(data.password)
    const now = new Date().toISOString()

    await db.prepare(
      'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, ?, ?)'
    ).bind(userId, data.name, data.email, Date.now(), Date.now()).run()

    await db.prepare(
      'INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(generateId(), data.email, 'credential', userId, passwordHash, Date.now(), Date.now()).run()

    // Create session
    const token = generateToken()
    const sessionId = generateId()
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days

    await db.prepare(
      'INSERT INTO session (id, userId, token, expiresAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(sessionId, userId, token, expiresAt, Date.now(), Date.now()).run()

    return {
      user: { id: userId, name: data.name, email: data.email, createdAt: now },
      token,
    }
  },

  async signIn(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const db = env.DB

    const user = await db.prepare(
      'SELECT u.id, u.name, u.email, u.createdAt FROM user u WHERE u.email = ?'
    ).bind(data.email).first<{ id: string; name: string; email: string; createdAt: number }>()

    if (!user) {
      throw new Error('Invalid credentials')
    }

    const account = await db.prepare(
      'SELECT password FROM account WHERE userId = ? AND providerId = ?'
    ).bind(user.id, 'credential').first<{ password: string }>()

    if (!account || !await verifyPassword(data.password, account.password)) {
      throw new Error('Invalid credentials')
    }

    // Create new session
    const token = generateToken()
    const sessionId = generateId()
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000)

    await db.prepare(
      'INSERT INTO session (id, userId, token, expiresAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(sessionId, user.id, token, expiresAt, Date.now(), Date.now()).run()

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: new Date(user.createdAt).toISOString()
      },
      token,
    }
  },

  async getSession(token: string): Promise<{ user: User; session: Session } | null> {
    const db = env.DB

    const result = await db.prepare(`
      SELECT s.id as sessionId, s.token, s.expiresAt, s.userId,
             u.id, u.name, u.email, u.createdAt
      FROM session s
      JOIN user u ON s.userId = u.id
      WHERE s.token = ? AND s.expiresAt > ?
    `).bind(token, Date.now()).first<{
      sessionId: string
      token: string
      expiresAt: number
      userId: string
      id: string
      name: string
      email: string
      createdAt: number
    }>()

    if (!result) return null

    return {
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        createdAt: new Date(result.createdAt).toISOString(),
      },
      session: {
        id: result.sessionId,
        userId: result.userId,
        token: result.token,
        expiresAt: new Date(result.expiresAt).toISOString(),
      },
    }
  },

  async signOut(token: string): Promise<void> {
    const db = env.DB
    await db.prepare('DELETE FROM session WHERE token = ?').bind(token).run()
  },
}

// Cookie helpers
export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  const match = cookie.match(/auth_token=([^;]+)/)
  return match ? match[1] : null
}

export function setSessionCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60 // 7 days
  return `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearSessionCookie(): string {
  return 'auth_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
}

// Server-side auth check for protected routes
export async function requireAuth(request: Request): Promise<{ user: User; session: Session }> {
  const token = getSessionToken(request)
  if (!token) {
    throw new Error('Unauthorized')
  }

  const result = await auth.getSession(token)
  if (!result) {
    throw new Error('Unauthorized')
  }

  return result
}
