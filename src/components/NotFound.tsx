import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">404</h1>
      {children || <p className="text-muted-foreground">Page not found</p>}
      <div className="flex gap-2 mt-4">
        <Button asChild variant="outline">
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Go Back
          </Link>
        </Button>
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}
