import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

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

export const Route = createFileRoute('/business-plan')({
  beforeLoad: async () => {
    await checkAuth()
  },
  component: BusinessPlan,
})

function BusinessPlan() {
  const tiers = [
    {
      name: 'Starter Agent',
      upfrontPrice: 3000,
      monthlyPrice: 200,
      workPerProject: 4, // hours for upfront consulting (template-based)
      upfrontMargin: 0.60, // 60% healthy consulting margin
      monthlyMargin: 0.75, // 75% healthy SaaS margin
    },
    {
      name: 'Growth Agent',
      upfrontPrice: 8000,
      monthlyPrice: 500,
      workPerProject: 10, // hours for upfront consulting (template-based)
      upfrontMargin: 0.60,
      monthlyMargin: 0.75,
    },
    {
      name: 'Enterprise Agent',
      upfrontPrice: 15000,
      monthlyPrice: 1000,
      workPerProject: 20, // hours for upfront consulting (custom architecture)
      upfrontMargin: 0.60,
      monthlyMargin: 0.75,
    },
  ]

  // Hourly rate (template-based implementation)
  const hourlyRate = 100 // $100/hr (efficient template-based work)

  // Per-tier profitability analysis
  const tierAnalysis = tiers.map((tier) => {
    // Upfront consulting economics
    const upfrontCost = tier.workPerProject * hourlyRate
    const upfrontProfit = tier.upfrontPrice * tier.upfrontMargin
    const upfrontOverhead = tier.upfrontPrice - upfrontProfit
    const upfrontMarginPct = (tier.upfrontMargin * 100).toFixed(1)

    // Monthly maintenance economics
    const monthlyCost = tier.monthlyPrice * (1 - tier.monthlyMargin)
    const monthlyProfit = tier.monthlyPrice * tier.monthlyMargin
    const monthlyMarginPct = (tier.monthlyMargin * 100).toFixed(1)

    // Annual (1 project + 12 months maintenance)
    const annualUpfrontProfit = upfrontProfit
    const annualMonthlyProfit = monthlyProfit * 12
    const annualTotalProfit = annualUpfrontProfit + annualMonthlyProfit
    const annualRevenue = tier.upfrontPrice + tier.monthlyPrice * 12

    return {
      ...tier,
      upfrontCost,
      upfrontProfit,
      upfrontMarginPct,
      monthlyCost,
      monthlyProfit,
      monthlyMarginPct,
      annualUpfrontProfit,
      annualMonthlyProfit,
      annualTotalProfit,
      annualRevenue,
    }
  })

  // Portfolio metrics at scale (9 clients: 5 starter, 3 growth, 1 enterprise)
  const portfolioMRR = 
    (5 * tierAnalysis[0].monthlyPrice) +
    (3 * tierAnalysis[1].monthlyPrice) +
    (1 * tierAnalysis[2].monthlyPrice)
  
  const portfolioMonthlyProfit = 
    (5 * tierAnalysis[0].monthlyProfit) +
    (3 * tierAnalysis[1].monthlyProfit) +
    (1 * tierAnalysis[2].monthlyProfit)

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Business Plan & Financials</h1>
        <p className="text-muted-foreground">
          Unit economics, hosting costs, and profitability analysis per service tier
        </p>
      </div>

      {/* Simplified - cost section removed for clarity */}

      {/* Cost Breakdown */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Monthly Operating Cost Baseline</h2>
          <p className="text-sm text-muted-foreground">
            Fixed overhead per client agent (before profit)
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Anthropic API ($100/mo max plan)</span>
                <span className="font-mono">$100</span>
              </div>
              <div className="flex justify-between">
                <span>DigitalOcean Droplet (2vCPU/2GB base)</span>
                <span className="font-mono">$12</span>
              </div>
              <div className="flex justify-between">
                <span>Monitoring & Support (shared)</span>
                <span className="font-mono">$5</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Cost Per Client/Mo</span>
                <span className="font-mono">$117</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Infrastructure: DigitalOcean 2vCPU/2GB ($12/mo) handles Starter/Growth agents; Enterprise may need dedicated $24/mo. At scale, consolidate multiple clients on shared servers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scale Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>5 Starter + 3 Growth clients on 1 × $12/mo server</span>
              <span className="font-bold">$2.40/client</span>
            </div>
            <div className="flex justify-between">
              <span>1 Enterprise client on 1 × $24/mo server</span>
              <span className="font-bold">$24/client</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Avg infrastructure cost (9 clients)</span>
              <span className="font-bold">$5.30/client</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Anthropic remains fixed at $100/mo per client. Total: ~$105/client at scale. Still 75%+ margin on monthly fees.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Per-Tier Unit Economics */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Per-Tier Unit Economics (Healthy Margins)</h2>
          <p className="text-sm text-muted-foreground">
            60% upfront consulting margin, 75% monthly SaaS margin. $150/hr labor.
          </p>
        </div>

        <div className="space-y-4">
          {tierAnalysis.map((tier) => (
            <Card key={tier.name} className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upfront Consulting */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Initial Consulting Project</h4>
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">YOUR CHARGE</p>
                      <p className="text-2xl font-bold">${tier.upfrontPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">YOUR COST (Labor)</p>
                      <p className="text-2xl font-bold">${tier.upfrontCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">YOUR PROFIT</p>
                      <p className="text-2xl font-bold text-green-600">${Math.round(tier.upfrontProfit).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{tier.upfrontMarginPct}% margin on ${tier.upfrontPrice.toLocaleString()} sale</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3">Monthly Maintenance (Recurring)</h4>
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">CHARGE /MONTH</p>
                      <p className="text-2xl font-bold">${tier.monthlyPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">COST /MONTH</p>
                      <p className="text-2xl font-bold">${Math.round(tier.monthlyCost).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">PROFIT /MONTH</p>
                      <p className="text-2xl font-bold text-green-600">${Math.round(tier.monthlyProfit).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{tier.monthlyMarginPct}% margin (API + infra costs covered)</p>
                </div>

                <div className="border-t pt-4 space-y-2 p-3 rounded">
                  <div className="flex justify-between font-semibold text-sm">
                    <span>YEAR 1 TOTAL (Initial + 12 months)</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue from this client</span>
                    <span className="font-bold">${tier.annualRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your total profit</span>
                    <span className="font-bold text-green-600">${Math.round(tier.annualTotalProfit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Blended margin</span>
                    <span className="text-green-600">{((tier.annualTotalProfit / tier.annualRevenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recurring Revenue at Scale */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Monthly Recurring Revenue (MRR) at Scale</h2>
          <p className="text-sm text-muted-foreground">
            Portfolio of 9 active clients (5 Starter, 3 Growth, 1 Enterprise)
          </p>
        </div>

        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>5 Starter clients @ ${tierAnalysis[0].monthlyPrice}/mo</span>
                  <span className="font-bold">${(5 * tierAnalysis[0].monthlyPrice).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>3 Growth clients @ ${tierAnalysis[1].monthlyPrice}/mo</span>
                  <span className="font-bold">${(3 * tierAnalysis[1].monthlyPrice).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>1 Enterprise client @ ${tierAnalysis[2].monthlyPrice}/mo</span>
                  <span className="font-bold">${(1 * tierAnalysis[2].monthlyPrice).toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total MRR (Gross Revenue)</span>
                  <span className="text-orange-600">${portfolioMRR.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Monthly Profit (after API + Infra)</span>
                  <span className="text-green-600">${Math.round(portfolioMonthlyProfit).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Annual Recurring Profit</span>
                  <span className="text-green-600">${Math.round(portfolioMonthlyProfit * 12).toLocaleString()}/yr</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plus: Initial Consulting Upfront</CardTitle>
            <CardDescription>One-time revenue when onboarding new clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Starter agents</span>
              <span className="font-bold text-green-600">$1,800 profit each</span>
            </div>
            <div className="flex justify-between">
              <span>Growth agents</span>
              <span className="font-bold text-green-600">$4,800 profit each</span>
            </div>
            <div className="flex justify-between">
              <span>Enterprise agents</span>
              <span className="font-bold text-green-600">$9,000 profit each</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Anthropic API Costs */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Anthropic API Strategy</h2>
          <p className="text-sm text-muted-foreground">
            API costs must be covered by monthly maintenance fees
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Starter:</strong> $100/mo max plan
                <p className="text-xs text-muted-foreground">Single workflow agent, lower usage</p>
              </li>
              <li>
                <strong>Growth:</strong> $100-150/mo
                <p className="text-xs text-muted-foreground">Multi-workflow, higher request volume</p>
              </li>
              <li>
                <strong>Enterprise:</strong> $200-300/mo (custom)
                <p className="text-xs text-muted-foreground">High-volume, dedicated support from Anthropic</p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg">⚠️ Important: Monthly Fees Must Cover API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Your monthly maintenance fee needs to fully cover Anthropic API costs. Don't let clients eat into your margin.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Starter $200/mo = $100 Anthropic + $100 profit/ops</li>
              <li>Growth $500/mo = $125 Anthropic + $375 profit/ops</li>
              <li>Enterprise $1,000+/mo = $250 Anthropic + $750+ profit/ops</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Hosting Recommendation */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Hosting Strategy & Recommendation</h2>
        </div>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Cloudflare: Official Standard for All Web Hosting</CardTitle>
            <CardDescription>
              Marketing site, APIs, and edge compute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>MetaV Advisors site:</strong> Hosted on Cloudflare Workers</li>
              <li>✅ <strong>All APIs:</strong> Cloudflare Workers edge compute</li>
              <li>✅ <strong>Database:</strong> D1 (serverless SQLite at the edge)</li>
              <li>✅ <strong>Storage:</strong> R2 (S3-compatible, no egress fees)</li>
              <li>✅ <strong>Caching & KV:</strong> Global KV for state/settings</li>
              <li>✅ <strong>Cost:</strong> Scales infinitely, zero infrastructure management, predictable billing</li>
              <li>⚠️ <strong>Never:</strong> Vercel, Netlify, or alternative platforms — Cloudflare only</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Infrastructure Split: Cloudflare + DigitalOcean</CardTitle>
            <CardDescription>
              Optimal for agent consulting model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Cloudflare:</strong> Marketing site, APIs, edge compute (cost: $0-50/mo depending on scale)</li>
              <li>✅ <strong>DigitalOcean Droplets:</strong> Agent hosting (2vCPU/2GB @ $12/mo per agent base)</li>
              <li>✅ <strong>Anthropic API:</strong> AI backbone ($100/mo per client, covered by monthly fee)</li>
              <li>✅ <strong>No PaaS overhead:</strong> Both platforms are predictable, linear cost</li>
              <li>✅ <strong>Scaling path:</strong> Consolidate agents on shared DO servers as portfolio grows</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Official Hosting Strategy: Cloudflare Only</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Marketing Site:</strong> Cloudflare Workers (free tier covers site hosting)</li>
              <li>✅ <strong>Client Agents:</strong> Hosted on DigitalOcean (2vCPU/2GB @ $12/mo base)</li>
              <li>✅ <strong>All APIs & Edge Logic:</strong> Cloudflare Workers + D1 + R2 + KV</li>
              <li>✅ <strong>No alternative platforms:</strong> Cloudflare is the standard for all web infrastructure</li>
              <li>💡 Cloudflare scales infinitely, costs scale linearly, zero infrastructure management</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Summary & Margins */}
      <section className="space-y-4 pb-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Summary: Healthy Margin Model</h2>
          <p className="text-sm text-muted-foreground">
            60% upfront consulting + 75% monthly SaaS margins
          </p>
        </div>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-lg">Pricing & Margins by Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold">Starter: $3,000 + $200/mo</p>
                <div className="grid grid-cols-2 gap-2 mt-1 ml-2">
                  <div>Upfront Profit: <span className="font-bold text-green-600">$1,800 (60%)</span></div>
                  <div>Monthly Profit: <span className="font-bold text-green-600">$150 (75%)</span></div>
                </div>
              </div>
              <div>
                <p className="font-bold">Growth: $8,000 + $500/mo</p>
                <div className="grid grid-cols-2 gap-2 mt-1 ml-2">
                  <div>Upfront Profit: <span className="font-bold text-green-600">$4,800 (60%)</span></div>
                  <div>Monthly Profit: <span className="font-bold text-green-600">$375 (75%)</span></div>
                </div>
              </div>
              <div>
                <p className="font-bold">Enterprise: $15,000+ + $1,000+/mo</p>
                <div className="grid grid-cols-2 gap-2 mt-1 ml-2">
                  <div>Upfront Profit: <span className="font-bold text-green-600">$9,000 (60%)</span></div>
                  <div>Monthly Profit: <span className="font-bold text-green-600">$750+ (75%)</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Year 1 Growth Path</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Month 1: First client onboarded</span>
                <span className="font-bold">+$1,800–$9,000 upfront</span>
              </div>
              <div className="flex justify-between">
                <span>Month 2+: MRR starts accruing</span>
                <span className="font-bold">+$150–$750/mo/client</span>
              </div>
              <div className="flex justify-between">
                <span>By Month 12: 9 clients @ scale</span>
                <span className="font-bold">$2,700+/mo recurring profit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  )
}
