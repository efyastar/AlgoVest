import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

const PLATFORM_SUGGESTIONS: Record<string, { name: string, url: string, desc: string }[]> = {
  stocks: [
    { name: 'Robinhood', url: 'https://robinhood.com', desc: 'Easy stock trading, US focused' },
    { name: 'Trading 212', url: 'https://trading212.com', desc: 'Free stock trading, UK & Europe' },
    { name: 'GSE', url: 'https://gse.com.gh', desc: 'Ghana Stock Exchange' },
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

type Allocation = {
  name: string
  percentage: number
  reason: string
  type: string
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
  const [goal, setGoal] = useState('growth')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ allocations: Allocation[], summary: string } | null>(null)
  const [savedPlans, setSavedPlans] = useState<Plan[]>([])
  const [view, setView] = useState<'form' | 'plans'>('form')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSavedPlans()
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('currency, risk_level')
      .single()
    if (data) {
      setCurrency(data.currency)
      setRisk(data.risk_level)
    }
  }

  const fetchSavedPlans = async () => {
    const { data, error } = await supabase
      .from('saved_plans')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setSavedPlans(data)
  }

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

  const getAISuggestion = async () => {
    if (!budget || parseFloat(budget) <= 0) {
      setError('Please enter a valid budget')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    const prompt = `You are Afrifa, a friendly and knowledgeable financial advisor. A user wants to invest ${CURRENCIES[currency]}${budget} with a ${risk} risk tolerance. Their goal is ${goal}.

Respond ONLY with a JSON object, no markdown, no backticks:
{
  "allocations": [
    {"name": "Asset name (ticker)", "percentage": 40, "reason": "1 line reason", "type": "stocks|crypto|etfs"},
    ...
  ],
  "summary": "2-3 sentence strategy explanation written as Afrifa speaking directly to the user"
}

Rules:
- 3 to 5 allocations
- percentages must sum to 100
- be specific with asset names and tickers
- consider the ${currency} currency and suggest accessible platforms
- for ${risk} risk level be appropriate`

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )
      const data = await resp.json()
      let text = data.candidates[0].content.parts[0].text
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

    const { data, error } = await supabase
      .from('saved_plans')
      .insert({
        user_id: user.id,
        budget: parseFloat(budget),
        currency,
        risk,
        goal,
        allocations: result.allocations,
        summary: result.summary,
        date: new Date().toLocaleDateString(),
      })
      .select()
      .single()

    if (!error && data) {
      setSavedPlans(prev => [data, ...prev])
      setView('plans')
    }
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

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Top toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('form')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            view === 'form'
              ? 'bg-primary text-base'
              : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          ✦ Ask Afrifa
        </button>
        <button
          onClick={() => setView('plans')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            view === 'plans'
              ? 'bg-primary text-base'
              : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          📋 Afrifa's Saved Plans {savedPlans.length > 0 && `(${savedPlans.length})`}
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
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-elevated border border-border rounded-xl px-3 py-3 text-text-main text-sm outline-none focus:border-primary"
                >
                  {Object.keys(CURRENCIES).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="1000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-2xl font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['100', '500', '1000', '5000'].map(a => (
                  <button
                    key={a}
                    onClick={() => setBudget(a)}
                    className="px-3 py-1.5 rounded-lg border border-border bg-elevated text-text-muted text-xs hover:border-primary hover:text-text-main transition-colors"
                  >
                    {CURRENCIES[currency]}{a}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk level */}
            <div className="mb-5">
              <label className="text-text-muted text-xs font-medium mb-2 block">
                RISK LEVEL
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'conservative', label: '🛡️ Safe' },
                  { value: 'moderate', label: '⚖️ Balanced' },
                  { value: 'aggressive', label: '🚀 Bold' },
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRisk(r.value)}
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

            {/* Goal */}
            <div className="mb-5">
              <label className="text-text-muted text-xs font-medium mb-2 block">
                INVESTMENT GOAL
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
              >
                <option value="growth">Long-term growth (5+ years)</option>
                <option value="income">Passive income / dividends</option>
                <option value="short">Short-term gains (1-2 years)</option>
                <option value="crypto">Crypto-focused portfolio</option>
              </select>
            </div>

            {error && (
              <p className="text-loss-text text-xs mb-3">{error}</p>
            )}

            <button
              onClick={getAISuggestion}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Afrifa is thinking...
                </>
              ) : (
                '✦ Ask Afrifa'
              )}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-surface border border-border rounded-2xl p-5">

              {/* Afrifa header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-base text-sm font-bold">A</span>
                </div>
                <div>
                  <p className="text-text-main font-semibold text-sm">Afrifa's Recommendation</p>
                  <p className="text-text-muted text-xs">for {CURRENCIES[currency]}{budget}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-5">
                {result.allocations.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-text-main text-sm font-medium flex-1">{item.name}</span>
                      <span className="text-text-muted text-xs">{item.percentage}%</span>
                      <span className="text-text-main text-sm font-semibold font-mono">
                        {CURRENCIES[currency]}{((item.percentage / 100) * parseFloat(budget)).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-elevated rounded-full ml-6">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          background: COLORS[i % COLORS.length]
                        }}
                      />
                    </div>
                    <p className="text-text-muted text-xs mt-1 ml-6">{item.reason}</p>
                  </div>
                ))}
              </div>

              <div className="bg-elevated rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-base text-xs font-bold">A</span>
                  </div>
                  <p className="text-text-muted text-xs font-medium">AFRIFA SAYS</p>
                </div>
                <p className="text-text-main text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div className="mb-5">
                <p className="text-text-muted text-xs font-medium mb-3">WHERE AFRIFA SUGGESTS YOU BUY</p>
                <div className="grid grid-cols-2 gap-2">
                  {getPlatforms(result.allocations).map((p, i) => (
                    <button
                      key={i}
                      onClick={() => window.open(p.url, '_blank')}
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
                        {plan.date} · {plan.risk} risk · {plan.goal}
                      </p>
                    </div>
                    <span className="text-xs bg-primary-tint text-primary px-3 py-1 rounded-full font-medium">
                      {plan.allocations?.length} assets
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {plan.allocations?.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-text-muted text-xs flex-1">{a.name}</span>
                        <span className="text-text-main text-xs font-mono">{a.percentage}%</span>
                        <span className="text-text-main text-xs font-mono">
                          {CURRENCIES[plan.currency]}{((a.percentage / 100) * plan.budget).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}