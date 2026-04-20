import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import LoginPage from './components/LoginPage'
import Onboarding from './components/Onboarding'
import LearnTab from './components/LearnTab'
import AdvisorTab from './components/AdvisorTab'
import PortfolioTab from './components/PortfolioTab'
import AlertsTab from './components/AlertsTab'
import AppsTab from './components/AppsTab'

const tabs = [
  { id: 'learn', label: 'Learn' },
  { id: 'advisor', label: 'Advisor' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'apps', label: 'Apps' },
]

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [activeTab, setActiveTab] = useState('learn')
  const [showInvestPopup, setShowInvestPopup] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setScreen('main')
      } else {
        setScreen('login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setScreen('main')
      } else {
        setScreen('login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = () => {
    setScreen('main')
    setShowInvestPopup(true)
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/AlgoVest.png" alt="AlgoVest" className="w-16 h-16 object-contain animate-pulse" />
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base font-sans">

      {screen === 'login' && (
        <LoginPage
          onSignUp={() => setScreen('onboarding')}
          onLogin={handleLogin}
        />
      )}

      {screen === 'onboarding' && (
        <Onboarding onFinish={handleLogin} />
      )}

      {screen === 'main' && (
        <div className="w-full min-h-screen flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src="/AlgoVest.png" alt="AlgoVest" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-sm font-semibold text-text-main">AlgoVest</h1>
                <p className="text-xs text-text-muted">smart investing for everyone</p>
              </div>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                setScreen('login')
              }}
              className="text-text-muted text-xs hover:text-loss-text transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 px-4 py-6 md:px-8 lg:px-16 pb-24 md:pb-6">
            {activeTab === 'learn'     && <LearnTab />}
            {activeTab === 'advisor'   && <AdvisorTab />}
            {activeTab === 'portfolio' && <PortfolioTab />}
            {activeTab === 'alerts'    && <AlertsTab />}
            {activeTab === 'apps'      && <AppsTab />}
          </div>

          {/* Bottom nav — mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex md:hidden z-10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-text-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Top nav — tablet/desktop */}
          <div className="hidden md:flex fixed top-0 right-16 gap-1 p-4 z-10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-base'
                    : 'text-text-muted hover:text-text-main hover:bg-elevated'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Invest today popup */}
          {showInvestPopup && (
            <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-surface border border-primary rounded-2xl p-4 z-20 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💡</span>
                  </div>
                  <div>
                    <p className="text-text-main text-sm font-semibold">Want to invest today?</p>
                    <p className="text-text-muted text-xs mt-0.5">Ask Afrifa what to do with your budget</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvestPopup(false)}
                  className="text-text-muted hover:text-text-main text-lg leading-none flex-shrink-0"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowInvestPopup(false)}
                  className="flex-1 py-2 rounded-lg border border-border text-text-muted text-sm"
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    setShowInvestPopup(false)
                    setActiveTab('advisor')
                  }}
                  className="flex-1 py-2 rounded-lg bg-primary text-base text-sm font-semibold"
                >
                  Let's go →
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}