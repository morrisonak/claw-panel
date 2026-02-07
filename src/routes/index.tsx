import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { ArrowRight, Zap, Brain, BarChart3 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="space-y-6 py-12">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Custom AI Agents for Revenue Growth
          </h1>
          <p className="text-xl text-muted-foreground">
            We build, deploy, and manage intelligent agents tailored to your business. Automate workflows, accelerate revenue, and scale with zero technical overhead.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/contact">
            <Button size="lg" className="gap-2">
              Start Your Agent <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From consultation to deployment, we handle everything
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <ProcessCard
            step="1"
            title="Discovery"
            description="We understand your business, workflows, and growth goals"
          />
          <ProcessCard
            step="2"
            title="Design & Build"
            description="Custom agent architecture designed for your exact needs"
          />
          <ProcessCard
            step="3"
            title="Deploy & Optimize"
            description="Full hosting, monitoring, and continuous tuning included"
          />
        </div>
      </section>

      {/* Why Agents */}
      <section className="space-y-8 py-12 border-t">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">Why AI Agents</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <BenefitCard
            icon={<Brain className="w-8 h-8" />}
            title="Always On"
            description="Agents work 24/7 with zero downtime or human intervention"
          />
          <BenefitCard
            icon={<Zap className="w-8 h-8" />}
            title="Smart Automation"
            description="Intelligent decision-making tailored to your business logic"
          />
          <BenefitCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Measurable ROI"
            description="Track impact in real-time with built-in analytics"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to automate and scale?</h2>
        <p className="text-lg opacity-90">
          Let's talk about your first agent.
        </p>
        <Link to="/contact">
          <Button variant="secondary" size="lg" className="gap-2">
            Schedule a Consultation <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

function ProcessCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {step}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3">
      <div className="text-primary">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
