import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '~/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'

const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const cookie = headers.get('cookie')

  if (!cookie) {
    throw redirect({ to: '/login' })
  }

  const match = cookie.match(/auth_token=([^;]+)/)
  const token = match ? match[1] : null

  if (!token) {
    throw redirect({ to: '/login' })
  }

  const result = await auth.getSession(token)
  if (!result) {
    throw redirect({ to: '/login' })
  }

  return result
})

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => {
    await getAuthSession()
  },
  loader: async () => {
    return await getAuthSession()
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user, session } = Route.useLoaderData()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={user.id} disabled className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>Account Created</Label>
            <Input value={new Date(user.createdAt).toLocaleDateString()} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
          <CardDescription>Your active session details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Session ID</Label>
            <Input value={session.id} disabled className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Expires</Label>
            <Input value={new Date(session.expiresAt).toLocaleString()} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
