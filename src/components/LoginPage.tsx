import { useState } from 'react'
import { supabase } from '../supabase'

export default function LoginPage({ onSignUp: _onSignUp, onLogin, onBack }: { onSignUp: () => void, onLogin: () => void, onBack: () => void }) {
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
        email, password,
        options: { data: { full_name: name }, emailRedirectTo: window.location.origin }
      })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account, then sign in!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Back to landing */}
        <button
          onClick={onBack}
          className="text-text-muted text-sm mb-6 hover:text-text-main transition-colors flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="bg-surface border border-border rounded-2xl p-8">

          <div className="text-center mb-6">
            <h1
              className="text-text-main text-2xl font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isSignUp ? 'Get started' : 'Welcome back'}
            </h1>
            <p className="text-text-muted text-sm">
              {isSignUp ? 'Create your AlgoVest account' : 'Sign in to your account'}
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

        </div>

        <p className="text-center text-text-hint text-xs mt-6">
          By continuing you agree to AlgoVest's Terms of Service and Privacy Policy
        </p>

      </div>
    </div>
  )
}