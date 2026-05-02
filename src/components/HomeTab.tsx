import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

type Investment = {
  id: string
  name: string
  ticker?: string
  amount: number
  currency: string
  status: 'active' | 'closed'
  purchase_price?: number
  current_price?: number
  date: string
}

type Alert = {
  id: string
  asset: string
  ticker: string
  current_price: string
  fired: boolean
  enabled: boolean
  fired_message?: string
  threshold: number
}

type MarketItem = {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  type: 'crypto' | 'index'
}

type NewsItem = {
  title: string
  url: string
  source: string
  time: string
  image: string
}

export default function HomeTab({ onNavigate, userName }: { onNavigate: (tab: string) => void, userName: string }) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currency, setCurrency] = useState('USD')
  const [budgetGoal, setBudgetGoal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState<MarketItem[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [afrifahAdvice, setAfrifahAdvice] = useState('')
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    fetchData()
    fetchMarketData()
    fetchNews()
  }, [])

  // Update "X seconds ago" every second
  useEffect(() => {
    if (!lastUpdated) return
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  const fetchData = async () => {
    setLoading(true)
    const { data: profile } = await supabase.from('profiles').select('currency, budget_goal').maybeSingle()
    if (profile?.currency) setCurrency(profile.currency)
    if (profile?.budget_goal) setBudgetGoal(profile.budget_goal)

    const { data: invData } = await supabase
      .from('investments').select('*').eq('status', 'active')
      .order('created_at', { ascending: false })
    if (invData) setInvestments(invData)

    const { data: alertData } = await supabase
      .from('alerts').select('*').eq('enabled', true)
      .order('created_at', { ascending: false })
    if (alertData) setAlerts(alertData)

    setLoading(false)
  }

  const fetchMarketData = async () => {
    try {
      const resp = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_7d_change=true'
      )
      const data = await resp.json()
      setMarketData([
        { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change, type: 'crypto' },
        { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: data.ethereum.usd, change: data.ethereum.usd_24h_change, type: 'crypto' },
        { id: 'solana', symbol: 'SOL', name: 'Solana', price: data.solana.usd, change: data.solana.usd_24h_change, type: 'crypto' },
      ])
      setLastUpdated(new Date())
    } catch (e) {}
  }

  const fetchNews = async () => {
    setNews([
      {
        title: 'S&P 500 hits new high as tech earnings beat expectations',
        url: 'https://finance.yahoo.com',
        source: 'Yahoo Finance',
        time: 'Today',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
      },
      {
        title: 'Bitcoin holds above $78,000 as institutional demand grows',
        url: 'https://coindesk.com',
        source: 'CoinDesk',
        time: 'Today',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&q=80',
      },
      {
        title: 'African markets attract record foreign investment in 2026',
        url: 'https://bloomberg.com',
        source: 'Bloomberg Africa',
        time: 'Today',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
      },
      {
        title: 'Index funds continue to outperform active management globally',
        url: 'https://morningstar.com',
        source: 'Morningstar',
        time: 'Today',
        image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80',
      },
    ])
  }

  const getAfrifaAdvice = async () => {
    setLoadingAdvice(true)
    const summary = investments.length > 0
      ? investments.map(i => `${i.name}: ${CURRENCIES[currency]}${i.amount}`).join(', ')
      : 'no investments yet'
    const marketSummary = marketData.map(m => `${m.name}: $${m.price.toLocaleString()} (${m.change.toFixed(1)}% 24h)`).join(', ')

    const prompt = `You are Afrifa, a friendly AI financial advisor.
User's portfolio: ${summary}
Current market: ${marketSummary}
Give personalized advice in 2-3 sentences. Be specific, direct and friendly.
If they have no investments, encourage them to start.
If markets are down, advise calmly. If up, suggest opportunities.`

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
      setAfrifahAdvice(data.candidates[0].content.parts[0].text)
    } catch (e) {
      setAfrifahAdvice('Markets are always moving — stay focused on your long-term goals and invest consistently.')
    }
    setLoadingAdvice(false)
  }

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0)
  const totalCurrentValue = investments.reduce((sum, i) => {
    if (i.current_price && i.purchase_price && i.purchase_price > 0) {
      return sum + ((i.amount / i.purchase_price) * i.current_price)
    }
    return sum + i.amount
  }, 0)
  const totalPL = totalCurrentValue - totalInvested
  const totalPLPct = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : null
  const firedAlerts = alerts.filter(a => a.fired)
  const progressPct = budgetGoal ? Math.min((totalInvested / budgetGoal) * 100, 100) : 0

  const formatSecondsAgo = (s: number) => {
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    return `${Math.floor(s / 3600)}h ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Greeting */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-text-main"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {greeting}, {userName}
        </h2>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Portfolio summary */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-muted text-xs font-medium">PORTFOLIO</p>
          <button onClick={() => onNavigate('portfolio')} className="text-primary text-xs font-medium">View all</button>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm mb-1">No investments yet</p>
            <p className="text-text-hint text-xs mb-3">Start investing to see your portfolio performance here</p>
            <button
              onClick={() => onNavigate('advisor')}
              className="bg-primary text-base text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Ask Afrifa to get started
            </button>
          </div>
        ) : (
          <>
            {/* Main numbers */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-text-muted text-xs mb-1">Total invested</p>
                <p className="text-text-main font-bold text-lg font-mono">{CURRENCIES[currency]}{totalInvested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Current value</p>
                <p className="text-text-main font-bold text-lg font-mono">{CURRENCIES[currency]}{totalCurrentValue.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Total P&L</p>
                <div className="flex items-center gap-1">
                  <span className={`text-sm ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                    {totalPL >= 0 ? '↑' : '↓'}
                  </span>
                  <p className={`font-bold text-lg font-mono ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                    {CURRENCIES[currency]}{Math.abs(totalPL).toFixed(0)}
                  </p>
                </div>
                {totalPLPct && (
                  <p className={`text-xs font-mono ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                    {totalPL >= 0 ? '+' : '-'}{Math.abs(parseFloat(totalPLPct))}% all time
                  </p>
                )}
              </div>
            </div>

            {/* Portfolio interpretation */}
            <div className={`rounded-xl px-3 py-2 mb-4 ${totalPL >= 0 ? 'bg-primary-tint border border-primary' : 'bg-loss-bg border border-loss-text'}`}>
              <p className={`text-xs font-medium ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                {totalPL >= 0
                  ? `Your portfolio is up ${totalPLPct}% — you are outperforming a savings account`
                  : `Your portfolio is down ${totalPLPct}% — markets fluctuate, stay focused on the long term`
                }
              </p>
            </div>

            {/* Holdings list */}
            <div className="flex flex-col gap-2">
              {investments.slice(0, 3).map(inv => {
                const hasLive = inv.current_price && inv.purchase_price && inv.purchase_price > 0
                const currentVal = hasLive ? ((inv.amount / inv.purchase_price!) * inv.current_price!).toFixed(2) : null
                const pl = hasLive ? ((inv.current_price! - inv.purchase_price!) / inv.purchase_price! * 100).toFixed(1) : null
                const plValue = hasLive ? ((inv.amount / inv.purchase_price!) * inv.current_price!) - inv.amount : null

                return (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center flex-shrink-0">
                        <span className="text-text-muted text-xs font-mono font-bold">
                          {inv.ticker?.slice(0, 3) || inv.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-text-main text-sm font-medium">{inv.name}</p>
                        <p className="text-text-hint text-xs">{inv.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-main text-sm font-mono font-medium">
                        {currentVal ? `${CURRENCIES[inv.currency]}${parseFloat(currentVal).toLocaleString()}` : `${CURRENCIES[inv.currency]}${inv.amount.toLocaleString()}`}
                      </p>
                      {pl && plValue !== null && (
                        <div className="flex items-center justify-end gap-1">
                          <span className={`text-xs ${parseFloat(pl) >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                            {parseFloat(pl) >= 0 ? '↑' : '↓'}
                          </span>
                          <p className={`text-xs font-mono ${parseFloat(pl) >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                            {Math.abs(parseFloat(pl))}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {investments.length > 3 && (
                <button onClick={() => onNavigate('portfolio')} className="text-primary text-xs font-medium pt-2 border-t border-border">
                  +{investments.length - 3} more holdings
                </button>
              )}
            </div>
          </>
        )}

        {/* Budget goal progress */}
        {budgetGoal && budgetGoal > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-text-muted text-xs">Budget goal</p>
              <p className="text-text-main text-xs font-medium">{progressPct.toFixed(0)}% reached</p>
            </div>
            <div className="w-full h-2 bg-elevated rounded-full">
              <div
                className="h-2 bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-text-hint text-xs mt-1">
              {CURRENCIES[currency]}{totalInvested.toLocaleString()} of {CURRENCIES[currency]}{budgetGoal.toLocaleString()} goal · {CURRENCIES[currency]}{Math.max(0, budgetGoal - totalInvested).toLocaleString()} remaining
            </p>
          </div>
        )}
      </div>

      {/* Afrifa daily advice */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-base text-xs font-bold">A</span>
            </div>
            <p className="text-text-muted text-xs font-medium">AFRIFA'S DAILY ADVICE</p>
          </div>
          <button
            onClick={getAfrifaAdvice}
            disabled={loadingAdvice}
            className="text-primary text-xs font-medium disabled:opacity-50"
          >
            {loadingAdvice ? 'Thinking...' : afrifahAdvice ? 'Refresh' : 'Ask Afrifa'}
          </button>
        </div>
        {afrifahAdvice ? (
          <p className="text-text-main text-sm leading-relaxed">{afrifahAdvice}</p>
        ) : (
          <p className="text-text-muted text-sm">
            Tap "Ask Afrifa" for personalized advice based on your portfolio and today's market.
          </p>
        )}
      </div>

      {/* Live market */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-text-muted text-xs font-medium">LIVE MARKET</p>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-text-hint text-xs">Updated {formatSecondsAgo(secondsAgo)}</p>
            )}
            <button onClick={() => onNavigate('alerts')} className="text-primary text-xs font-medium">Set alerts</button>
          </div>
        </div>
        <p className="text-text-hint text-xs mb-4">24h price change</p>

        <div className="flex flex-col gap-3">
          {marketData.length === 0 ? (
            <p className="text-text-muted text-sm animate-pulse">Loading prices...</p>
          ) : (
            marketData.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                    <span className="text-text-main text-xs font-bold">{item.symbol}</span>
                  </div>
                  <div>
                    <p className="text-text-main text-sm font-medium">{item.name}</p>
                    <p className="text-text-hint text-xs">Crypto · 24h</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-text-main text-sm font-bold font-mono">
                    ${item.price.toLocaleString('en-US', { maximumFractionDigits: item.price > 100 ? 0 : 2 })}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-xs ${item.change >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                      {item.change >= 0 ? '↑' : '↓'}
                    </span>
                    <p className={`text-xs font-mono font-medium ${item.change >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                      {Math.abs(item.change).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Market interpretation */}
        {marketData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-text-muted text-xs leading-relaxed">
              {marketData[0].change >= 0 && marketData[1].change >= 0
                ? 'Crypto markets are broadly up today. Risk appetite appears healthy — a good time to review your watchlist.'
                : marketData[0].change < 0 && marketData[1].change < 0
                ? 'Crypto markets are broadly down today. This could be a buying opportunity if you have a long-term view.'
                : 'Mixed signals in crypto today. Bitcoin and Ethereum are moving in different directions — proceed with caution.'
              }
            </p>
          </div>
        )}

        {/* Fired alerts */}
        {firedAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-loss-text text-xs font-medium mb-2">ACTIVE SIGNALS — Action required</p>
            {firedAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-text-main text-xs font-medium">{alert.asset}</p>
                  <p className="text-text-hint text-xs">Dropped past your {alert.threshold}% threshold</p>
                </div>
                <button
                  onClick={() => onNavigate('alerts')}
                  className="text-primary text-xs font-medium border border-primary rounded-lg px-2 py-1"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market news */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <p className="text-text-muted text-xs font-medium mb-4">MARKET NEWS</p>
        <div className="flex flex-col gap-3">
          {news.map((item, i) => (
            <button
              key={i}
              onClick={() => item.url !== '#' && window.open(item.url, '_blank')}
              className="text-left flex gap-3 py-2 border-t border-border first:border-0 hover:opacity-80 transition-opacity"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-text-main text-sm font-medium leading-snug line-clamp-2 mb-1">
                  {item.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-text-muted text-xs">{item.source}</p>
                  <span className="text-text-hint text-xs">·</span>
                  <p className="text-text-hint text-xs">{item.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate('advisor')}
          className="bg-primary hover:bg-primary-hover text-base font-semibold py-4 rounded-2xl transition-colors text-sm"
        >
          Ask Afrifa
        </button>
        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-surface border border-border hover:border-primary text-text-main font-semibold py-4 rounded-2xl transition-colors text-sm"
        >
          Add investment
        </button>
        <button
          onClick={() => onNavigate('learn')}
          className="bg-surface border border-border hover:border-primary text-text-main font-semibold py-4 rounded-2xl transition-colors text-sm"
        >
          Learn
        </button>
        <button
          onClick={() => onNavigate('apps')}
          className="bg-surface border border-border hover:border-primary text-text-main font-semibold py-4 rounded-2xl transition-colors text-sm"
        >
          Find an app
        </button>
      </div>

    </div>
  )
}