import { useState } from 'react'
import { supabase } from '../supabase'

export default function LoginPage({ onSignUp: _onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    if (isSignUp && name.trim() === '') { setError('Please enter your full name'); return }
    if (email.trim() === '') { setError('Please enter your email address'); return }
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address'); return }
    if (password.trim() === '') { setError('Please enter your password'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: window.location.origin
        }
      })
      if (error) { setError(error.message) }
      else { setMessage('Check your email to confirm your account, then sign in!') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message) }
      else { onLogin() }
    }
    setLoading(false)
  }

  const features = [
    {
      title: 'AI-Powered Advisor',
      desc: 'Afrifa analyses your budget and risk level to suggest the perfect portfolio split across individual stocks and long-term investments.',
      icon: 'A',
    },
    {
      title: 'Live Market Alerts',
      desc: 'Get notified the moment Bitcoin, Tesla or any asset drops below your threshold — with instant AI buy/sell guidance.',
      icon: '↑',
    },
    {
      title: 'Smart Portfolio Tracking',
      desc: 'Track your investments in real time with live prices, profit and loss breakdowns and Afrifa\'s proactive sell suggestions.',
      icon: '$',
    },
    {
      title: 'Global Investment Apps',
      desc: 'Discover the best investment platforms for your country — from Ghana\'s Bamboo to the US\'s Fidelity — with step by step account guides.',
      icon: 'G',
    },
  ]

  const stats = [
    { value: '190+', label: 'Countries supported' },
    { value: '5+', label: 'Currencies' },
    { value: 'Real-time', label: 'Market data' },
  ]

  return (
    <div className="min-h-screen bg-base flex flex-col lg:flex-row">

      {/* Left — Hero section */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0 border-b lg:border-b-0 lg:border-r border-border">

        {/* Brand */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text-main tracking-tight">AlgoVest</h1>
          <p className="text-primary text-sm font-medium mt-1">Powered by Afrifa AI</p>
        </div>

        {/* Hero headline */}
        <div className="mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-text-main leading-tight mb-4">
            Invest smarter.<br />
            <span className="text-primary">Wherever you are.</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-md">
            AlgoVest is your AI-powered investment companion. Get personalized portfolio suggestions, live market alerts and expert guidance — built for investors across Africa, Europe, the Americas and beyond.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-10">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-text-main text-xl font-bold">{stat.value}</p>
              <p className="text-text-muted text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 max-w-lg">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-tint border border-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">{f.icon}</span>
              </div>
              <div>
                <p className="text-text-main text-sm font-semibold">{f.title}</p>
                <p className="text-text-muted text-xs leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-[420px] flex flex-col justify-center px-8 py-12 lg:px-12">

        <div className="mb-8">
          <h3 className="text-text-main text-2xl font-bold">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h3>
          <p className="text-text-muted text-sm mt-1">
            {isSignUp ? 'Start investing smarter today' : 'Sign in to your AlgoVest account'}
          </p>
        </div>

        {/* Google login */}
        <button
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin }
            })
          }}
          className="w-full flex items-center justify-center gap-3 bg-elevated border border-border rounded-xl py-3 text-text-main text-sm font-medium hover:border-primary transition-colors mb-4"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-text-hint text-xs">or use email</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          {isSignUp && (
            <div>
              <label className="text-text-muted text-xs font-medium mb-1.5 block">FULL NAME</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-text-muted text-xs font-medium mb-1.5 block">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-text-muted text-xs font-medium mb-1.5 block">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button className="text-primary text-xs font-medium">Forgot password?</button>
            </div>
          )}

          {error && <p className="text-loss-text text-xs">{error}</p>}
          {message && <p className="text-primary text-xs">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </div>

        {/* Switch */}
        <p className="text-center text-text-muted text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
              setEmail('')
              setPassword('')
              setName('')
            }}
            className="text-primary font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="text-center text-text-hint text-xs mt-8">
          By continuing you agree to AlgoVest's Terms of Service and Privacy Policy
        </p>

      </div>

    </div>
  )
}