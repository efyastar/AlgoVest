import { useState } from 'react'

type Alert = {
  id: number
  asset: string
  ticker: string
  threshold: number
  currency: string
  currentPrice: string
  enabled: boolean
  fired?: boolean
  firedMessage?: string
}

export default function AlertsTab() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      asset: 'Bitcoin',
      ticker: 'BTC',
      threshold: 5,
      currency: 'USD',
      currentPrice: '$83,400',
      enabled: true,
      fired: true,
      firedMessage: 'Bitcoin dropped 6.2% in the last 24 hours — now at $78,200',
    },
    {
      id: 2,
      asset: 'Ethereum',
      ticker: 'ETH',
      threshold: 8,
      currency: 'USD',
      currentPrice: '$3,180',
      enabled: true,
      fired: false,
    },
    {
      id: 3,
      asset: 'S&P 500',
      ticker: 'SPY',
      threshold: 3,
      currency: 'USD',
      currentPrice: '$506.30',
      enabled: true,
      fired: false,
    },
    {
      id: 4,
      asset: 'NASDAQ 100',
      ticker: 'QQQ',
      threshold: 4,
      currency: 'USD',
      currentPrice: '$18,200',
      enabled: false,
      fired: false,
    },
    {
      id: 5,
      asset: 'Gold',
      ticker: 'XAU',
      threshold: 2,
      currency: 'USD',
      currentPrice: '$2,340',
      enabled: false,
      fired: false,
    },
  ])

  const [aiResponse, setAiResponse] = useState<Record<number, string>>({})
  const [loadingAi, setLoadingAi] = useState<Record<number, boolean>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newAsset, setNewAsset] = useState('')
  const [newTicker, setNewTicker] = useState('')
  const [newThreshold, setNewThreshold] = useState('')

  const toggleAlert = (id: number) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    )
  }

  const askAI = async (alert: Alert) => {
    setLoadingAi(prev => ({ ...prev, [alert.id]: true }))
    const prompt = `${alert.asset} (${alert.ticker}) just dropped ${alert.threshold}% and is now at ${alert.currentPrice}. 
    
    In 2-3 short sentences, should a moderate risk investor buy now or wait? Be direct and specific.`

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
      setAiResponse(prev => ({ ...prev, [alert.id]: 'Could not load suggestion. Try again.' }))
    }
    setLoadingAi(prev => ({ ...prev, [alert.id]: false }))
  }

  const addCustomAlert = () => {
    if (!newAsset || !newTicker || !newThreshold) return
    setAlerts(prev => [...prev, {
      id: Date.now(),
      asset: newAsset,
      ticker: newTicker.toUpperCase(),
      threshold: parseFloat(newThreshold),
      currency: 'USD',
      currentPrice: 'N/A',
      enabled: true,
      fired: false,
    }])
    setNewAsset('')
    setNewTicker('')
    setNewThreshold('')
    setShowAdd(false)
  }

  const firedAlerts = alerts.filter(a => a.fired && a.enabled)

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
                    <p className="text-text-main text-sm font-medium">{alert.firedMessage}</p>
                    <p className="text-text-muted text-xs mt-1">Current price: {alert.currentPrice}</p>
                    {aiResponse[alert.id] ? (
                      <div className="mt-3 bg-elevated rounded-lg p-3">
                        <p className="text-text-muted text-xs font-medium mb-1">AI SAYS</p>
                        <p className="text-text-main text-xs leading-relaxed">{aiResponse[alert.id]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => askAI(alert)}
                        disabled={loadingAi[alert.id]}
                        className="mt-3 bg-primary text-base text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        {loadingAi[alert.id] ? 'Thinking...' : '✦ Should I buy now?'}
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
                Alert if drops {alert.threshold}% · {alert.currentPrice}
              </p>
            </div>
            <button
              onClick={() => toggleAlert(alert.id)}
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
        Live price checking coming soon · alerts will notify you via email and SMS
      </p>

    </div>
  )
}