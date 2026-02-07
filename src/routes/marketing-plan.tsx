import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { TrendingUp, Target, Zap, BookOpen, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'

const checkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  const cookie = headers.get('cookie')

  if (!cookie) {
    throw redirect({ to: '/login' })
  }

  const match = cookie.match(/auth_token=([^;]+)/)
  const token = match ? match[1] : null

  if (!token) {
    throw redirect({ to: '/login' })
  }

  return { authenticated: true }
})

export const Route = createFileRoute('/marketing-plan')({
  beforeLoad: async () => {
    await checkAuth()
  },
  component: MarketingPlan,
})

function MarketingPlan() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Marketing Plan & Outreach Strategy</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          B2B go-to-market strategy targeting mid-market companies (50-500 employees) who need AI automation.
          Direct outreach + content marketing + community engagement. Target: 9 clients and $3.5K MRR by month 6.
        </p>
      </section>

      {/* Key Metrics */}
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Outreach/Week"
          value="20-30"
          description="LinkedIn + email touches"
          icon={Zap}
        />
        <MetricCard
          title="Response Rate"
          value="10-15%"
          description="Qualified conversations"
          icon={TrendingUp}
        />
        <MetricCard
          title="Deals/Month"
          value="1-2"
          description="Initial target"
          icon={Target}
        />
        <MetricCard
          title="6-Month Goal"
          value="9 clients"
          description="$3.5K MRR gross"
          icon={BookOpen}
        />
      </section>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 pb-4 border-b">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'personas', label: 'Personas' },
          { id: 'channels', label: 'Channels' },
          { id: 'funnel', label: 'Sales Funnel' },
          { id: 'timeline', label: 'Timeline' },
        ].map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'default' : 'outline'}
            onClick={() => setActiveSection(item.id)}
            size="sm"
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && <OverviewSection />}
      {activeSection === 'personas' && <PersonasSection />}
      {activeSection === 'channels' && <ChannelsSection />}
      {activeSection === 'funnel' && <FunnelSection />}
      {activeSection === 'timeline' && <TimelineSection />}

      {/* Key Success Factors */}
      <Card className="border-primary/50 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Key Success Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Personalization: Every outreach should reference something specific about their company/industry',
              'Speed: Respond to inquiries within 24h, send proposals within 24h of discovery call',
              'Focus: Start with Ops tier, then expand to Sales/CS. Don\'t chase enterprise without proof.',
              'Referrals: $500 referral fee drives word-of-mouth faster than paid ads',
              'Measurement: Track response rates, close rates, CAC every week. Adjust messaging weekly.',
            ].map((factor, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Model & Customer Fit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Pricing Tiers</h4>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { name: 'Starter', upfront: '$3K', monthly: '$200', focus: 'Single workflow' },
                { name: 'Growth', upfront: '$8K', monthly: '$500', focus: 'Multi-workflow' },
                { name: 'Enterprise', upfront: '$15K+', monthly: '$1K+', focus: 'Complex systems' },
              ].map((tier) => (
                <div key={tier.name} className="p-3 border rounded-lg">
                  <p className="font-semibold">{tier.name}</p>
                  <p className="text-sm text-muted-foreground">{tier.focus}</p>
                  <p className="text-sm mt-2"><span className="font-semibold">{tier.upfront}</span> upfront</p>
                  <p className="text-sm"><span className="font-semibold">{tier.monthly}</span>/mo</p>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Target Companies</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 50-500 employees</li>
              <li>• $5M-$100M revenue</li>
              <li>• Operations, Sales, or Customer Success focused</li>
              <li>• Dealing with manual workflow bottlenecks</li>
              <li>• Budget allocated to operational improvements</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6-Month Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Deals Closed', value: '9' },
              { label: 'MRR (Gross)', value: '$3.5K' },
              { label: 'MRR (Profit)', value: '$2.625K' },
              { label: 'CAC Payback', value: '< 3 months' },
              { label: 'Close Rate', value: '40-60%' },
              { label: 'Pipeline', value: '10-12 conversations' },
            ].map((metric) => (
              <div key={metric.label} className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PersonasSection() {
  const personas = [
    {
      name: 'VP of Operations',
      titles: 'VP Ops, Director of Operations, COO',
      size: '100-300 employees',
      painPoints: [
        'Manual data entry & spreadsheet management',
        'Siloed systems (CRM, ERP, communication)',
        'Team spending 20+ hours/week on routine tasks',
        'Scaling operations without hiring',
      ],
      timeline: '2-4 weeks',
    },
    {
      name: 'VP of Sales / RevOps',
      titles: 'VP Sales, Director of Sales Ops, RevOps Manager',
      size: '50-200 employees',
      painPoints: [
        'Sales reps spending 5+ hours/week on admin',
        'Opportunity leakage in pipeline',
        'Forecasting inaccuracy',
        'Lead qualification bottleneck',
      ],
      timeline: '2-6 weeks',
    },
    {
      name: 'Head of Customer Success',
      titles: 'VP Customer Success, Director of Support',
      size: '100-500 employees',
      painPoints: [
        'Support team overwhelmed (ticket backlog)',
        'Routine questions = 60% of tickets',
        'Slow response times frustrating customers',
        'Cannot proactively identify at-risk customers',
      ],
      timeline: '4-8 weeks',
    },
    {
      name: 'CEO / Founder (SaaS)',
      titles: 'CEO, Founder, CPO',
      size: '20-150 employees',
      painPoints: [
        'Scaling without proportional headcount',
        'Manual customer data workflows',
        'Content generation',
        'Internal knowledge base management',
      ],
      timeline: '1-3 weeks',
    },
  ]

  return (
    <div className="space-y-4">
      {personas.map((persona) => (
        <Card key={persona.name}>
          <CardHeader>
            <CardTitle className="text-lg">{persona.name}</CardTitle>
            <CardDescription>{persona.titles} • {persona.size}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Pain Points</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {persona.painPoints.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm"><span className="font-semibold">Decision Timeline:</span> {persona.timeline}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChannelsSection() {
  const channels = [
    {
      name: 'Direct Outreach (40%)',
      description: 'Highest ROI - LinkedIn + Email + Warm Intros',
      tactics: [
        'LinkedIn Sales Navigator: 10-15 messages/day to VPs',
        'Email outreach: 5-10 personalized emails/day (3-touch sequence)',
        'Referral incentive: $500 per closed deal',
        'Warm intros: Ask existing contacts for introductions',
      ],
      kpi: '10-15% response rate → 2-3 calls/week',
    },
    {
      name: 'Content Marketing (25%)',
      description: 'Drive organic discovery + nurture track',
      tactics: [
        'Blog posts targeting pain points (40+ hours on manual work)',
        'Guest posts on Drift, ProductHunt, Revenue.io, Zapier',
        'LinkedIn newsletter: weekly insights + CTA',
        'Case studies & customer testimonials',
      ],
      kpi: 'Low-cost leads over time; drives organic search',
    },
    {
      name: 'Community & Events (20%)',
      description: 'Thought leadership + warm networking',
      tactics: [
        'Slack communities: answer Q&s, share insights',
        'Industry meetups & conferences: 5-10 warm intros per event',
        'Webinar: "Build Your First AI Agent in 3 Hours"',
        'Sponsorships: booth/table at Revenue/AI conferences',
      ],
      kpi: 'Relationship building; 50% of attendees convert',
    },
    {
      name: 'Paid Ads (10%)',
      description: 'Amplify reach once organic is working',
      tactics: [
        'LinkedIn ads: $500-1K/month targeting job titles',
        'Google search ads: automation keywords ($300-500/month)',
        'Retargeting: website visitors + LinkedIn engagers',
      ],
      kpi: '$20-40 per qualified lead (test only)',
    },
  ]

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <Card key={channel.name}>
          <CardHeader>
            <CardTitle className="text-lg">{channel.name}</CardTitle>
            <CardDescription>{channel.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Tactics</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {channel.tactics.map((tactic) => (
                  <li key={tactic}>• {tactic}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm"><span className="font-semibold">KPI:</span> {channel.kpi}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function FunnelSection() {
  const stages = [
    {
      stage: '1. Awareness',
      goal: 'Get the right person to know we exist',
      tactics: ['LinkedIn outreach', 'Blog posts', 'Community participation'],
      kpi: '20-30 outreach/week → 10% response = 2-3 conversations/week',
    },
    {
      stage: '2. Interest',
      goal: 'Show them we understand their problem',
      tactics: ['Discovery call (20 min)', 'Share relevant case study', 'Invite to webinar'],
      kpi: '50% of conversations → qualify as potential fit',
    },
    {
      stage: '3. Consideration',
      goal: 'Show them the ROI',
      tactics: ['Free ROI calculator', 'Light audit', 'Proposal for obvious fits'],
      kpi: '70% of qualified leads → request proposal',
    },
    {
      stage: '4. Decision',
      goal: 'Remove friction, close the deal',
      tactics: ['Clear pricing', 'Simple 1-page SOW', 'Fast onboarding (5 days)'],
      kpi: '40-60% close rate → 1-2 deals/month',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {stages.map((stage) => (
          <Card key={stage.stage}>
            <CardHeader>
              <CardTitle className="text-base">{stage.stage}</CardTitle>
              <CardDescription>{stage.goal}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Tactics</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {stage.tactics.map((tactic) => (
                    <li key={tactic}>• {tactic}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">KPI:</span> {stage.kpi}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-base">Sales Process Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Discovery Call (20 min)</p>
            <p className="opacity-90">• What's your biggest operational headache?<br/>• How many hours/week is this costing?<br/>• What have you already tried?<br/>• What's your timeline?</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Proposal (24h turnaround)</p>
            <p className="opacity-90">• Problem + solution (1 page)<br/>• 3-5 specific workflows to automate<br/>• 3-week build + 2-week optimization<br/>• Pricing & success metrics</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Onboarding (3 weeks)</p>
            <p className="opacity-90">Day 1: Kick-off | Days 2-5: Requirements | Days 6-14: Development | Days 15-21: Testing + go-live | Ongoing: Monthly management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineSection() {
  const phases = [
    { month: 'Month 1', title: 'Foundation', goal: '3-5 discovery calls', status: 'Start' },
    { month: 'Month 2', title: 'Traction', goal: '1 deal, 5 calls', status: 'Scaling' },
    { month: 'Month 3', title: 'Momentum', goal: '$11K MRR', status: 'Accelerating' },
    { month: 'Month 4', title: 'Scale', goal: '$19K MRR', status: 'Optimizing' },
    { month: 'Month 5', title: 'Optimization', goal: '$25K MRR', status: 'Refining' },
    { month: 'Month 6', title: 'Predictable', goal: '9 clients, $35K MRR', status: 'Sustainable' },
  ]

  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <Card key={phase.month}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{phase.month}: {phase.title}</CardTitle>
                <CardDescription className="mt-1">Target: {phase.goal}</CardDescription>
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                {phase.status}
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Full Details Available</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>See <code className="bg-muted px-2 py-1 rounded text-xs">MARKETING.md</code> in the project root for:</p>
          <ul className="mt-3 space-y-1 ml-4">
            <li>• Detailed 6-month timeline with tasks and metrics</li>
            <li>• Outreach templates (LinkedIn, email, follow-up)</li>
            <li>• Weekly KPI targets</li>
            <li>• Contingency plans</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className: string }>
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
