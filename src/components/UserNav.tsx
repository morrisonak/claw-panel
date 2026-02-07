import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { useSession, signOut } from '~/lib/auth-client'

export function UserNav() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="hover:text-primary"
          activeProps={{ className: 'text-primary' }}
        >
          Dashboard
        </Link>
        <Link
          to="/profile"
          className="hover:text-primary"
          activeProps={{ className: 'text-primary' }}
        >
          Profile
        </Link>
        <span className="text-muted-foreground">
          {session.user.name || session.user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await signOut()
            window.location.href = '/'
          }}
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login">Sign In</Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/signup">Sign Up</Link>
      </Button>
    </div>
  )
}
