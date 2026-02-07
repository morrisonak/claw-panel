import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Check, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/services')({
  component: Services,
})

function Services() {
  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Custom AI Agent Services
        </h1>
        <p className="text-lg text-muted-foreground">
          We design and deploy intelligent agents that integrate seamlessly with your existing workflows.
        </p>
      </section>

      {/* Service Tiers */}
      <section className="grid gap-8 md:grid-cols-3">
        <ServiceTier
          name="Starter Agent"
          description="Single-purpose agent for a specific workflow"
          price="$3,000"
          features={[
            "Custom agent design",
            "One core workflow automation",
            "Cloud hosting (6 months included)",
            "Basic monitoring & alerts",
            "Email support"
          ]}
        />
        <ServiceTier
          name="Growth Agent"
          description="Multi-workflow agent with integrations"
          price="$8,000"
          featured
          features={[
            "Everything in Starter",
            "Up to 3 integrated workflows",
            "External API integrations",
            "Custom analytics dashboard",
            "Priority support",
            "Quarterly optimization reviews"
          ]}
        />
        <ServiceTier
          name="Enterprise Agent"
          description="Complex multi-agent system"
          price="Custom"
          features={[
            "Everything in Growth",
            "Unlimited workflows & agents",
            "Team collaboration tools",
            "Advanced security & compliance",
            "Dedicated account manager",
            "Monthly strategy sessions"
          ]}
        />
      </section>

      {/* What's Included */}
      <section className="space-y-8 py-12 border-t">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">What's Included</h2>
          <p className="text-muted-foreground">
            Every agent package includes full support and hosting
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <IncludedItem
            title="Custom Development"
            description="Architecture and code built specifically for your requirements"
          />
          <IncludedItem
            title="Full Hosting"
            description="Serverless deployment on Cloudflare infrastructure"
          />
          <IncludedItem
            title="Continuous Monitoring"
            description="Real-time alerts and performance tracking"
          />
          <IncludedItem
            title="Fine-Tuning"
            description="Ongoing optimization based on performance data"
          />
          <IncludedItem
            title="Documentation"
            description="Complete guides and system documentation"
          />
          <IncludedItem
            title="Support"
            description="Email/priority support depending on tier"
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="space-y-8 py-12 border-t">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Common Use Cases</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <UseCase
            title="Lead Qualification"
            description="Automatically qualify and score incoming leads 24/7"
          />
          <UseCase
            title="Customer Support"
            description="Handle routine inquiries, escalate complex issues"
          />
          <UseCase
            title="Data Processing"
            description="Transform, validate, and analyze business data automatically"
          />
          <UseCase
            title="Workflow Automation"
            description="Connect systems, trigger actions, sync data across platforms"
          />
          <UseCase
            title="Revenue Operations"
            description="Optimize sales workflows, improve forecasting accuracy"
          />
          <UseCase
            title="Content Generation"
            description="Create reports, summaries, and personalized communications"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Let's discuss your agent</h2>
        <p>
          Every business is different. Schedule a consultation to explore the right solution for you.
        </p>
        <Link to="/contact">
          <Button variant="secondary" size="lg" className="gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

function ServiceTier({
  name,
  description,
  price,
  features,
  featured,
}: {
  name: string
  description: string
  price: string
  features: string[]
  featured?: boolean
}) {
  return (
    <div className={`rounded-lg border p-6 space-y-6 ${featured ? 'border-primary bg-primary/5' : 'bg-card'}`}>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{price}</div>
      </div>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm">
            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function IncludedItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function UseCase({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
