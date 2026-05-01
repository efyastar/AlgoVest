import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

const cryptoMap: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
}

type Investment = {
  id: string
  name: string
  ticker?: string
  amount: number
  currency: string
  date: string
  status: 'active' | 'closed'
  close_amount?: number
  purchase_price?: number
  current_price?: number
}

export default function PortfolioTab() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingPrices, setFetchingPrices] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [closeId, setCloseId] = useState<string | null>(null)
  const [closeAmount, setCloseAmount] = useState('')
  const [addMoreId, setAddMoreId] = useState<string | null>(null)
  const [addMoreAmount, setAddMoreAmount] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  useEffect(() => {
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setInvestments(data)
      fetchLivePrices(data)
    }
    setLoading(false)
  }

  const fetchLivePrices = async (currentInvestments: Investment[]) => {
    const active = currentInvestments.filter(i => i.status === 'active' && i.ticker)
    if (active.length === 0) return

    setFetchingPrices(true)

    const cryptoAssets = active.filter(i => cryptoMap[i.ticker!.toUpperCase()])
    const stockAssets = active.filter(i => !cryptoMap[i.ticker!.toUpperCase()])

    let cryptoData: Record<string, number> = {}
    if (cryptoAssets.length > 0) {
      try {
        const ids = cryptoAssets.map(i => cryptoMap[i.ticker!.toUpperCase()]).join(',')
        const resp = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        )
        const data = await resp.json()
        cryptoAssets.forEach(i => {
          const coinId = cryptoMap[i.ticker!.toUpperCase()]
          if (data[coinId]) cryptoData[i.ticker!.toUpperCase()] = data[coinId].usd
        })
      } catch (e) {
        console.error('Crypto price fetch failed:', e)
      }
    }

    const stockData: Record<string, number> = {}
    for (const inv of stockAssets) {
      try {
        await new Promise(r => setTimeout(r, 1200))
        const resp = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${inv.ticker}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_KEY}`
        )
        const data = await resp.json()
        const quote = data['Global Quote']
        if (quote && quote['05. price']) {
          stockData[inv.ticker!.toUpperCase()] = parseFloat(quote['05. price'])
        }
      } catch (e) {
        console.error(`Stock fetch failed for ${inv.ticker}:`, e)
      }
    }

    const updated = await Promise.all(currentInvestments.map(async inv => {
      if (!inv.ticker || inv.status === 'closed') return inv
      const t = inv.ticker.toUpperCase()
      const price = cryptoData[t] || stockData[t]
      if (!price) return inv

      await supabase
        .from('investments')
        .update({ current_price: price })
        .eq('id', inv.id)

      return { ...inv, current_price: price }
    }))

    setInvestments(updated)
    setFetchingPrices(false)
  }

  const totalInvested = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.amount, 0)

  const totalCurrentValue = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => {
      if (i.current_price && i.purchase_price && i.purchase_price > 0) {
        const shares = i.amount / i.purchase_price
        return sum + (shares * i.current_price)
      }
      return sum + i.amount
    }, 0)

  const totalPL = totalCurrentValue - totalInvested

  const addInvestment = async () => {
    if (!name || !amount) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let purchasePrice = null
    if (ticker) {
      const t = ticker.toUpperCase()
      if (cryptoMap[t]) {
        try {
          const resp = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[t]}&vs_currencies=usd`
          )
          const data = await resp.json()
          purchasePrice = data[cryptoMap[t]]?.usd || null
        } catch (e) {}
      } else {
        try {
          const resp = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${t}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_KEY}`
          )
          const data = await resp.json()
          const quote = data['Global Quote']
          if (quote && quote['05. price']) {
            purchasePrice = parseFloat(quote['05. price'])
          }
        } catch (e) {}
      }
    }

    const { data, error } = await supabase
      .from('investments')
      .insert({
        user_id: user.id,
        name,
        ticker: ticker.toUpperCase() || null,
        amount: parseFloat(amount),
        currency,
        date: new Date().toLocaleDateString(),
        status: 'active',
        purchase_price: purchasePrice,
        current_price: purchasePrice,
      })
      .select()
      .single()

    if (!error && data) {
      const newInvestments = [data, ...investments]
      setInvestments(newInvestments)
      setName('')
      setTicker('')
      setAmount('')
      setShowAdd(false)
    }
  }

  const addToInvestment = async (id: string, currentAmount: number) => {
    if (!addMoreAmount) return
    const newAmount = currentAmount + parseFloat(addMoreAmount)

    const { error } = await supabase
      .from('investments')
      .update({ amount: newAmount })
      .eq('id', id)

    if (!error) {
      setInvestments(prev => prev.map(i =>
        i.id === id ? { ...i, amount: newAmount } : i
      ))
      setAddMoreId(null)
      setAddMoreAmount('')
    }
  }

  const closeInvestment = async (id: string) => {
    if (!closeAmount) return
    const { error } = await supabase
      .from('investments')
      .update({ status: 'closed', close_amount: parseFloat(closeAmount) })
      .eq('id', id)

    if (!error) {
      setInvestments(prev => prev.map(i =>
        i.id === id
          ? { ...i, status: 'closed', close_amount: parseFloat(closeAmount) }
          : i
      ))
      setCloseId(null)
      setCloseAmount('')
    }
  }

  const getAISuggestion = async () => {
    setLoadingSuggestion(true)
    setAiSuggestion('')
    const activeInvestments = investments.filter(i => i.status === 'active')

    if (activeInvestments.length === 0) {
      setAiSuggestion('Add some investments first and Afrifa will review them for you!')
      setLoadingSuggestion(false)
      return
    }

    const investmentSummary = activeInvestments.map(i => {
      const currentVal = i.current_price && i.purchase_price && i.purchase_price > 0
        ? ((i.amount / i.purchase_price) * i.current_price).toFixed(2)
        : i.amount.toString()
      const pl = i.current_price && i.purchase_price && i.purchase_price > 0
        ? (((i.current_price - i.purchase_price) / i.purchase_price) * 100).toFixed(1)
        : '0'
      return `${i.name} - invested ${CURRENCIES[i.currency]}${i.amount} - current value ${CURRENCIES[i.currency]}${currentVal} (${pl}% change)`
    }).join(', ')

    const prompt = `A user has these active investments: ${investmentSummary}. 
    In 2-3 short sentences, identify which investment is underperforming and suggest what they could sell it for and what to buy instead. Be direct and specific. Respond as Afrifa.`

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
      setAiSuggestion(text)
    } catch (e) {
      setAiSuggestion('Could not load suggestion. Please try again.')
    }
    setLoadingSuggestion(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Loading your portfolio...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs mb-1">INVESTED</p>
          <p className="text-text-main text-lg font-bold">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs mb-1">VALUE</p>
          <p className="text-text-main text-lg font-bold">${totalCurrentValue.toFixed(0)}</p>
          {fetchingPrices && <p className="text-text-hint text-xs animate-pulse">updating...</p>}
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs mb-1">P&L</p>
          <p className={`text-lg font-bold ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Afrifa Portfolio Review */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-base text-xs font-bold">A</span>
            </div>
            <p className="text-text-muted text-xs font-medium">AFRIFA'S PORTFOLIO REVIEW</p>
          </div>
          <button
            onClick={getAISuggestion}
            disabled={loadingSuggestion}
            className="text-primary text-xs font-medium disabled:opacity-50"
          >
            {loadingSuggestion ? 'Afrifa is thinking...' : '✦ Ask Afrifa'}
          </button>
        </div>
        {aiSuggestion ? (
          <p className="text-text-main text-sm leading-relaxed">{aiSuggestion}</p>
        ) : (
          <p className="text-text-muted text-sm">Ask Afrifa to review your portfolio</p>
        )}
      </div>

      {/* Add investment button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full border border-dashed border-border rounded-xl py-3 text-text-muted text-sm hover:border-primary hover:text-primary transition-colors mb-4"
      >
        + Add investment
      </button>

      {/* Add investment form */}
      {showAdd && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <p className="text-text-main font-medium text-sm mb-4">New investment</p>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">ASSET NAME</label>
            <input
              type="text"
              placeholder="e.g. Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">TICKER (needed for live prices)</label>
            <input
              type="text"
              placeholder="e.g. AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-elevated border border-border rounded-xl px-3 py-3 text-text-main text-sm outline-none"
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount invested"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={addInvestment}
            className="w-full bg-primary text-base font-semibold py-3 rounded-xl"
          >
            Save investment
          </button>
        </div>
      )}

      {/* Investment list */}
      <div className="flex flex-col gap-3">
        {investments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-text-main font-medium mb-1">No investments yet</p>
            <p className="text-text-muted text-sm">Add your first investment above</p>
          </div>
        )}

        {investments.map(inv => {
          const hasLivePrice = inv.current_price && inv.purchase_price && inv.purchase_price > 0
          const shares = hasLivePrice ? inv.amount / inv.purchase_price! : 0
          const currentValue = hasLivePrice ? shares * inv.current_price! : inv.amount
          const pl = hasLivePrice ? currentValue - inv.amount : 0
          const plPct = hasLivePrice ? ((pl / inv.amount) * 100).toFixed(1) : null
          const closedPl = inv.close_amount ? inv.close_amount - inv.amount : null
          const closedPlPct = closedPl !== null ? ((closedPl / inv.amount) * 100).toFixed(1) : null

          return (
            <div key={inv.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-text-main font-medium text-sm">{inv.name}</p>
                    {inv.ticker && (
                      <span className="text-xs bg-elevated text-text-muted px-2 py-0.5 rounded-full font-mono">
                        {inv.ticker}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-main font-semibold font-mono text-sm">
                    {CURRENCIES[inv.currency]}{inv.amount.toLocaleString()}
                    <span className="text-text-muted text-xs"> invested</span>
                  </p>
                  {inv.status === 'active' && hasLivePrice && (
                    <div>
                      <p className="text-text-main font-mono text-sm">
                        {CURRENCIES[inv.currency]}{currentValue.toFixed(2)}
                        <span className="text-text-muted text-xs"> now</span>
                      </p>
                      <p className={`text-xs font-mono font-medium ${pl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                        {pl >= 0 ? '+' : ''}{CURRENCIES[inv.currency]}{pl.toFixed(2)} ({plPct}%)
                      </p>
                    </div>
                  )}
                  {inv.status === 'closed' && closedPl !== null && (
                    <p className={`text-xs font-mono font-medium ${closedPl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                      {closedPl >= 0 ? '+' : ''}{CURRENCIES[inv.currency]}{closedPl.toFixed(2)} ({closedPlPct}%)
                    </p>
                  )}
                </div>
              </div>

              {inv.status === 'active' && (
                <div className="mt-3">
                  {closeId === inv.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Closing amount"
                        value={closeAmount}
                        onChange={(e) => setCloseAmount(e.target.value)}
                        className="flex-1 bg-elevated border border-border rounded-lg px-3 py-2 text-text-main text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => closeInvestment(inv.id)}
                        className="px-3 py-2 bg-primary text-base text-xs font-medium rounded-lg"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setCloseId(null)}
                        className="px-3 py-2 border border-border text-text-muted text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : addMoreId === inv.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount to add"
                        value={addMoreAmount}
                        onChange={(e) => setAddMoreAmount(e.target.value)}
                        className="flex-1 bg-elevated border border-border rounded-lg px-3 py-2 text-text-main text-xs outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => addToInvestment(inv.id, inv.amount)}
                        className="px-3 py-2 bg-primary text-base text-xs font-medium rounded-lg"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setAddMoreId(null)}
                        className="px-3 py-2 border border-border text-text-muted text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddMoreId(inv.id)}
                        className="text-primary text-xs border border-primary rounded-lg px-3 py-1.5 hover:bg-primary-tint transition-colors"
                      >
                        + Add more
                      </button>
                      <button
                        onClick={() => setCloseId(inv.id)}
                        className="text-text-muted text-xs border border-border rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                      >
                        Mark as sold
                      </button>
                    </div>
                  )}
                </div>
              )}

              {inv.status === 'closed' && (
                <span className="inline-block mt-2 text-xs bg-elevated text-text-muted px-2 py-0.5 rounded-full">
                  Closed
                </span>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}