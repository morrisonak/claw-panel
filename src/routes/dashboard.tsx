import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '~/lib/auth'
import { getDB, getBucket, getKV } from '~/utils/cloudflare'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

interface DashboardData {
  user: { id: string; name: string; email: string; createdAt: string }
  stats: {
    postCount: number
    fileCount: number
    totalFileSize: number
    sessionCount: number
    settingsCount: number
  }
  recentPosts: Array<{ id: number; title: string; created_at: string }>
  recentFiles: Array<{ key: string; size: number; uploaded: string }>
}

const getDashboardData = createServerFn({ method: 'GET' }).handler(async (): Promise<DashboardData> => {
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

  const db = getDB()
  const bucket = getBucket()
  const kv = getKV()

  // Fetch stats in parallel
  const [
    postCountResult,
    sessionCountResult,
    recentPostsResult,
    fileList,
    kvKeys,
  ] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM posts').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM session WHERE userId = ? AND expiresAt > ?')
      .bind(result.user.id, Date.now())
      .first<{ count: number }>(),
    db.prepare('SELECT id, title, created_at FROM posts ORDER BY created_at DESC LIMIT 5').all<{ id: number; title: string; created_at: string }>(),
    bucket.list({ limit: 100 }),
    kv.list({ limit: 100 }),
  ])

  // Calculate file stats
  let totalFileSize = 0
  const recentFiles: Array<{ key: string; size: number; uploaded: string }> = []

  for (const obj of fileList.objects.slice(0, 5)) {
    totalFileSize += obj.size
    recentFiles.push({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
    })
  }

  // Add remaining file sizes
  for (const obj of fileList.objects.slice(5)) {
    totalFileSize += obj.size
  }

  return {
    user: result.user,
    stats: {
      postCount: postCountResult?.count ?? 0,
      fileCount: fileList.objects.length,
      totalFileSize,
      sessionCount: sessionCountResult?.count ?? 0,
      settingsCount: kvKeys.keys.length,
    },
    recentPosts: recentPostsResult.results,
    recentFiles,
  }
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    await getDashboardData()
  },
  loader: async () => {
    return await getDashboardData()
  },
  component: DashboardPage,
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

function DashboardPage() {
  const { user, stats, recentPosts, recentFiles } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Posts"
          value={stats.postCount.toString()}
          description="Posts in database"
        />
        <StatsCard
          title="Total Files"
          value={stats.fileCount.toString()}
          description={`${formatBytes(stats.totalFileSize)} used`}
        />
        <StatsCard
          title="KV Settings"
          value={stats.settingsCount.toString()}
          description="Stored key-value pairs"
        />
        <StatsCard
          title="Active Sessions"
          value={stats.sessionCount.toString()}
          description="Your active sessions"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Latest posts in the database</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No posts yet</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <ActivityItem
                    key={post.id}
                    action="Post"
                    item={post.title}
                    time={formatRelativeTime(post.created_at)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Latest uploads to R2</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No files uploaded</p>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <ActivityItem
                    key={file.key}
                    action={formatBytes(file.size)}
                    item={file.key}
                    time={formatRelativeTime(file.uploaded)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <QuickAction label="New Post" href="/posts" />
            <QuickAction label="Upload File" href="/files" />
            <QuickAction label="View Profile" href="/profile" />
            <QuickAction label="Settings" href="/settings" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ action, item, time }: { action: string; item: string; time: string }) {
  return (
    <div className="flex items-center justify-between text-sm gap-2">
      <span className="truncate flex-1">
        <span className="text-muted-foreground">{action}</span>{' '}
        <span className="font-medium">{item}</span>
      </span>
      <span className="text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  )
}

function QuickAction({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center rounded-md border p-3 text-sm font-medium hover:bg-accent"
    >
      {label}
    </a>
  )
}
