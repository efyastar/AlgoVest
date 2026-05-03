import { useState, useEffect, useRef } from 'react'
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

const getAlertContext = (ticker: string, threshold: number) => {
  const contexts: Record<string, string> = {
    BTC: 'Bitcoin is highly volatile. A 5%+ drop in 24h can signal panic selling or a buying opportunity.',
    ETH: 'Ethereum often moves with Bitcoin. Large drops may indicate broader crypto market weakness.',
    SOL: 'Solana is a high-beta asset — it moves faster than BTC/ETH in both directions.',
    BNB: 'BNB is closely tied to Binance exchange health and crypto market sentiment.',
    XRP: 'XRP is sensitive to regulatory news and Ripple-related developments.',
  }
  return contexts[ticker.toUpperCase()] ||
    `A ${threshold}% drop signals meaningful price movement — could be a buy opportunity or a warning sign.`
}

const getSuggestedAction = (_ticker: string, change: number) => {
  if (change > -3) return 'Minor dip — monitor closely before acting'
  if (change > -7) return 'Moderate drop — consider buying in small increments (DCA)'
  if (change > -15) return 'Significant drop — strong potential entry for long-term holders'
  return 'Major correction — wait for stabilization before buying'
}

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [aiResponse, setAiResponse] = useState<Record<string, string>>({})
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newAsset, setNewAsset] = useState('')
  const [newTicker, setNewTicker] = useState('')
  const [newThreshold, setNewThreshold] = useState('')
  const [fetchingPrices, setFetchingPrices] = useState(false)
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const [editingThresholdId, setEditingThresholdId] = useState<string | null>(null)
  const [editThresholdValue, setEditThresholdValue] = useState('')
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const startXRef = useRef(0)

  useEffect(() => {
    fetchAlerts()
    fetchUserContact()
  }, [])

  useEffect(() => {
    if (!loading && alerts.length > 0) fetchLivePrices()
  }, [loading])

  const fetchUserContact = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) setUserEmail(user.email)

    const { data } = await supabase
      .from('profiles')
      .select('phone_number')
      .maybeSingle()
    if (data?.phone_number) setUserPhone(data.phone_number)
  }

  const fetchAlerts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alerts').select('*').order('created_at', { ascending: true })
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
    const { data, error } = await supabase.from('alerts').insert(toInsert).select()
    if (!error && data) setAlerts(data)
  }

  const sendNotifications = async (alert: Alert, newPrice: string, change24h: number) => {
    // Send email
    if (userEmail) {
      fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          asset: alert.asset,
          ticker: alert.ticker,
          price: newPrice,
          change: change24h,
          threshold: alert.threshold,
        })
      }).catch(e => console.error('Email send failed:', e))
    }

    // Send SMS if phone number exists
    if (userPhone) {
      fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userPhone,
          asset: alert.asset,
          ticker: alert.ticker,
          price: newPrice,
          change: change24h,
          threshold: alert.threshold,
        })
      }).catch(e => console.error('SMS send failed:', e))
    }
  }

  const fetchLivePrices = async (currentAlerts?: Alert[]) => {
    const alertsToUse = currentAlerts || alerts
    if (alertsToUse.length === 0) return
    setFetchingPrices(true)

    const cryptoMap: Record<string, string> = {
      BTC: 'bitcoin', ETH: 'ethereum', BNB: 'binancecoin', SOL: 'solana', XRP: 'ripple',
    }

    const cryptoTickers = alertsToUse.filter(a => cryptoMap[a.ticker]).map(a => cryptoMap[a.ticker])
    const stockAlerts = alertsToUse.filter(a => !cryptoMap[a.ticker])

    let cryptoData: Record<string, { usd: number, usd_24h_change: number }> = {}
    if (cryptoTickers.length > 0) {
      try {
        const resp = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoTickers.join(',')}&vs_currencies=usd&include_24hr_change=true`
        )
        cryptoData = await resp.json()
      } catch (e) {}
    }

    const stockData: Record<string, { price: number, change: number }> = {}
    for (const alert of stockAlerts) {
      try {
        await new Promise(r => setTimeout(r, 1200))
        const resp = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alert.ticker}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_KEY}`
        )
        const data = await resp.json()
        const quote = data['Global Quote']
        if (quote && quote['05. price']) {
          stockData[alert.ticker] = {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['10. change percent'].replace('%', '')),
          }
        }
      } catch (e) {}
    }

    const updatedAlerts = await Promise.all(alertsToUse.map(async alert => {
      const coinId = cryptoMap[alert.ticker]
      let newPrice = alert.current_price
      let change24h = 0
      let gotData = false

      if (coinId && cryptoData[coinId]) {
        const price = cryptoData[coinId].usd
        change24h = cryptoData[coinId].usd_24h_change
        newPrice = `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        gotData = true
      } else if (stockData[alert.ticker]) {
        const price = stockData[alert.ticker].price
        change24h = stockData[alert.ticker].change
        newPrice = `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
        gotData = true
      }

      if (!gotData) return alert

      const fired = change24h <= -alert.threshold
      const firedMessage = fired
        ? `${alert.asset} dropped ${Math.abs(change24h).toFixed(1)}% in 24h — now at ${newPrice}`
        : alert.fired_message

      // Send notifications only when alert first fires
      if (fired && !alert.fired) {
        sendNotifications(alert, newPrice, change24h)
      }

      if (newPrice !== alert.current_price || fired !== alert.fired) {
        await supabase.from('alerts').update({
          current_price: newPrice, fired, fired_message: firedMessage || null,
        }).eq('id', alert.id)
      }

      return { ...alert, current_price: newPrice, fired, fired_message: firedMessage }
    }))

    setAlerts(updatedAlerts as Alert[])
    setFetchingPrices(false)
  }

  const toggleAlert = async (id: string, current: boolean) => {
    const { error } = await supabase.from('alerts').update({ enabled: !current }).eq('id', id)
    if (!error) setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !current } : a))
  }

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from('alerts').delete().eq('id', id)
    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== id))
      setSwipedId(null); setSwipeX(0)
    }
  }

  const saveThreshold = async (id: string) => {
    if (!editThresholdValue || parseFloat(editThresholdValue) <= 0) return
    const { error } = await supabase
      .from('alerts').update({ threshold: parseFloat(editThresholdValue) }).eq('id', id)
    if (!error) {
      setAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, threshold: parseFloat(editThresholdValue) } : a
      ))
    }
    setEditingThresholdId(null); setEditThresholdValue('')
  }

  const addCustomAlert = async () => {
    if (!newAsset || !newTicker || !newThreshold) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: user.id, asset: newAsset,
        ticker: newTicker.toUpperCase(),
        threshold: parseFloat(newThreshold),
        currency: 'USD', current_price: 'Fetching...',
        enabled: true, fired: false,
      })
      .select().single()

    if (!error && data) {
      const newAlerts = [...alerts, data]
      setAlerts(newAlerts)
      setNewAsset(''); setNewTicker(''); setNewThreshold(''); setShowAdd(false)
      fetchLivePrices(newAlerts)
    }
  }

  const askAI = async (alert: Alert) => {
    setLoadingAi(prev => ({ ...prev, [alert.id]: true }))
    const change = parseFloat(alert.fired_message?.match(/(\d+\.?\d*)%/)?.[1] || '5')
    const prompt = `You are Afrifa, a direct financial advisor.
      ${alert.asset} (${alert.ticker}) has dropped ${change}% in 24 hours and is now at ${alert.current_price}.
      The user set an alert for a ${alert.threshold}% drop threshold.

      In exactly 3 short sentences:
      1. Explain what this price drop likely means (market context)
      2. Give a specific buy/hold/wait recommendation with reasoning
      3. Suggest a specific price target or next action

      Be direct, specific and confident. Speak as Afrifa.`

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
      setAiResponse(prev => ({ ...prev, [alert.id]: data.candidates[0].content.parts[0].text }))
    } catch (e) {
      setAiResponse(prev => ({ ...prev, [alert.id]: 'Afrifa is unavailable right now. Try again.' }))
    }
    setLoadingAi(prev => ({ ...prev, [alert.id]: false }))
  }

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    startXRef.current = e.touches[0].clientX
    setSwipedId(id)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startXRef.current
    if (diff < 0) setSwipeX(Math.max(diff, -80))
    else setSwipeX(0)
  }

  const handleTouchEnd = () => {
    if (swipeX < -40) setSwipeX(-80)
    else { setSwipeX(0); setSwipedId(null) }
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

      {/* No phone number warning */}
      {!userPhone && (
        <div className="bg-elevated border border-border rounded-xl px-4 py-3 mb-4">
          <p className="text-text-muted text-xs">Add your phone number to receive SMS alerts — tap your name in the header to open settings</p>
        </div>
      )}

      {/* Fired alerts */}
      {firedAlerts.length > 0 && (
        <div className="mb-6">
          <p className="text-loss-text text-xs font-medium mb-3">ACTION REQUIRED — SIGNALS FIRED</p>
          <div className="flex flex-col gap-3">
            {firedAlerts.map(alert => {
              const change = parseFloat(alert.fired_message?.match(/(\d+\.?\d*)%/)?.[1] || '5')
              const suggestedAction = getSuggestedAction(alert.ticker, -change)

              return (
                <div key={alert.id} className="bg-loss-bg border border-loss-text rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                        <span className="text-text-main text-xs font-bold">{alert.ticker}</span>
                      </div>
                      <div>
                        <p className="text-text-main text-sm font-semibold">{alert.asset}</p>
                        <p className="text-loss-text text-xs font-medium">{alert.fired_message}</p>
                      </div>
                    </div>
                    <p className="text-text-main text-sm font-bold font-mono">{alert.current_price}</p>
                  </div>

                  <div className="bg-elevated rounded-lg px-3 py-2 mb-3">
                    <p className="text-text-muted text-xs font-medium mb-0.5">SUGGESTED ACTION</p>
                    <p className="text-text-main text-xs font-medium">{suggestedAction}</p>
                  </div>

                  <p className="text-text-hint text-xs mb-3">
                    Timeframe: 24h · Threshold: {alert.threshold}% · Triggered at {alert.current_price}
                  </p>

                  {aiResponse[alert.id] ? (
                    <div className="bg-surface rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-base text-xs font-bold">A</span>
                        </div>
                        <p className="text-text-muted text-xs font-medium">AFRIFA'S ANALYSIS</p>
                      </div>
                      <p className="text-text-main text-xs leading-relaxed">{aiResponse[alert.id]}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => askAI(alert)}
                      disabled={loadingAi[alert.id]}
                      className="w-full bg-primary text-base text-xs font-semibold py-2 rounded-lg disabled:opacity-50"
                    >
                      {loadingAi[alert.id] ? 'Afrifa is thinking...' : "Get Afrifa's analysis"}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Watching header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-text-muted text-xs font-medium">WATCHING {alerts.length} ASSET{alerts.length !== 1 ? 'S' : ''}</p>
          <p className="text-text-hint text-xs mt-0.5">Alerts fire when 24h price drops exceed your threshold</p>
        </div>
        {fetchingPrices && <p className="text-text-muted text-xs animate-pulse">Updating...</p>}
      </div>

      {/* Alert list */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
        {alerts.map((alert, index) => (
          <div
            key={alert.id}
            className={`relative overflow-hidden group ${index !== alerts.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-loss-bg flex items-center justify-center">
              <button onClick={() => deleteAlert(alert.id)} className="text-loss-text text-xs font-semibold">Delete</button>
            </div>

            <button
              onClick={() => deleteAlert(alert.id)}
              className="absolute top-1/2 -translate-y-1/2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-loss-bg text-loss-text text-xs px-2 py-1 rounded-lg z-10 md:block hidden"
            >
              Delete
            </button>

            <div
              className="flex items-start gap-3 px-4 py-4 bg-surface transition-all duration-200 md:group-hover:pl-16"
              style={{ transform: swipedId === alert.id ? `translateX(${swipeX}px)` : 'translateX(0)' }}
              onTouchStart={(e) => handleTouchStart(e, alert.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center flex-shrink-0">
                <span className="text-text-main text-xs font-bold">{alert.ticker}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-text-main text-sm font-medium">{alert.asset}</p>
                  <p className="text-text-main text-sm font-bold font-mono">{alert.current_price}</p>
                </div>

                <div className="flex items-center gap-1 mb-1">
                  <span className="text-text-muted text-xs">Alert if drops</span>
                  {editingThresholdId === alert.id ? (
                    <input
                      type="number"
                      value={editThresholdValue}
                      onChange={(e) => setEditThresholdValue(e.target.value)}
                      onBlur={() => saveThreshold(alert.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveThreshold(alert.id)}
                      autoFocus
                      className="w-12 bg-elevated border border-primary rounded px-1 py-0.5 text-text-main text-xs outline-none text-center"
                    />
                  ) : (
                    <button
                      onClick={() => { setEditingThresholdId(alert.id); setEditThresholdValue(alert.threshold.toString()) }}
                      className="text-primary text-xs font-medium border-b border-dashed border-primary"
                    >
                      {alert.threshold}%
                    </button>
                  )}
                  <span className="text-text-muted text-xs">in 24h</span>
                </div>

                <p className="text-text-hint text-xs leading-relaxed mb-2">
                  {getAlertContext(alert.ticker, alert.threshold)}
                </p>

                {alert.fired && (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-loss-text animate-pulse" />
                    <p className="text-loss-text text-xs font-medium">Signal fired — check above</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleAlert(alert.id, alert.enabled)}
                className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 mt-1 ${
                  alert.enabled ? 'bg-primary' : 'bg-elevated border border-border'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${alert.enabled ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add alert */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full border border-dashed border-border rounded-xl py-3 text-text-muted text-sm hover:border-primary hover:text-primary transition-colors mb-3"
      >
        Watch a new asset
      </button>

      {showAdd && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <p className="text-text-main font-medium text-sm mb-4">Add custom alert</p>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">ASSET NAME</label>
            <input
              type="text" placeholder="e.g. Apple"
              value={newAsset} onChange={(e) => setNewAsset(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">TICKER</label>
            <input
              type="text" placeholder="e.g. AAPL"
              value={newTicker} onChange={(e) => setNewTicker(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">ALERT IF DROPS BY (%)</label>
            <input
              type="number" placeholder="e.g. 5"
              value={newThreshold} onChange={(e) => setNewThreshold(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
            <p className="text-text-hint text-xs mt-1">
              Typical thresholds: 3% (sensitive) · 5% (standard) · 10% (major moves only)
            </p>
          </div>
          <button onClick={addCustomAlert} className="w-full bg-primary text-base font-semibold py-3 rounded-xl">
            Add alert
          </button>
        </div>
      )}

      <p className="text-text-hint text-xs text-center mt-2">
        Swipe left to delete · Tap the % to adjust threshold · Prices update on open
      </p>

    </div>
  )
}