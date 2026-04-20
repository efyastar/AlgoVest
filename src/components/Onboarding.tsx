import { useState } from 'react'

const STEPS = [
  'New to investing?',
  'Pick your currency',
  'Set your risk level',
  'Watch intro videos',
  'Set your budget goal',
]

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isNewToInvesting, setIsNewToInvesting] = useState<boolean | null>(null)
  const [currency, setCurrency] = useState('')
  const [risk, setRisk] = useState('')
  const [budget, setBudget] = useState('')

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onFinish()
    }
  }

  const goBack = () => setCurrentStep(prev => prev - 1)

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-base flex flex-col px-4 py-6 max-w-lg mx-auto">

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-4">
        {currentStep > 0 && (
          <button
            onClick={goBack}
            className="text-text-muted hover:text-text-main transition-colors text-sm"
          >
            ← Back
          </button>
        )}
        <span className="text-text-muted text-xs ml-auto">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-elevated rounded-full mb-8">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Step content */}
      <div className="flex-1">

        {/* Step 1 — New to investing? */}
        {currentStep === 0 && (
          <div>
            <h2 className="text-text-main text-2xl font-bold mb-2">
              Are you new to investing?
            </h2>
            <p className="text-text-muted text-sm mb-8">
              This helps us personalise your experience
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsNewToInvesting(true)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isNewToInvesting === true
                    ? 'border-primary bg-primary-tint text-text-main'
                    : 'border-border bg-elevated text-text-muted'
                }`}
              >
                <div className="font-medium text-sm">Yes, I am new</div>
                <div className="text-xs mt-1 opacity-70">I want to learn the basics first</div>
              </button>
              <button
                onClick={() => setIsNewToInvesting(false)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isNewToInvesting === false
                    ? 'border-primary bg-primary-tint text-text-main'
                    : 'border-border bg-elevated text-text-muted'
                }`}
              >
                <div className="font-medium text-sm">No, I have experience</div>
                <div className="text-xs mt-1 opacity-70">I know my way around markets</div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Pick currency */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-text-main text-2xl font-bold mb-2">
              Pick your currency
            </h2>
            <p className="text-text-muted text-sm mb-8">
              All amounts will be shown in this currency
            </p>
            <div className="flex flex-col gap-3">
              {[
                { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
                { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
                { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
                { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
                { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    currency === c.code
                      ? 'border-primary bg-primary-tint text-text-main'
                      : 'border-border bg-elevated text-text-muted'
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <div className="font-medium text-sm">{c.code}</div>
                    <div className="text-xs opacity-70">{c.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Risk level */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-text-main text-2xl font-bold mb-2">
              Set your risk level
            </h2>
            <p className="text-text-muted text-sm mb-8">
              This affects which investments we suggest for you
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                  level: 'conservative',
                  title: 'Conservative',
                  desc: 'Low risk, steady growth. Bonds, ETFs, stable stocks.',
                  emoji: '🛡️'
                },
                {
                  level: 'moderate',
                  title: 'Moderate',
                  desc: 'Balanced risk and reward. Mix of stocks and crypto.',
                  emoji: '⚖️'
                },
                {
                  level: 'aggressive',
                  title: 'Aggressive',
                  desc: 'High risk, high reward. Crypto, growth stocks.',
                  emoji: '🚀'
                },
              ].map((r) => (
                <button
                  key={r.level}
                  onClick={() => setRisk(r.level)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    risk === r.level
                      ? 'border-primary bg-primary-tint text-text-main'
                      : 'border-border bg-elevated text-text-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{r.emoji}</span>
                    <span className="font-medium text-sm">{r.title}</span>
                  </div>
                  <div className="text-xs opacity-70">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Watch intro videos */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-text-main text-2xl font-bold mb-2">
              Watch intro videos
            </h2>
            <p className="text-text-muted text-sm mb-8">
              A few short videos to get you started. You can always watch more in the Learn tab.
            </p>
            <div className="flex flex-col gap-3">
              {[
                {
                    title: "The Only Investing Video You'll Ever Need",
                    channel: 'Mark Tilbury',
                    url: 'https://youtu.be/Ay4fmZdZqJE',
                    id: 'Ay4fmZdZqJE'
                },
                {
                    title: "How to Invest for Beginners (2026)",
                    channel: 'Ali Abdaal',
                    url: 'https://youtu.be/lNdOtlpmH5U',
                    id: 'lNdOtlpmH5U'
                },
                {
                    title: "Stock Market for Beginners — The Ultimate Guide",
                    channel: 'Humphrey Yang',
                    url: 'https://youtu.be/bb6_M_srMBk',
                    id: 'bb6_M_srMBk'
                },
                ].map((v, i) => (
                <button
                    key={i}
                    onClick={() => window.open(v.url, '_blank')}
                    className="w-full border border-border bg-elevated rounded-xl overflow-hidden flex hover:border-primary transition-all"
                >
                    <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-24 h-16 object-cover flex-shrink-0"
                    />
                    <div className="p-3 text-left">
                    <div className="text-text-main text-xs font-medium leading-snug line-clamp-2">{v.title}</div>
                    <div className="text-text-muted text-xs mt-1">{v.channel}</div>
                    </div>
                </button>
                ))}
              <p className="text-text-hint text-xs text-center mt-2">
                Tap any video to watch · or skip for now
              </p>
            </div>
          </div>
        )}

        {/* Step 5 — Budget goal */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-text-main text-2xl font-bold mb-2">
              Set your first budget goal
            </h2>
            <p className="text-text-muted text-sm mb-8">
              How much are you thinking of investing to start?
            </p>
            <div className="bg-elevated border border-border rounded-xl p-4 flex items-center gap-2 mb-4">
              <span className="text-text-muted text-lg font-medium">
                {currency || '$'}
              </span>
              <input
                type="number"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-transparent text-text-main text-2xl font-semibold outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['100', '500', '1000', '5000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBudget(amount)}
                  className="px-4 py-2 rounded-lg border border-border bg-elevated text-text-muted text-sm hover:border-primary hover:text-text-main transition-colors"
                >
                  {currency || '$'}{amount}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={goNext}
          className="text-text-muted text-sm hover:text-text-main transition-colors"
        >
          Skip
        </button>
        <button
          onClick={goNext}
          className="bg-primary hover:bg-primary-hover text-base font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {currentStep === STEPS.length - 1 ? 'Finish ✓' : 'Continue →'}
        </button>
      </div>

    </div>
  )
}