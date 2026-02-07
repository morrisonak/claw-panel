import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  listSettings,
  setSetting,
  deleteSetting,
  getCachedValue,
  clearCache,
  type SettingItem,
} from '~/server/settings'

export const Route = createFileRoute('/settings')({
  loader: () => listSettings(),
  component: SettingsPage,
})

function SettingsPage() {
  const loaderData = Route.useLoaderData()
  const [settings, setSettings] = useState<SettingItem[]>(loaderData)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync with loader data when it changes
  useEffect(() => {
    setSettings(loaderData)
  }, [loaderData])

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim() || !newValue.trim()) return

    const key = newKey.trim()
    const value = newValue.trim()

    setIsSubmitting(true)
    try {
      await setSetting({ data: { key, value } })
      // Update local state immediately
      setSettings((prev) => {
        const exists = prev.find((s) => s.key === key)
        if (exists) {
          return prev.map((s) => (s.key === key ? { key, value } : s))
        }
        return [...prev, { key, value }].sort((a, b) => a.key.localeCompare(b.key))
      })
      setNewKey('')
      setNewValue('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (key: string) => {
    await deleteSetting({ data: key })
    // Update local state immediately
    setSettings((prev) => prev.filter((s) => s.key !== key))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Key-value storage powered by Cloudflare KV
        </p>
      </div>

      {/* Add Setting */}
      <Card>
        <CardHeader>
          <CardTitle>Add Setting</CardTitle>
          <CardDescription>
            Store a new key-value pair in Cloudflare KV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSetting} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  placeholder="my-setting"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  placeholder="some value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting || !newKey.trim() || !newValue.trim()}>
              {isSubmitting ? 'Saving...' : 'Add Setting'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Settings List */}
      <Card>
        <CardHeader>
          <CardTitle>Stored Settings</CardTitle>
          <CardDescription>
            {settings.length} setting{settings.length !== 1 ? 's' : ''} in KV storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No settings stored yet
            </p>
          ) : (
            <div className="divide-y">
              {settings.map((setting) => (
                <SettingRow
                  key={setting.key}
                  setting={setting}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cache Demo */}
      <CacheDemo />
    </div>
  )
}

function SettingRow({
  setting,
  onDelete,
}: {
  setting: SettingItem
  onDelete: (key: string) => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(setting.key)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-medium">{setting.key}</p>
        <p className="text-sm text-muted-foreground truncate">{setting.value}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{setting.key}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CacheDemo() {
  const [cacheKey, setCacheKey] = useState('demo')
  const [cacheResult, setCacheResult] = useState<{
    value: string
    fromCache: boolean
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFetch = async () => {
    setIsLoading(true)
    try {
      const result = await getCachedValue({ data: cacheKey })
      setCacheResult(result)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = async () => {
    setIsLoading(true)
    try {
      await clearCache({ data: cacheKey })
      setCacheResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Demo</CardTitle>
        <CardDescription>
          Demonstrates KV as a cache layer with 60-second TTL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="cache-key">Cache Key</Label>
            <Input
              id="cache-key"
              value={cacheKey}
              onChange={(e) => setCacheKey(e.target.value)}
              placeholder="demo"
            />
          </div>
          <Button onClick={handleFetch} disabled={isLoading || !cacheKey}>
            {isLoading ? 'Loading...' : 'Fetch Value'}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isLoading || !cacheKey}>
            Clear Cache
          </Button>
        </div>

        {cacheResult && (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  cacheResult.fromCache
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {cacheResult.fromCache ? 'FROM CACHE' : 'COMPUTED'}
              </span>
            </div>
            <p className="font-mono text-sm break-all">{cacheResult.value}</p>
            {cacheResult.fromCache && (
              <p className="text-xs text-muted-foreground">
                Value retrieved from KV cache. Click "Clear Cache" and fetch again to see a new computed value.
              </p>
            )}
            {!cacheResult.fromCache && (
              <p className="text-xs text-muted-foreground">
                Value was computed and cached with 60-second TTL. Fetch again within 60 seconds to see cached response.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
