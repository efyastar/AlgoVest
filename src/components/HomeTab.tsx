import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

const cryptoMap: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana', XRP: 'ripple',
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
}

type Alert = {
  id: string
  asset: string
  ticker: string
  current_price: string
  fired: boolean
  enabled: boolean
  fired_message?: string
}

export default function HomeTab({ onNavigate, userName }: { onNavigate: (tab: string) => void, userName: string }) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState<{ btc: number, btcChange: number } | null>(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    fetchData()
    fetchMarketData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    const { data: profile } = await supabase
      .from('profiles')
      .select('currency')
      .maybeSingle()
    if (profile?.currency) setCurrency(profile.currency)

    const { data: invData } = await supabase
      .from('investments')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3)
    if (invData) setInvestments(invData)

    const { data: alertData } = await supabase
      .from('alerts')
      .select('*')
      .eq('enabled', true)
      .order('created_at', { ascending: false })
      .limit(3)
    if (alertData) setAlerts(alertData)

    setLoading(false)
  }

  const fetchMarketData = async () => {
    try {
      const resp = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      )
      const data = await resp.json()
      setMarketData({
        btc: data.bitcoin.usd,
        btcChange: data.bitcoin.usd_24h_change,
      })
    } catch (e) {}
  }

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0)
  const totalCurrentValue = investments.reduce((sum, i) => {
    if (i.current_price && i.purchase_price && i.purchase_price > 0) {
      return sum + ((i.amount / i.purchase_price) * i.current_price)
    }
    return sum + i.amount
  }, 0)
  const totalPL = totalCurrentValue - totalInvested
  const firedAlerts = alerts.filter(a => a.fired)

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
          Here's what's happening with your investments today.
        </p>
      </div>

      {/* Portfolio summary */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-muted text-xs font-medium">PORTFOLIO OVERVIEW</p>
          <button
            onClick={() => onNavigate('portfolio')}
            className="text-primary text-xs font-medium"
          >
            View all
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-text-muted text-sm mb-3">No investments yet</p>
            <button
              onClick={() => onNavigate('advisor')}
              className="bg-primary text-base text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Ask Afrifa to get started
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-text-muted text-xs mb-1">Invested</p>
                <p className="text-text-main font-bold text-lg">
                  {CURRENCIES[currency]}{totalInvested.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">Current value</p>
                <p className="text-text-main font-bold text-lg">
                  {CURRENCIES[currency]}{totalCurrentValue.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs mb-1">P&L</p>
                <p className={`font-bold text-lg ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                  {totalPL >= 0 ? '+' : ''}{CURRENCIES[currency]}{totalPL.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {investments.map(inv => {
                const hasLive = inv.current_price && inv.purchase_price && inv.purchase_price > 0
                const currentVal = hasLive ? ((inv.amount / inv.purchase_price!) * inv.current_price!).toFixed(2) : null
                const pl = hasLive ? ((inv.current_price! - inv.purchase_price!) / inv.purchase_price! * 100).toFixed(1) : null

                return (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-t border-border">
                    <div>
                      <p className="text-text-main text-sm font-medium">{inv.name}</p>
                      {inv.ticker && <p className="text-text-muted text-xs font-mono">{inv.ticker}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-text-main text-sm font-mono">
                        {CURRENCIES[inv.currency]}{inv.amount.toLocaleString()}
                      </p>
                      {pl && (
                        <p className={`text-xs font-mono ${parseFloat(pl) >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                          {parseFloat(pl) >= 0 ? '+' : ''}{pl}%
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Live market snapshot */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-muted text-xs font-medium">LIVE MARKET</p>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-primary text-xs font-medium"
          >
            Manage alerts
          </button>
        </div>

        {marketData ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center">
                <span className="text-text-main text-xs font-bold">BTC</span>
              </div>
              <div>
                <p className="text-text-main font-semibold">Bitcoin</p>
                <p className="text-text-muted text-xs">24h change</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-text-main font-bold font-mono">
                ${marketData.btc.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-xs font-mono font-medium ${marketData.btcChange >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                {marketData.btcChange >= 0 ? '+' : ''}{marketData.btcChange.toFixed(2)}%
              </p>
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-sm">Loading market data...</p>
        )}

        {/* Fired alerts */}
        {firedAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-loss-text text-xs font-medium mb-2">ACTIVE SIGNALS</p>
            {firedAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between py-1.5">
                <p className="text-text-main text-sm">{alert.asset}</p>
                <p className="text-loss-text text-xs font-medium">{alert.fired_message?.split('—')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
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

      {/* Afrifa tip */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-base text-xs font-bold">A</span>
          </div>
          <p className="text-text-muted text-xs font-medium">AFRIFA'S TIP OF THE DAY</p>
        </div>
        <p className="text-text-main text-sm leading-relaxed">
          {investments.length === 0
            ? "Start small and stay consistent. Even investing a small amount regularly can grow significantly over time thanks to compound interest. The best time to start was yesterday — the second best time is today."
            : totalPL >= 0
            ? "Your portfolio is in the green! Consider reinvesting your gains or diversifying into new assets to reduce risk while maintaining growth."
            : "Markets go up and down — that's normal. Stay focused on your long-term goals and avoid making emotional decisions based on short-term price movements."
          }
        </p>
      </div>

    </div>
  )
}