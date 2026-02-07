import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button } from '~/components/ui/button'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg z-50">
          <nav className="flex flex-col p-4 space-y-3">
            <Link
              to="/services"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              Services
            </Link>
            <Link
              to="/roi-calculator"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              ROI Calculator
            </Link>
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              Contact
            </Link>
            <Link
              to="/marketing-plan"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              Marketing Plan
            </Link>
            <Link
              to="/business-plan"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent text-sm font-medium"
            >
              Business Plan
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
