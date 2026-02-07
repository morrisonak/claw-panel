import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  type Post,
} from '~/server/posts'

export const Route = createFileRoute('/posts')({
  component: PostsPage,
})

function PostsPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Fetch posts with useQuery
  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts(),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { title: string; content?: string }) =>
      createPost({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setIsCreating(false)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; title: string; content?: string }) =>
      updatePost({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setEditingId(null)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePost({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: number) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateMutation.mutate({
      id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    })
  }

  const handleDelete = async (id: number) => {
    deleteMutation.mutate(id)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Full CRUD demo with server functions
          </p>
        </div>
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive font-medium">Failed to load posts</p>
            <p className="text-muted-foreground text-sm mt-1">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Full CRUD demo with TanStack Query
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>New Post</Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <form onSubmit={handleCreate}>
            <CardHeader>
              <CardTitle>Create Post</CardTitle>
              <CardDescription>Add a new post to the database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  required
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter post content"
                  rows={4}
                  disabled={createMutation.isPending}
                />
              </div>
              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  Failed to create post. Please try again.
                </p>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No posts yet. Create your first post!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isEditing={editingId === post.id}
              isUpdating={updateMutation.isPending && updateMutation.variables?.id === post.id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === post.id}
              onEdit={() => setEditingId(post.id)}
              onCancelEdit={() => setEditingId(null)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({
  post,
  isEditing,
  isUpdating,
  isDeleting,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  post: Post
  isEditing: boolean
  isUpdating: boolean
  isDeleting: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onUpdate: (e: React.FormEvent<HTMLFormElement>, id: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  if (isEditing) {
    return (
      <Card>
        <form onSubmit={(e) => onUpdate(e, post.id)}>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`title-${post.id}`}>Title</Label>
              <Input
                id={`title-${post.id}`}
                name="title"
                defaultValue={post.title}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`content-${post.id}`}>Content</Label>
              <Textarea
                id={`content-${post.id}`}
                name="content"
                defaultValue={post.content ?? ''}
                rows={4}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className={isDeleting ? 'opacity-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>
              {new Date(post.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{post.title}"? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(post.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      {post.content && (
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {post.content}
          </p>
        </CardContent>
      )}
    </Card>
  )
}
