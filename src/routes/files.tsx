import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useRef } from 'react'
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
import { listFiles, deleteFile, type FileItem } from '~/server/files'

export const Route = createFileRoute('/files')({
  loader: () => listFiles(),
  component: FilesPage,
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(contentType?: string): string {
  if (!contentType) return '📄'
  if (contentType.startsWith('image/')) return '🖼️'
  if (contentType.startsWith('video/')) return '🎬'
  if (contentType.startsWith('audio/')) return '🎵'
  if (contentType.includes('pdf')) return '📕'
  if (contentType.includes('zip') || contentType.includes('compressed')) return '📦'
  if (contentType.includes('text')) return '📝'
  return '📄'
}

function FilesPage() {
  const files = Route.useLoaderData()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(`Uploading ${file.name}...`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error || 'Upload failed')
      }

      setUploadProgress('Upload complete!')
      router.invalidate()
    } catch (error) {
      setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(null), 3000)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDelete = async (key: string) => {
    await deleteFile({ data: key })
    router.invalidate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Files</h1>
        <p className="text-muted-foreground">
          Upload and manage files in R2 storage
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Drag and drop a file or click to browse (max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                or drag and drop here
              </p>
              {uploadProgress && (
                <p className={`text-sm ${uploadProgress.startsWith('Error') ? 'text-destructive' : 'text-primary'}`}>
                  {uploadProgress}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            {files.length} file{files.length !== 1 ? 's' : ''} in storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No files uploaded yet
            </p>
          ) : (
            <div className="divide-y">
              {files.map((file) => (
                <FileRow key={file.key} file={file} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FileRow({
  file,
  onDelete,
}: {
  file: FileItem
  onDelete: (key: string) => Promise<void>
}) {
  const fileName = file.key.replace('uploads/', '').replace(/^\d+-/, '')
  const fileUrl = `/api/files/${encodeURIComponent(file.key)}`

  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl flex-shrink-0">
          {getFileIcon(file.httpMetadata?.contentType)}
        </span>
        <div className="min-w-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline truncate block"
          >
            {fileName}
          </a>
          <p className="text-sm text-muted-foreground">
            {formatBytes(file.size)} • {new Date(file.uploaded).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View
          </a>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{fileName}"? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(file.key)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
