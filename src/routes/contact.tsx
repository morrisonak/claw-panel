import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

export const Route = createFileRoute('/contact')({
  component: Contact,
})

interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
}

function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-12 max-w-2xl">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Let's Build Your Agent
        </h1>
        <p className="text-lg text-muted-foreground">
          Tell us about your business and workflow. We'll respond within 24 hours with recommendations and a quote.
        </p>
      </section>

      {/* Form */}
      <section className="rounded-lg border bg-card p-8">
        {submitted && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
            ✓ Thank you! We'll be in touch soon.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <input
              type="text"
              placeholder="John Smith"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="john@company.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email'
                }
              })}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <input
              type="text"
              placeholder="Your Company"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('company', { required: 'Company is required' })}
            />
            {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tell us about your project</label>
            <textarea
              placeholder="What workflows need automation? What's your primary goal? Any technical constraints?"
              rows={6}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              {...register('message', { required: 'Message is required' })}
            />
            {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </section>

      {/* Contact Info */}
      <section className="space-y-4 py-12 border-t">
        <h2 className="text-lg font-bold">Other ways to connect</h2>
        <div className="space-y-2 text-muted-foreground">
          <p>📧 Email: hello@metavadvisors.com</p>
          <p>💬 Respond to the inquiry form and we'll reach out within 24 hours</p>
        </div>
      </section>
    </div>
  )
}
