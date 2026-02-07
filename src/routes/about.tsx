import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="space-y-12 max-w-3xl">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">About MetaV Advisors</h1>
        <p className="text-lg text-muted-foreground">
          We specialize in designing and deploying intelligent AI agents that drive measurable business growth.
        </p>
      </section>

      {/* Mission */}
      <section className="space-y-4 py-8 border-t">
        <h2 className="text-2xl font-bold">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Most businesses aren't using AI effectively. Teams are still doing manual work, missing revenue opportunities, and struggling to scale. We build intelligent agents that work 24/7 to automate workflows, accelerate decision-making, and unlock revenue growth. No hype, no templates. Just custom agents engineered for your specific business needs.
        </p>
      </section>

      {/* Approach */}
      <section className="space-y-6 py-8 border-t">
        <h2 className="text-2xl font-bold">Our Approach</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Deep Understanding</h3>
            <p className="text-muted-foreground">
              We spend time understanding your workflows, constraints, and business model. Generic agents don't drive results.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Custom Engineering</h3>
            <p className="text-muted-foreground">
              Every agent is built from the ground up for your requirements. We integrate with your existing systems and data flows.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Full Ownership</h3>
            <p className="text-muted-foreground">
              We handle hosting, monitoring, optimization, and support. You focus on business; we focus on the agent.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Measurable Results</h3>
            <p className="text-muted-foreground">
              Built-in analytics track agent performance against your KPIs. We optimize based on real data.
            </p>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="space-y-6 py-8 border-t">
        <h2 className="text-2xl font-bold">Why Choose MetaV Advisors</h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              ✓
            </div>
            <div>
              <p className="font-semibold">Expert Team</p>
              <p className="text-sm text-muted-foreground">Engineers with deep experience in AI, APIs, and business automation</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              ✓
            </div>
            <div>
              <p className="font-semibold">No Code Overhead</p>
              <p className="text-sm text-muted-foreground">You don't need a tech team. We build and operate everything</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              ✓
            </div>
            <div>
              <p className="font-semibold">Transparent Pricing</p>
              <p className="text-sm text-muted-foreground">Clear tiers based on complexity. No surprise costs</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              ✓
            </div>
            <div>
              <p className="font-semibold">Ongoing Support</p>
              <p className="text-sm text-muted-foreground">From launch through optimization. We're here for the long term</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 border-t text-center">
        <p className="text-muted-foreground mb-4">Ready to learn more?</p>
        <a href="/contact" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition">
          Schedule a Consultation
        </a>
      </section>
    </div>
  )
}
