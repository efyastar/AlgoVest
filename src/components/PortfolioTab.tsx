import { supabase } from '../supabase'
import { useState, useEffect } from 'react'

const CURRENCIES: Record<string, string> = {
  USD: '$', GHS: '₵', EUR: '€', GBP: '£', NGN: '₦'
}

type Investment = {
  id: string
  name: string
  amount: number
  currency: string
  date: string
  status: 'active' | 'closed'
  close_amount?: number
}

export default function PortfolioTab() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [closeId, setCloseId] = useState<string | null>(null)
  const [closeAmount, setCloseAmount] = useState('')
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
    if (!error && data) setInvestments(data)
    setLoading(false)
  }

  const totalInvested = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + i.amount, 0)

  const addInvestment = async () => {
    console.log('name:', name, 'amount:', amount)
    if (!name || !amount) return

    const { data: { user } } = await supabase.auth.getUser()
    console.log('User:', user)
    if (!user) return

    const { data, error } = await supabase
      .from('investments')
      .insert({
        user_id: user.id,
        name,
        amount: parseFloat(amount),
        currency,
        date: new Date().toLocaleDateString(),
        status: 'active',
      })
      .select()
      .single()

    console.log('Insert data:', data)
    console.log('Insert error:', error)

    if (!error && data) {
      setInvestments(prev => [data, ...prev])
      setName('')
      setAmount('')
      setShowAdd(false)
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

    const prompt = `A user has these active investments: ${activeInvestments.map(i => `${i.name} - ${CURRENCIES[i.currency]}${i.amount}`).join(', ')}. 
    In 2-3 short sentences, suggest which one might not be growing well and what they could switch to instead. Be direct and specific.`

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
      <button onClick={() => console.log('TEST CLICK WORKS')}>TEST</button>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs mb-1">TOTAL INVESTED</p>
          <p className="text-text-main text-2xl font-bold">
            {totalInvested > 0 ? `$${totalInvested.toLocaleString()}` : '$0'}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs mb-1">POSITIONS</p>
          <p className="text-text-main text-2xl font-bold">
            {investments.filter(i => i.status === 'active').length}
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
              placeholder="e.g. Bitcoin (BTC)"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Amount"
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
          const pl = inv.close_amount ? inv.close_amount - inv.amount : null
          const plPct = pl !== null ? ((pl / inv.amount) * 100).toFixed(1) : null

          return (
            <div key={inv.id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-main font-medium text-sm">{inv.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-main font-semibold font-mono">
                    {CURRENCIES[inv.currency]}{inv.amount.toLocaleString()}
                  </p>
                  {inv.status === 'closed' && pl !== null && (
                    <p className={`text-xs font-mono font-medium ${pl >= 0 ? 'text-primary' : 'text-loss-text'}`}>
                      {pl >= 0 ? '+' : ''}{CURRENCIES[inv.currency]}{pl.toFixed(2)} ({plPct}%)
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
                  ) : (
                    <button
                      onClick={() => setCloseId(inv.id)}
                      className="text-text-muted text-xs border border-border rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                    >
                      Mark as sold
                    </button>
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