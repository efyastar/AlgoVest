import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

type Alert = {
  id: string
  asset: string
  ticker: string
  threshold: number
  currency: string
  current_price: string
  enabled: boolean
  fired: boolean
  fired_message?: string
}

const DEFAULT_ALERTS = [
  {
    asset: 'Bitcoin',
    ticker: 'BTC',
    threshold: 5,
    currency: 'USD',
    current_price: '$83,400',
    enabled: true,
    fired: false,
  },
]

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [aiResponse, setAiResponse] = useState<Record<string, string>>({})
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newAsset, setNewAsset] = useState('')
  const [newTicker, setNewTicker] = useState('')
  const [newThreshold, setNewThreshold] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [])

  useEffect(() => {
    if (alerts.length > 0) {
      fetchLivePrices()
    }
  }, [alerts.length])

  const fetchAlerts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data && data.length > 0) {
      setAlerts(data)
    } else {
      await seedDefaultAlerts()
    }
    setLoading(false)
  }

  const seedDefaultAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const toInsert = DEFAULT_ALERTS.map(a => ({ ...a, user_id: user.id }))
    const { data, error } = await supabase
      .from('alerts')
      .insert(toInsert)
      .select()

    if (!error && data) setAlerts(data)
  }

  const fetchLivePrices = async () => {
    const cryptoMap: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      BNB: 'binancecoin',
      SOL: 'solana',
      XRP: 'ripple',
    }

    const tickers = alerts
      .filter(a => cryptoMap[a.ticker])
      .map(a => cryptoMap[a.ticker])

    if (tickers.length === 0) return

    try {
      const resp = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tickers.join(',')}&vs_currencies=usd&include_24hr_change=true`
      )
      const data = await resp.json()

      const updatedAlerts = await Promise.all(alerts.map(async alert => {
        const coinId = cryptoMap[alert.ticker]
        if (!coinId || !data[coinId]) return alert

        const price = data[coinId].usd
        const change24h = data[coinId].usd_24h_change

        const newPrice = `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        const fired = change24h <= -alert.threshold
        const firedMessage = fired
          ? `${alert.asset} dropped ${Math.abs(change24h).toFixed(1)}% in the last 24 hours — now at ${newPrice}`
          : alert.fired_message

        if (newPrice !== alert.current_price || fired !== alert.fired) {
          await supabase
            .from('alerts')
            .update({
              current_price: newPrice,
              fired,
              fired_message: firedMessage || null,
            })
            .eq('id', alert.id)
        }

        return {
          ...alert,
          current_price: newPrice,
          fired,
          fired_message: firedMessage,
        }
      }))

      setAlerts(updatedAlerts as Alert[])
    } catch (e) {
      console.error('Price fetch failed:', e)
    }
  }

  const toggleAlert = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('alerts')
      .update({ enabled: !current })
      .eq('id', id)

    if (!error) {
      setAlerts(prev =>
        prev.map(a => a.id === id ? { ...a, enabled: !current } : a)
      )
    }
  }

  const addCustomAlert = async () => {
    if (!newAsset || !newTicker || !newThreshold) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id,
        asset: newAsset,
        ticker: newTicker.toUpperCase(),
        threshold: parseFloat(newThreshold),
        currency: 'USD',
        current_price: 'N/A',
        enabled: true,
        fired: false,
      })
      .select()
      .single()

    if (!error && data) {
      setAlerts(prev => [...prev, data])
      setNewAsset('')
      setNewTicker('')
      setNewThreshold('')
      setShowAdd(false)
    }
  }

  const askAI = async (alert: Alert) => {
    setLoadingAi(prev => ({ ...prev, [alert.id]: true }))
    const prompt = `${alert.asset} (${alert.ticker}) just dropped ${alert.threshold}% and is now at ${alert.current_price}. 
    In 2-3 short sentences, should a moderate risk investor buy now or wait? Be direct and specific. Respond as Afrifa, a friendly financial advisor.`

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
      const text = data.candidates[0].content.parts[0].text
      setAiResponse(prev => ({ ...prev, [alert.id]: text }))
    } catch (e) {
      setAiResponse(prev => ({ ...prev, [alert.id]: 'Afrifa is unavailable right now. Try again.' }))
    }
    setLoadingAi(prev => ({ ...prev, [alert.id]: false }))
  }

  const firedAlerts = alerts.filter(a => a.fired && a.enabled)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Loading your alerts...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Fired alerts */}
      {firedAlerts.length > 0 && (
        <div className="mb-6">
          <p className="text-text-muted text-xs font-medium mb-3">RECENT SIGNALS</p>
          <div className="flex flex-col gap-3">
            {firedAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-primary-tint border border-primary rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-base text-xs font-bold">{alert.ticker}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-text-main text-sm font-medium">{alert.fired_message}</p>
                    <p className="text-text-muted text-xs mt-1">Current price: {alert.current_price}</p>
                    {aiResponse[alert.id] ? (
                      <div className="mt-3 bg-elevated rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-base text-xs font-bold">A</span>
                          </div>
                          <p className="text-text-muted text-xs font-medium">AFRIFA SAYS</p>
                        </div>
                        <p className="text-text-main text-xs leading-relaxed">{aiResponse[alert.id]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => askAI(alert)}
                        disabled={loadingAi[alert.id]}
                        className="mt-3 bg-primary text-base text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {loadingAi[alert.id] ? 'Afrifa is thinking...' : '✦ Ask Afrifa'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert list */}
      <p className="text-text-muted text-xs font-medium mb-3">WATCHING</p>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-4 ${
              index !== alerts.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center flex-shrink-0">
              <span className="text-text-main text-xs font-bold">{alert.ticker}</span>
            </div>
            <div className="flex-1">
              <p className="text-text-main text-sm font-medium">{alert.asset}</p>
              <p className="text-text-muted text-xs mt-0.5">
                Alert if drops {alert.threshold}% · {alert.current_price}
              </p>
            </div>
            <button
              onClick={() => toggleAlert(alert.id, alert.enabled)}
              className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 ${
                alert.enabled ? 'bg-primary' : 'bg-elevated border border-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  alert.enabled ? 'left-5' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Add custom alert */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full border border-dashed border-border rounded-xl py-3 text-text-muted text-sm hover:border-primary hover:text-primary transition-colors mt-4"
      >
        + Watch a new asset
      </button>

      {showAdd && (
        <div className="bg-surface border border-border rounded-xl p-4 mt-3">
          <p className="text-text-main font-medium text-sm mb-4">Add custom alert</p>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">ASSET NAME</label>
            <input
              type="text"
              placeholder="e.g. Apple (AAPL)"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">TICKER</label>
            <input
              type="text"
              placeholder="e.g. AAPL"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-4">
            <label className="text-text-muted text-xs mb-1 block">ALERT IF DROPS BY (%)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={addCustomAlert}
            className="w-full bg-primary text-base font-semibold py-3 rounded-xl"
          >
            Add alert
          </button>
        </div>
      )}

      <p className="text-text-hint text-xs text-center mt-4">
        Prices update when you open this tab · email and SMS alerts coming soon
      </p>

    </div>
  )
}