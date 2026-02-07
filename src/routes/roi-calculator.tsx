import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

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

export const Route = createFileRoute('/roi-calculator')({
  beforeLoad: async () => {
    await checkAuth()
  },
  component: ROICalculator,
})

function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  const [hourlyRate, setHourlyRate] = useState('50')
  const [teamSize, setTeamSize] = useState('3')
  const [automationPercent, setAutomationPercent] = useState(75)
  const [tier, setTier] = useState('growth')

  // Calculations
  const hourlyRateNum = parseFloat(hourlyRate) || 0
  const teamSizeNum = parseInt(teamSize) || 1

  // Annual current cost
  const annualHours = hoursPerWeek * 52 * teamSizeNum
  const annualCost = annualHours * hourlyRateNum

  // Savings from automation
  const automatedHours = annualHours * (automationPercent / 100)
  const annualSavings = automatedHours * hourlyRateNum

  // Service cost
  const tiers: Record<string, { upfront: number; monthly: number; label: string }> = {
    starter: { upfront: 3000, monthly: 200, label: 'Starter' },
    growth: { upfront: 8000, monthly: 500, label: 'Growth' },
    enterprise: { upfront: 15000, monthly: 1000, label: 'Enterprise' },
  }

  const selectedTier = tiers[tier]
  const yearOneCost = selectedTier.upfront + selectedTier.monthly * 12
  const netSavingsYear1 = annualSavings - yearOneCost
  const paybackMonths = yearOneCost > 0 ? Math.ceil((yearOneCost / annualSavings) * 12) : 0
  const yearsToPayback = (paybackMonths / 12).toFixed(1)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">AI Agent ROI Calculator</h1>
        <p className="text-lg text-muted-foreground">
          See how much your team could save by automating manual workflows. Enter your details below.
        </p>
      </section>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Input Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>Tell us about your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hours per week */}
            <div className="space-y-2">
              <Label htmlFor="hours">Hours/week on this task</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="40"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Math.min(40, Math.max(1, parseInt(e.target.value) || 0)))}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                That's {(hoursPerWeek * 52).toLocaleString()} hours per year
              </p>
            </div>

            {/* Hourly rate */}
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min="10"
                max="500"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Annual cost: ${annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Team size */}
            <div className="space-y-2">
              <Label htmlFor="team">Team size affected</Label>
              <Input
                id="team"
                type="number"
                min="1"
                max="10"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)).toString())}
                placeholder="3"
              />
              <p className="text-xs text-muted-foreground">
                How many people spend time on this task
              </p>
            </div>

            {/* Automation percentage */}
            <div className="space-y-2">
              <Label htmlFor="automation">Automation coverage (%)</Label>
              <Input
                id="automation"
                type="number"
                min="10"
                max="100"
                step="5"
                value={automationPercent}
                onChange={(e) => setAutomationPercent(Math.min(100, Math.max(10, parseInt(e.target.value) || 0)))}
                placeholder="75"
              />
              <p className="text-xs text-muted-foreground">
                What % of the task can be automated
              </p>
            </div>

            {/* Service tier */}
            <div className="space-y-2">
              <Label htmlFor="tier">Service tier</Label>
              <div className="space-y-2">
                {['starter', 'growth', 'enterprise'].map((t) => (
                  <label key={t} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent" style={{ backgroundColor: tier === t ? 'var(--primary)' : 'transparent', color: tier === t ? 'white' : 'inherit' }}>
                    <input
                      type="radio"
                      name="tier"
                      value={t}
                      checked={tier === t}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium capitalize">
                      {t === 'starter' && 'Starter ($3K upfront)'}
                      {t === 'growth' && 'Growth ($8K upfront)'}
                      {t === 'enterprise' && 'Enterprise ($15K+ upfront)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <MetricBox
              label="Annual Savings"
              value={`$${annualSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              description={`${automatedHours.toLocaleString('en-US', { maximumFractionDigits: 0 })} hours freed up`}
              icon={DollarSign}
              color="green"
            />
            <MetricBox
              label="Year 1 Cost"
              value={`$${yearOneCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              description={`${selectedTier.label}: $${selectedTier.upfront.toLocaleString()} + $${selectedTier.monthly.toLocaleString()}/mo`}
              icon={Clock}
              color="blue"
            />
            <MetricBox
              label="Payback Period"
              value={paybackMonths <= 12 ? `${paybackMonths} months` : `${yearsToPayback} years`}
              description={`Break-even in ${yearsToPayback === '1.0' ? 'year 1' : `~${yearsToPayback} years`}`}
              icon={TrendingUp}
              color={paybackMonths <= 6 ? 'green' : paybackMonths <= 12 ? 'yellow' : 'orange'}
            />
            <MetricBox
              label="Net Savings (Year 1)"
              value={`$${netSavingsYear1.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              description={`Savings minus service cost`}
              icon={CheckCircle2}
              color={netSavingsYear1 > 0 ? 'green' : 'red'}
            />
          </div>

          {/* Year-by-year breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Year-by-Year Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((year) => {
                  const yearCost = year === 1 ? yearOneCost : selectedTier.monthly * 12
                  const yearSavings = annualSavings
                  const yearProfit = yearSavings - yearCost
                  const cumulativeProfit = (year === 1 ? yearProfit : (year - 1) * yearProfit + yearProfit)

                  return (
                    <div key={year} className="grid gap-2 p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Year {year}</span>
                        <span className={yearProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                          {yearProfit > 0 ? '+' : ''} ${yearProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Savings from automation:</span>
                          <span>${yearSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Service cost:</span>
                          <span>${yearCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-foreground">
                          <span>Cumulative profit:</span>
                          <span>${cumulativeProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                <h3 className="text-lg font-semibold">
                  Ready to see this in action?
                </h3>
                <p className="text-sm opacity-90">
                  Schedule a 20-minute consultation to discuss your specific workflows and create a custom implementation plan.
                </p>
                <a href="/contact">
                  <Button variant="secondary" size="lg">
                    Schedule Free Consultation
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-muted rounded-lg border text-sm text-muted-foreground">
        <p>
          <strong>Disclaimer:</strong> This calculator provides estimates based on your inputs. Actual savings may vary depending on workflow complexity, integration requirements, and other factors. We'll provide detailed, personalized projections during your consultation.
        </p>
      </div>
    </div>
  )
}

function MetricBox({
  label,
  value,
  description,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  description: string
  icon: React.ComponentType<{ className: string }>
  color: 'green' | 'blue' | 'yellow' | 'orange' | 'red'
}) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  }

  return (
    <Card className={`${colors[color]} border-2`}>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium opacity-75">{label}</p>
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs opacity-75">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
