import { useState, useEffect, useRef } from 'react'
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
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [swipeX, setSwipeX] = useState(0)
  const startXRef = useRef(0)

  useEffect(() => { fetchInvestments() }, [])

  const fetchInvestments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('investments').select('*').order('created_at', { ascending: false })
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
        const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
        const data = await resp.json()
        cryptoAssets.forEach(i => {
          const coinId = cryptoMap[i.ticker!.toUpperCase()]
          if (data[coinId]) cryptoData[i.ticker!.toUpperCase()] = data[coinId].usd
        })
      } catch (e) {}
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
        if (quote && quote['05. price']) stockData[inv.ticker!.toUpperCase()] = parseFloat(quote['05. price'])
      } catch (e) {}
    }

    const updated = await Promise.all(currentInvestments.map(async inv => {
      if (!inv.ticker || inv.status === 'closed') return inv
      const t = inv.ticker.toUpperCase()
      const price = cryptoData[t] || stockData[t]
      if (!price) return inv
      await supabase.from('investments').update({ current_price: price }).eq('id', inv.id)
      return { ...inv, current_price: price }
    }))

    setInvestments(updated)
    setFetchingPrices(false)
  }

  const totalInvested = investments.filter(i => i.status === 'active').reduce((sum, i) => sum + i.amount, 0)
  const totalCurrentValue = investments.filter(i => i.status === 'active').reduce((sum, i) => {
    if (i.current_price && i.purchase_price && i.purchase_price > 0) {
      return sum + ((i.amount / i.purchase_price) * i.current_price)
    }
    return sum + i.amount
  }, 0)
  const totalPL = totalCurrentValue - totalInvested
  const totalPLPct = totalInvested > 0 ? ((totalPL / totalInvested) * 100) : 0

  const getRiskLabel = (plPct: number) => {
    if (plPct > 10) return { label: 'Strong performer', color: 'text-primary' }
    if (plPct > 0) return { label: 'Performing well', color: 'text-primary' }
    if (plPct > -5) return { label: 'Slight decline', color: 'text-text-muted' }
    if (plPct > -15) return { label: 'Underperforming', color: 'text-loss-text' }
    return { label: 'Consider reviewing', color: 'text-loss-text' }
  }

  const addInvestment = async () => {
    if (!name || !amount) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let purchasePrice = null
    if (ticker) {
      const t = ticker.toUpperCase()
      if (cryptoMap[t]) {
        try {
          const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cryptoMap[t]}&vs_currencies=usd`)
          const data = await resp.json()
          purchasePrice = data[cryptoMap[t]]?.usd || null
        } catch (e) {}
      } else {
        try {
          const resp = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${t}&apikey=${import.meta.env.VITE_ALPHA_VANTAGE_KEY}`)
          const data = await resp.json()
          const quote = data['Global Quote']
          if (quote && quote['05. price']) purchasePrice = parseFloat(quote['05. price'])
        } catch (e) {}
      }
    }

    const { data, error } = await supabase
      .from('investments')
      .insert({
        user_id: user.id, name,
        ticker: ticker.toUpperCase() || null,
        amount: parseFloat(amount), currency,
        date: new Date().toLocaleDateString(),
        status: 'active',
        purchase_price: purchasePrice,
        current_price: purchasePrice,
      })
      .select().single()

    if (!error && data) {
      setInvestments(prev => [data, ...prev])
      setName(''); setTicker(''); setAmount(''); setShowAdd(false)
    }
  }

  const addToInvestment = async (id: string, currentAmount: number) => {
    if (!addMoreAmount) return
    const newAmount = currentAmount + parseFloat(addMoreAmount)
    const { error } = await supabase.from('investments').update({ amount: newAmount }).eq('id', id)
    if (!error) {
      setInvestments(prev => prev.map(i => i.id === id ? { ...i, amount: newAmount } : i))
      setAddMoreId(null); setAddMoreAmount('')
    }
  }

  const closeInvestment = async (id: string) => {
    if (!closeAmount) return
    const { error } = await supabase.from('investments').update({ status: 'closed', close_amount: parseFloat(closeAmount) }).eq('id', id)
    if (!error) {
      setInvestments(prev => prev.map(i => i.id === id ? { ...i, status: 'closed', close_amount: parseFloat(closeAmount) } : i))
      setCloseId(null); setCloseAmount('')
    }
  }

  const deleteInvestment = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (!error) {
      setInvestments(prev => prev.filter(i => i.id !== id))
      setSwipedId(null); setSwipeX(0)
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
      return `${i.name} (${i.ticker || 'no ticker'}) - invested ${CURRENCIES[i.currency]}${i.amount} - current value ${CURRENCIES[i.currency]}${currentVal} (${pl}% change)`
    }).join(', ')

    const prompt = `You are Afrifa, a direct financial advisor. 
    User portfolio: ${investmentSummary}
    Total invested: ${CURRENCIES['USD']}${totalInvested} | Current value: ${CURRENCIES['USD']}${totalCurrentValue.toFixed(0)} | P&L: ${totalPL >= 0 ? '+' : ''}${CURRENCIES['USD']}${totalPL.toFixed(0)} (${totalPLPct.toFixed(1)}%)
    
    In 3 sentences max:
    1. Identify the worst performing asset and suggest whether to sell or hold
    2. Identify the best performing asset and suggest whether to take profits or hold
    3. One specific actionable recommendation
    
    Be direct, specific and speak as Afrifa.`

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
      setAiSuggestion(data.candidates[0].content.parts[0].text)
    } catch (e) {
      setAiSuggestion('Could not load suggestion. Please try again.')
    }
    setLoadingSuggestion(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Loading your portfolio...</p>
      </div>
    )
  }

  const activeInvestments = investments.filter(i => i.status === 'active')
  const closedInvestments = investments.filter(i => i.status === 'closed')

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Summary cards */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-muted text-xs font-medium">PORTFOLIO SUMMARY</p>
          {fetchingPrices && <p className="text-text-hint text-xs animate-pulse">Updating prices...</p>}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-text-muted text-xs mb-1">Invested</p>
            <p className="text-text-main font-bold text-lg font-mono">${totalInvested.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs mb-1">Value now</p>
            <p className="text-text-main font-bold text-lg font-mono">${totalCurrentValue.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-text-muted text-xs mb-1">Total P&L</p>
            <div className="flex items-center gap-0.5">
              <span className={`text-sm ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                {totalPL >= 0 ? '↑' : '↓'}
              </span>
              <p className={`font-bold text-lg font-mono ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                ${Math.abs(totalPL).toFixed(0)}
              </p>
            </div>
            <p className={`text-xs font-mono ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
              {totalPL >= 0 ? '+' : ''}{totalPLPct.toFixed(2)}% all time
            </p>
          </div>
        </div>

        {/* Portfolio health bar */}
        {activeInvestments.length > 0 && (
          <div className={`rounded-xl px-3 py-2 ${totalPL >= 0 ? 'bg-primary-tint border border-primary' : 'bg-loss-bg border border-loss-text'}`}>
            <p className={`text-xs font-medium ${totalPL >= 0 ? 'text-primary' : 'text-loss-text'}`}>
              {totalPL >= 0
                ? `Portfolio is up ${totalPLPct.toFixed(2)}% — your investments are growing`
                : `Portfolio is down ${Math.abs(totalPLPct).toFixed(2)}% — consider reviewing underperformers`
              }
            </p>
          </div>
        )}
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
            {loadingSuggestion ? 'Afrifa is thinking...' : 'Ask Afrifa'}
          </button>
        </div>
        {aiSuggestion ? (
          <p className="text-text-main text-sm leading-relaxed">{aiSuggestion}</p>
        ) : (
          <p className="text-text-muted text-sm">Ask Afrifa to identify what's underperforming and what to do about it.</p>
        )}
      </div>

      {/* Add investment button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="w-full border border-dashed border-border rounded-xl py-3 text-text-muted text-sm hover:border-primary hover:text-primary transition-colors mb-4"
      >
        Add investment
      </button>

      {/* Add investment form */}
      {showAdd && (
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <p className="text-text-main font-medium text-sm mb-4">New investment</p>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">ASSET NAME</label>
            <input
              type="text" placeholder="e.g. Apple Inc."
              value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mb-3">
            <label className="text-text-muted text-xs mb-1 block">TICKER (needed for live prices)</label>
            <input
              type="text" placeholder="e.g. AAPL"
              value={ticker} onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <select
              value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="bg-elevated border border-border rounded-xl px-3 py-3 text-text-main text-sm outline-none"
            >
              {Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number" placeholder="Amount invested"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
            />
          </div>
          <button onClick={addInvestment} className="w-full bg-primary text-base font-semibold py-3 rounded-xl">
            Save investment
          </button>
        </div>
      )}

      {/* Active investments */}
      {activeInvestments.length > 0 && (
        <div className="mb-6">
          <p className="text-text-muted text-xs font-medium mb-3">ACTIVE HOLDINGS ({activeInvestments.length})</p>
          <div className="flex flex-col gap-3">
            {activeInvestments.map(inv => {
              const hasLivePrice = inv.current_price && inv.purchase_price && inv.purchase_price > 0
              const shares = hasLivePrice ? inv.amount / inv.purchase_price! : 0
              const currentValue = hasLivePrice ? shares * inv.current_price! : inv.amount
              const pl = hasLivePrice ? currentValue - inv.amount : 0
              const plPct = hasLivePrice ? ((pl / inv.amount) * 100) : 0
              const risk = hasLivePrice ? getRiskLabel(plPct) : null

              return (
                <div key={inv.id} className="relative overflow-hidden rounded-xl group">
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-loss-bg flex items-center justify-center rounded-r-xl">
                    <button onClick={() => deleteInvestment(inv.id)} className="text-loss-text text-xs font-semibold">Delete</button>
                  </div>
                  <button
                    onClick={() => deleteInvestment(inv.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-loss-bg text-loss-text text-xs px-2 py-1 rounded-lg z-10 md:block hidden"
                  >
                    Delete
                  </button>

                  <div
                    className="bg-surface border border-border rounded-xl p-4 transition-transform duration-200"
                    style={{ transform: swipedId === inv.id ? `translateX(${swipeX}px)` : 'translateX(0)' }}
                    onTouchStart={(e) => handleTouchStart(e, inv.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                          <span className="text-text-main text-xs font-bold font-mono">
                            {inv.ticker?.slice(0, 3) || inv.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-text-main font-medium text-sm">{inv.name}</p>
                          <p className="text-text-muted text-xs">{inv.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-text-main font-semibold font-mono text-sm">
                          {CURRENCIES[inv.currency]}{inv.amount.toLocaleString()}
                          <span className="text-text-muted text-xs font-normal"> in</span>
                        </p>
                        {hasLivePrice && (
                          <p className="text-text-main font-mono text-sm">
                            {CURRENCIES[inv.currency]}{currentValue.toFixed(2)}
                            <span className="text-text-muted text-xs font-normal"> now</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* P&L bar */}
                    {hasLivePrice && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <span className={`text-sm ${pl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                              {pl >= 0 ? '↑' : '↓'}
                            </span>
                            <span className={`text-xs font-mono font-medium ${pl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                              {pl >= 0 ? '+' : ''}{CURRENCIES[inv.currency]}{pl.toFixed(2)} ({plPct.toFixed(1)}%)
                            </span>
                          </div>
                          {risk && (
                            <span className={`text-xs font-medium ${risk.color}`}>{risk.label}</span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-elevated rounded-full">
                          <div
                            className={`h-1.5 rounded-full transition-all ${pl >= 0 ? 'bg-primary' : 'bg-loss-text'}`}
                            style={{ width: `${Math.min(Math.abs(plPct), 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-2">
                      {closeId === inv.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number" placeholder="Closing amount"
                            value={closeAmount} onChange={(e) => setCloseAmount(e.target.value)}
                            className="flex-1 bg-elevated border border-border rounded-lg px-3 py-2 text-text-main text-xs outline-none focus:border-primary"
                          />
                          <button onClick={() => closeInvestment(inv.id)} className="px-3 py-2 bg-primary text-base text-xs font-medium rounded-lg">Confirm</button>
                          <button onClick={() => setCloseId(null)} className="px-3 py-2 border border-border text-text-muted text-xs rounded-lg">Cancel</button>
                        </div>
                      ) : addMoreId === inv.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number" placeholder="Amount to add"
                            value={addMoreAmount} onChange={(e) => setAddMoreAmount(e.target.value)}
                            className="flex-1 bg-elevated border border-border rounded-lg px-3 py-2 text-text-main text-xs outline-none focus:border-primary"
                          />
                          <button onClick={() => addToInvestment(inv.id, inv.amount)} className="px-3 py-2 bg-primary text-base text-xs font-medium rounded-lg">Add</button>
                          <button onClick={() => setAddMoreId(null)} className="px-3 py-2 border border-border text-text-muted text-xs rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAddMoreId(inv.id)}
                            className="text-primary text-xs border border-primary rounded-lg px-3 py-1.5 hover:bg-primary-tint transition-colors"
                          >
                            Add more
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
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Closed investments */}
      {closedInvestments.length > 0 && (
        <div>
          <p className="text-text-muted text-xs font-medium mb-3">CLOSED POSITIONS ({closedInvestments.length})</p>
          <div className="flex flex-col gap-3">
            {closedInvestments.map(inv => {
              const closedPl = inv.close_amount ? inv.close_amount - inv.amount : null
              const closedPlPct = closedPl !== null ? ((closedPl / inv.amount) * 100).toFixed(1) : null
              return (
                <div key={inv.id} className="bg-surface border border-border rounded-xl p-4 opacity-70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0">
                        <span className="text-text-muted text-xs font-bold font-mono">
                          {inv.ticker?.slice(0, 3) || inv.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-text-main font-medium text-sm">{inv.name}</p>
                        <span className="text-xs bg-elevated text-text-muted px-2 py-0.5 rounded-full">Closed</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-xs font-mono">{CURRENCIES[inv.currency]}{inv.amount} in</p>
                      {inv.close_amount && (
                        <p className="text-text-main text-sm font-mono">{CURRENCIES[inv.currency]}{inv.close_amount} out</p>
                      )}
                      {closedPl !== null && (
                        <div className="flex items-center justify-end gap-1">
                          <span className={`text-xs ${closedPl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                            {closedPl >= 0 ? '↑' : '↓'}
                          </span>
                          <p className={`text-xs font-mono font-medium ${closedPl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                            {closedPl >= 0 ? '+' : ''}{CURRENCIES[inv.currency]}{closedPl.toFixed(2)} ({closedPlPct}%)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {investments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-main font-medium mb-1">No investments yet</p>
          <p className="text-text-muted text-sm">Add your first investment above</p>
        </div>
      )}

      <p className="text-text-hint text-xs text-center mt-6">
        Swipe left to delete · prices update when you open this tab
      </p>

    </div>
  )
}