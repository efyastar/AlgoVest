import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

const PLATFORM_SUGGESTIONS: Record<string, { name: string, url: string, desc: string }[]> = {
  stocks: [
    { name: 'Robinhood', url: 'https://robinhood.com', desc: 'Easy stock trading, US focused' },
    { name: 'Trading 212', url: 'https://trading212.com', desc: 'Free stock trading, UK & Europe' },
    { name: 'Bamboo', url: 'https://investbamboo.com', desc: 'US stocks from Africa' },
  ],
  crypto: [
    { name: 'Binance', url: 'https://binance.com', desc: 'Largest crypto exchange globally' },
    { name: 'Coinbase', url: 'https://coinbase.com', desc: 'Beginner friendly crypto' },
    { name: 'Quidax', url: 'https://quidax.com', desc: 'Crypto exchange for Africa' },
  ],
  etfs: [
    { name: 'Vanguard', url: 'https://vanguard.com', desc: 'Low cost index funds & ETFs' },
    { name: 'Fidelity', url: 'https://fidelity.com', desc: 'ETFs and mutual funds' },
    { name: 'Trading 212', url: 'https://trading212.com', desc: 'Free ETF trading' },
  ],
}

const getRiskLabel = (type: string, percentage: number) => {
  if (type === 'crypto') return { label: 'High risk', color: 'text-loss-text', recommended: '5–10%' }
  if (type === 'etfs') return { label: 'Low risk', color: 'text-primary', recommended: '30–50%' }
  if (percentage > 30) return { label: 'High exposure', color: 'text-loss-text', recommended: '15–25%' }
  if (percentage > 20) return { label: 'Moderate exposure', color: 'text-text-muted', recommended: '15–25%' }
  return { label: 'Healthy weight', color: 'text-primary', recommended: '10–25%' }
}

type Allocation = {
  name: string
  percentage: number
  reason: string
  type: string
  section?: string
}

type Portfolio = {
  label: string
  amount: number
  allocations: Allocation[]
}

type Plan = {
  id: number
  budget: number
  currency: string
  risk: string
  goal: string
  allocations: Allocation[]
  summary: string
  date: string
}

