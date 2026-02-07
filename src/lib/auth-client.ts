import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from './auth'

interface AuthResponse {
  user: User | null
  token?: string
  session?: Session | null
  error?: string
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

export async function signUp(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })

  const json = await res.json() as AuthResponse & { error?: string }
  if (!res.ok) {
    throw new Error(json.error || 'Signup failed')
  }
  return json
}

export async function signIn(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  })

  const json = await res.json() as AuthResponse & { error?: string }
  if (!res.ok) {
    throw new Error(json.error || 'Sign in failed')
  }
  return json
}

export async function signOut(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getSession(): Promise<{ user: User | null; session: Session | null }> {
  const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
    credentials: 'include',
  })

  if (!res.ok) {
    return { user: null, session: null }
  }

  return res.json()
}

// React hook for session management
export function useSession() {
  const [data, setData] = useState<{ user: User | null; session: Session | null }>({
    user: null,
    session: null,
  })
  const [isPending, setIsPending] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsPending(true)
    try {
      const result = await getSession()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch session'))
    } finally {
      setIsPending(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isPending, error, refetch }
}
