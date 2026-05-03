import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const CURRENCIES = ['USD', 'GHS', 'EUR', 'GBP', 'NGN']

export default function SettingsPage({ onClose, onNameUpdate }: { onClose: () => void, onNameUpdate: (name: string) => void }) {
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [risk, setRisk] = useState('moderate')
  const [isNewInvestor, setIsNewInvestor] = useState(true)
  const [individualTickers, setIndividualTickers] = useState('NVDA, TSLA, AVGO, PLTR, META')
  const [longtermTickers, setLongtermTickers] = useState('VOO, QQQ, NVDA')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setName(user.user_metadata?.full_name || '')

    const { data } = await supabase.from('profiles').select('*').maybeSingle()
    if (data) {
      setCurrency(data.currency || 'USD')
      setRisk(data.risk_level || 'moderate')
      setIsNewInvestor(data.is_new_to_investing ?? true)
      if (data.individual_tickers) setIndividualTickers(data.individual_tickers)
      if (data.longterm_tickers) setLongtermTickers(data.longterm_tickers)
      if (data.phone_number) setPhoneNumber(data.phone_number)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.auth.updateUser({ data: { full_name: name } })

    await supabase.from('profiles').upsert({
      id: user.id,
      currency,
      risk_level: risk,
      is_new_to_investing: isNewInvestor,
      individual_tickers: isNewInvestor ? null : individualTickers,
      longterm_tickers: isNewInvestor ? null : longtermTickers,
      phone_number: phoneNumber || null,
    })

    setSaving(false)
    setSaved(true)
    onNameUpdate(name)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-base flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <button onClick={onClose} className="text-text-muted hover:text-text-main text-sm transition-colors">
          Back
        </button>
        <h1 className="text-text-main font-semibold text-sm">Profile & Settings</h1>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="text-primary text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">

        {/* Name */}
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium mb-2 block">FULL NAME</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
          />
        </div>

        {/* Phone number */}
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium mb-2 block">PHONE NUMBER</label>
          <input
            type="tel" placeholder="+1234567890"
            value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary"
          />
          <p className="text-text-hint text-xs mt-1">Include country code · Used for SMS alerts when prices drop</p>
        </div>

        {/* Currency */}
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium mb-2 block">CURRENCY</label>
          <div className="flex gap-2 flex-wrap">
            {CURRENCIES.map(c => (
              <button
                key={c} onClick={() => setCurrency(c)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  currency === c
                    ? 'border-primary bg-primary-tint text-text-main'
                    : 'border-border bg-elevated text-text-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Risk level */}
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium mb-2 block">RISK LEVEL</label>
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

        {/* Investor type */}
        <div className="mb-6">
          <label className="text-text-muted text-xs font-medium mb-2 block">INVESTOR TYPE</label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsNewInvestor(true)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                isNewInvestor
                  ? 'border-primary bg-primary-tint text-text-main'
                  : 'border-border bg-elevated text-text-muted'
              }`}
            >
              <div className="font-medium text-sm">New to investing</div>
              <div className="text-xs mt-1 opacity-70">Afrifa picks stocks for me</div>
            </button>
            <button
              onClick={() => setIsNewInvestor(false)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                !isNewInvestor
                  ? 'border-primary bg-primary-tint text-text-main'
                  : 'border-border bg-elevated text-text-muted'
              }`}
            >
              <div className="font-medium text-sm">Experienced investor</div>
              <div className="text-xs mt-1 opacity-70">I choose my own stocks</div>
            </button>
          </div>
        </div>

        {/* Tickers */}
        {!isNewInvestor && (
          <div className="mb-6">
            <label className="text-text-muted text-xs font-medium mb-2 block">INDIVIDUAL STOCKS</label>
            <input
              type="text" placeholder="e.g. NVDA, TSLA, AVGO, META"
              value={individualTickers} onChange={(e) => setIndividualTickers(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary mb-1"
            />
            <p className="text-text-hint text-xs mb-4">Separate tickers with commas</p>

            <label className="text-text-muted text-xs font-medium mb-2 block">LONG TERM / INDEX FUNDS</label>
            <input
              type="text" placeholder="e.g. VOO, QQQ, NVDA"
              value={longtermTickers} onChange={(e) => setLongtermTickers(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary mb-1"
            />
            <p className="text-text-hint text-xs">Separate tickers with commas</p>
          </div>
        )}

        <button
          onClick={saveProfile} disabled={saving}
          className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>

      </div>
    </div>
  )
}