export default function AdvisorTab() {
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [risk, setRisk] = useState('moderate')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ individual: Portfolio, longterm: Portfolio, summary: string } | null>(null)
  const [savedPlans, setSavedPlans] = useState<Plan[]>([])
  const [view, setView] = useState<'form' | 'plans'>('form')
  const [error, setError] = useState('')
  const [isNewInvestor, setIsNewInvestor] = useState(true)
  const [individualTickers, setIndividualTickers] = useState('NVDA, TSLA, AVGO, PLTR, META')
  const [longtermTickers, setLongtermTickers] = useState('VOO, QQQ, NVDA')

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

  useEffect(() => {
    fetchSavedPlans()
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('currency, risk_level, is_new_to_investing, individual_tickers, longterm_tickers')
      .maybeSingle()
    if (data) {
      setCurrency(data.currency || 'USD')
      setRisk(data.risk_level || 'moderate')
      setIsNewInvestor(data.is_new_to_investing ?? true)
      if (data.individual_tickers) setIndividualTickers(data.individual_tickers)
      if (data.longterm_tickers) setLongtermTickers(data.longterm_tickers)
    }
  }

  const fetchSavedPlans = async () => {
    const { data, error } = await supabase
      .from('saved_plans').select('*').order('created_at', { ascending: false })
    if (!error && data) setSavedPlans(data)
  }

  const getAISuggestion = async () => {
    if (!budget || parseFloat(budget) <= 0) { setError('Please enter a valid budget'); return }
    setError('')
    setLoading(true)
    setResult(null)

    const splits: Record<string, { individual: number, longterm: number }> = {
      conservative: { individual: 40, longterm: 60 },
      moderate: { individual: 50, longterm: 50 },
      aggressive: { individual: 70, longterm: 30 },
    }
    const split = splits[risk] || splits.moderate
    const individualAmount = (split.individual / 100) * parseFloat(budget)
    const longtermAmount = (split.longterm / 100) * parseFloat(budget)

    const individualStocks = isNewInvestor
      ? risk === 'conservative' ? 'AAPL, MSFT, GOOGL, UNH, META'
        : risk === 'aggressive' ? 'NVDA, TSLA, PLTR, BTC, AVGO'
        : 'NVDA, TSLA, AVGO, PLTR, GOOGL, META'
      : individualTickers

    const longtermStocks = isNewInvestor ? 'VOO, QQQ, NVDA' : longtermTickers

    const prompt = `You are Afrifa, a friendly financial advisor. Split ${CURRENCIES[currency]}${budget} between individual stocks and long-term investments.

Risk level: ${risk}
Split: ${split.individual}% individual (${CURRENCIES[currency]}${individualAmount.toFixed(2)}) and ${split.longterm}% long-term (${CURRENCIES[currency]}${longtermAmount.toFixed(2)})

INDIVIDUAL STOCKS — you MUST use ALL of these tickers: ${individualStocks}
Distribute the ${CURRENCIES[currency]}${individualAmount.toFixed(2)} across ALL of them. Adjust percentages based on risk level ${risk} but include every single one.

LONG TERM — you MUST use ALL of these tickers: ${longtermStocks}
Distribute the ${CURRENCIES[currency]}${longtermAmount.toFixed(2)} across ALL of them.

Respond ONLY with this exact JSON, no markdown, no backticks:
{
  "individual": {
    "label": "Individual Stocks",
    "amount": ${individualAmount.toFixed(2)},
    "allocations": [
      {"name": "NVDA (Nvidia)", "percentage": 25, "reason": "1 line specific reason why this percentage for this risk level", "type": "stocks"}
    ]
  },
  "longterm": {
    "label": "Long Term / Index Funds",
    "amount": ${longtermAmount.toFixed(2)},
    "allocations": [
      {"name": "VOO (S&P 500 ETF)", "percentage": 40, "reason": "1 line specific reason why this percentage for this risk level", "type": "etfs"}
    ]
  },
  "summary": "2-3 friendly sentences from Afrifa explaining the strategy and what the user should expect"
}

Rules:
- individual percentages must sum to 100
- longterm percentages must sum to 100
- reasons must explain WHY this allocation fits the risk level
- use ALL tickers provided`

    let text = ''
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        )
        const data = await resp.json()
        if (data.error?.code === 429) {
          setError('Afrifa is busy right now. Please wait a moment and try again.')
          setLoading(false)
          return
        }
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          text = data.candidates[0].content.parts[0].text
          break
        }
        await new Promise(r => setTimeout(r, 5000))
      } catch (e) {
        if (attempt === 2) {
          setError('Afrifa is unavailable right now. Please try again.')
          setLoading(false)
          return
        }
        await new Promise(r => setTimeout(r, 5000))
      }
    }

    if (!text) { setError('Afrifa could not respond. Please try again.'); setLoading(false); return }

    try {
      text = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(text)
      setResult(parsed)
    } catch (e) {
      setError('Afrifa is unavailable right now. Please try again.')
    }
    setLoading(false)
  }

  const savePlan = async () => {
    if (!result) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const allAllocations = [
      ...result.individual.allocations.map(a => ({ ...a, section: 'individual' })),
      ...result.longterm.allocations.map(a => ({ ...a, section: 'longterm' })),
    ]

    const { data, error } = await supabase
      .from('saved_plans')
      .insert({
        user_id: user.id, budget: parseFloat(budget), currency, risk,
        goal: 'split', allocations: allAllocations,
        summary: result.summary, date: new Date().toLocaleDateString(),
      })
      .select().single()

    if (!error && data) { setSavedPlans(prev => [data, ...prev]); setView('plans') }
  }

  const getPlatforms = (allocations: Allocation[]) => {
    const types = [...new Set(allocations.map(a => a.type))]
    const platforms: { name: string, url: string, desc: string }[] = []
    types.forEach(type => {
      const key = type as keyof typeof PLATFORM_SUGGESTIONS
      if (PLATFORM_SUGGESTIONS[key]) {
        PLATFORM_SUGGESTIONS[key].forEach(p => {
          if (!platforms.find(x => x.name === p.name)) platforms.push(p)
        })
      }
    })
    return platforms.slice(0, 4)
  }

  const renderAllocations = (portfolio: Portfolio, colorOffset = 0) => (
    <div className="flex flex-col gap-4">
      {portfolio.allocations.map((item, i) => {
        const risk = getRiskLabel(item.type, item.percentage)
        return (
          <div key={i}>
            {/* Header row */}
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: COLORS[(i + colorOffset) % COLORS.length] }}
              />
              <span className="text-text-main text-sm font-medium flex-1">{item.name}</span>
              <span className={`text-xs font-medium ${risk.color}`}>{risk.label}</span>
              <span className="text-text-muted text-xs">{item.percentage}%</span>
              <span className="text-text-main text-sm font-semibold font-mono">
                {CURRENCIES[currency]}{((item.percentage / 100) * portfolio.amount).toFixed(2)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-elevated rounded-full ml-6 mb-1">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  background: COLORS[(i + colorOffset) % COLORS.length]
                }}
              />
            </div>

            {/* Reason + recommended range */}
            <div className="ml-6 flex items-start justify-between gap-4">
              <p className="text-text-muted text-xs leading-relaxed flex-1">{item.reason}</p>
              <p className="text-text-hint text-xs flex-shrink-0">
                Recommended: {risk.recommended}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Top toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('form')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            view === 'form' ? 'bg-primary text-base' : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          Ask Afrifa
        </button>
        <button
          onClick={() => setView('plans')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            view === 'plans' ? 'bg-primary text-base' : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          Saved Plans {savedPlans.length > 0 && `(${savedPlans.length})`}
        </button>
      </div>

      {/* FORM VIEW */}
      {view === 'form' && (
        <div>
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">

            {/* Budget input */}
            <div className="mb-5">
              <label className="text-text-muted text-xs font-medium mb-2 block">
                HOW MUCH DO YOU WANT TO INVEST?
              </label>
              <div className="flex gap-2">
                <select
                  value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="bg-elevated border border-border rounded-xl px-3 py-3 text-text-main text-sm outline-none focus:border-primary"
                >
                  {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="number" placeholder="1000" value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-2xl font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['100', '500', '1000', '5000'].map(a => (
                  <button
                    key={a} onClick={() => setBudget(a)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-elevated text-text-muted text-xs hover:border-primary hover:text-text-main transition-colors"
                  >
                    {CURRENCIES[currency]}{a}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk level */}
            <div className="mb-5">
              <label className="text-text-muted text-xs font-medium mb-1 block">RISK LEVEL</label>
              <p className="text-text-hint text-xs mb-2">
                {risk === 'conservative' ? 'Conservative — 40% individual stocks, 60% index funds. Lower volatility, steady growth.'
                  : risk === 'moderate' ? 'Moderate — 50/50 split. Balanced between growth and stability.'
                  : 'Aggressive — 70% individual stocks, 30% index funds. Higher potential return, higher risk.'}
              </p>
              <div className="flex gap-2">
                {[
                  { value: 'conservative', label: 'Safe' },
                  { value: 'moderate', label: 'Balanced' },
                  { value: 'aggressive', label: 'Bold' },
                ].map(r => (
                  <button
                    key={r.value} onClick={() => setRisk(r.value)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                      risk === r.value
                        ? 'border-primary bg-primary-tint text-text-main'
                        : 'border-border bg-elevated text-text-muted'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Show tickers for experienced investors */}
            {!isNewInvestor && (
              <div className="mb-5 bg-elevated rounded-xl p-3">
                <p className="text-text-muted text-xs font-medium mb-2">YOUR SAVED TICKERS</p>
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-text-hint text-xs mb-1">Individual</p>
                    <p className="text-text-main text-xs font-mono">{individualTickers}</p>
                  </div>
                  <div>
                    <p className="text-text-hint text-xs mb-1">Long term</p>
                    <p className="text-text-main text-xs font-mono">{longtermTickers}</p>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-loss-text text-xs mb-3">{error}</p>}

            <button
              onClick={getAISuggestion} disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Afrifa is thinking...' : 'Ask Afrifa'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="flex flex-col gap-4">

              {/* Individual stocks */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-text-main font-semibold">Individual Stocks</p>
                    <p className="text-text-muted text-xs mt-0.5">Higher risk · Higher potential return</p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-semibold font-mono text-lg">
                      {CURRENCIES[currency]}{result.individual.amount.toFixed(2)}
                    </span>
                    <p className="text-text-hint text-xs">
                      {Math.round((result.individual.amount / parseFloat(budget)) * 100)}% of budget
                    </p>
                  </div>
                </div>
                <div className="h-px bg-border mb-4" />
                {renderAllocations(result.individual, 0)}
              </div>

              {/* Long term */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-text-main font-semibold">Long Term / Index Funds</p>
                    <p className="text-text-muted text-xs mt-0.5">Lower risk · Steady compound growth</p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary font-semibold font-mono text-lg">
                      {CURRENCIES[currency]}{result.longterm.amount.toFixed(2)}
                    </span>
                    <p className="text-text-hint text-xs">
                      {Math.round((result.longterm.amount / parseFloat(budget)) * 100)}% of budget
                    </p>
                  </div>
                </div>
                <div className="h-px bg-border mb-4" />
                {renderAllocations(result.longterm, 3)}
              </div>

              {/* Afrifa summary */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-base text-xs font-bold">A</span>
                  </div>
                  <p className="text-text-muted text-xs font-medium">AFRIFA'S STRATEGY EXPLAINED</p>
                </div>
                <p className="text-text-main text-sm leading-relaxed">{result.summary}</p>

                {/* Risk summary */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-elevated rounded-xl p-3 text-center">
                    <p className="text-text-main text-sm font-bold">{CURRENCIES[currency]}{parseFloat(budget).toLocaleString()}</p>
                    <p className="text-text-hint text-xs mt-0.5">Total budget</p>
                  </div>
                  <div className="bg-elevated rounded-xl p-3 text-center">
                    <p className="text-text-main text-sm font-bold capitalize">{risk}</p>
                    <p className="text-text-hint text-xs mt-0.5">Risk level</p>
                  </div>
                  <div className="bg-elevated rounded-xl p-3 text-center">
                    <p className="text-text-main text-sm font-bold">
                      {result.individual.allocations.length + result.longterm.allocations.length}
                    </p>
                    <p className="text-text-hint text-xs mt-0.5">Assets</p>
                  </div>
                </div>
              </div>

              {/* Where to buy */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <p className="text-text-muted text-xs font-medium mb-3">WHERE TO BUY</p>
                <div className="grid grid-cols-2 gap-2">
                  {getPlatforms([...result.individual.allocations, ...result.longterm.allocations]).map((p, i) => (
                    <button
                      key={i} onClick={() => window.open(p.url, '_blank')}
                      className="bg-elevated border border-border rounded-xl p-3 text-left hover:border-primary transition-colors"
                    >
                      <p className="text-text-main text-sm font-medium">{p.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={savePlan}
                className="w-full border border-primary text-primary font-semibold py-3 rounded-xl hover:bg-primary-tint transition-colors"
              >
                Save Afrifa's plan
              </button>

            </div>
          )}
        </div>
      )}

      {/* SAVED PLANS VIEW */}
      {view === 'plans' && (
        <div>
          {savedPlans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary-tint flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl font-bold">A</span>
              </div>
              <p className="text-text-main font-medium mb-1">No saved plans yet</p>
              <p className="text-text-muted text-sm">Ask Afrifa for a suggestion and save it here</p>
              <button
                onClick={() => setView('form')}
                className="mt-4 bg-primary text-base px-6 py-2.5 rounded-xl text-sm font-semibold"
              >
                Ask Afrifa
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedPlans.map((plan, idx) => (
                <div key={idx} className="bg-surface border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-text-main font-semibold">
                        {CURRENCIES[plan.currency]}{plan.budget?.toLocaleString()}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {plan.date} · {plan.risk} risk · {plan.allocations?.length} assets
                      </p>
                    </div>
                    <span className="text-xs bg-primary-tint text-primary px-3 py-1 rounded-full font-medium capitalize">
                      {plan.risk}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {plan.allocations?.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-text-muted text-xs flex-1">{a.name}</span>
                        <span className={`text-xs ${a.section === 'individual' ? 'text-text-hint' : 'text-primary'}`}>
                          {a.section === 'individual' ? 'Stock' : 'ETF'}
                        </span>
                        <span className="text-text-main text-xs font-mono">{a.percentage}%</span>
                        <span className="text-text-main text-xs font-mono">
                          {CURRENCIES[plan.currency]}{((a.percentage / 100) * plan.budget).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-text-muted text-xs mt-3 leading-relaxed">{plan.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}