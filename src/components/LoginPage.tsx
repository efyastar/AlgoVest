import { useState } from 'react'

export default function LoginPage({ onSignUp, onLogin }: { onSignUp: () => void, onLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

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

    if (isSignUp) {
      onSignUp()
    } else {
      onLogin()
    }
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

          {/* Title */}
          <h2 className="text-text-main font-semibold text-lg mb-6">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>

          {/* Name field - only shows on sign up */}
          {isSignUp && (
            <div className="mb-4">
              <label className="text-text-muted text-xs font-medium mb-2 block">
                FULL NAME
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="text-text-muted text-xs font-medium mb-2 block">
              EMAIL
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="text-text-muted text-xs font-medium mb-2 block">
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown = {(e) => e.key == 'Enter' && e.preventDefault()}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-text-main text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Forgot password - only on login */}
          {!isSignUp && (
            <div className="flex justify-end mb-6">
              <button className="text-primary text-xs font-medium">
                Forgot password?
              </button>
            </div>
          )}

          {/* Error message */}
          {error !== '' && (
            <p className="text-loss-text text-xs mt-3 mb-1">{error}</p>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-3 rounded-xl transition-colors mt-4"
          >
            {isSignUp ? 'Create account' : 'Sign in'}
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
          <button className="w-full flex items-center justify-center gap-3 bg-elevated border border-border rounded-xl py-3 text-text-muted text-sm font-medium cursor-not-allowed opacity-50">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center gap-3 bg-elevated border border-border rounded-xl py-3 text-text-muted text-sm font-medium cursor-not-allowed opacity-50">
            <svg className="w-4 h-4 fill-text-main" viewBox="0 0 814 1000">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.9 135.4-318 268.1-318 68.2 0 124.6 44.8 166.5 44.8 39.7 0 101.6-47.7 179.9-47.7 28.5 0 130.9 2.6 198.3 99zM554.1 198.6c31.2-36.7 53.3-87.7 53.3-138.7 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.3-55.1 135 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.3-71.4z"/>
            </svg>
            Continue with Apple
          </button>
          <p className="text-text-hint text-xs text-center">Google and Apple login coming soon</p>
        </div>

        {/* Sign up link */}
        <p className="text-center text-text-muted text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
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