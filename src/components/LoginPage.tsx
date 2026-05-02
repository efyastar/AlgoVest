import { useState } from 'react'
import { supabase } from '../supabase'

export default function LoginPage({ onSignUp: _onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    if (isSignUp && name.trim() === '') {
      setError('Please enter your full name')
      return
    }
    if (email.trim() === '') {
      setError('Please enter your email address')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.trim() === '') {
      setError('Please enter your password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: 'https://algo-vest-b864.vercel.app'
        }
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account, then sign in!')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        onLogin()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/AlgoVest.png"
            alt="AlgoVest logo"
            className="w-32 h-32 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-text-main">AlgoVest</h1>
          <p className="text-text-muted text-sm mt-1">Smart investing for everyone</p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-border rounded-2xl p-6">

          <h2 className="text-text-main font-semibold text-lg mb-6">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>

          {isSignUp && (
            <div className="mb-4">
              <label className="text-text-muted text-xs font-medium mb-2 block">FULL NAME</label>
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

          <div className="mb-4">
            <label className="text-text-muted text-xs font-medium mb-2 block">EMAIL</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="mb-2">
            <label className="text-text-muted text-xs font-medium mb-2 block">PASSWORD</label>
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
            <div className="flex justify-end mb-6">
              <button className="text-primary text-xs font-medium">
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="text-loss-text text-xs mt-3 mb-1">{error}</p>}
          {message && <p className="text-primary text-xs mt-3 mb-1">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-text-hint text-xs">or continue with</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: 'https://algo-vest-b864.vercel.app'
                }
              })
            }}
            className="w-full flex items-center justify-center gap-3 bg-elevated border border-border rounded-xl py-3 text-text-main text-sm font-medium hover:border-primary transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
        </div>

        {/* Sign up link */}
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
    </div>
  )
}