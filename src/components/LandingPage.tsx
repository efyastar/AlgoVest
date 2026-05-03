import { useEffect, useState } from 'react'

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: 'A',
      title: 'Meet Afrifa, your AI advisor',
      desc: 'Afrifa analyses your budget, risk level and goals to suggest the perfect portfolio split — across individual stocks and long-term index funds.',
    },
    {
      icon: '↑',
      title: 'Live market alerts',
      desc: 'Set thresholds for any stock or crypto. The moment it drops, you get notified with instant AI guidance on whether to buy or wait.',
    },
    {
      icon: '$',
      title: 'Smart portfolio tracking',
      desc: 'Track every investment in real time. See your current value, profit and loss, and get proactive suggestions when something underperforms.',
    },
    {
      icon: 'G',
      title: 'Built for the world',
      desc: 'Whether you are in Ghana, Nigeria, the UK or the US — AlgoVest recommends the right platforms and account types for your country.',
    },
    {
      icon: 'L',
      title: 'Learn as you invest',
      desc: 'Curated videos filtered by level, topic and goal. From complete beginners to experienced investors — there is something for everyone.',
    },
    {
      icon: 'S',
      title: 'Your data, always safe',
      desc: 'Built on Supabase with row-level security. Your investments, plans and alerts are private and only visible to you.',
    },
  ]

  const steps = [
    { number: '01', title: 'Create your account', desc: 'Sign up in seconds with your email or Google account.' },
    { number: '02', title: 'Tell us about yourself', desc: 'Answer a few quick questions — new investor or experienced, your currency, risk level and budget goal.' },
    { number: '03', title: 'Meet Afrifa', desc: 'Your AI advisor is ready. Enter a budget and get an instant personalized portfolio suggestion.' },
    { number: '04', title: 'Track and grow', desc: 'Add your investments, set market alerts and let Afrifa guide you as the market moves.' },
  ]

  const stats = [
    { value: '190+', label: 'Countries' },
    { value: '5', label: 'Currencies' },
    { value: 'Real-time', label: 'Market data' },
    { value: 'AI-first', label: 'Investment advice' },
  ]

  return (
    <div className="min-h-screen bg-base font-sans">

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(34,197,94,0.1) 0%, transparent 60%)',
          opacity: Math.max(0, 1 - scrollY * 0.003),
        }}
      />

      {/* Grid lines */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: Math.max(0, 0.3 - scrollY * 0.001),
          backgroundImage: `linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-16 border-b border-border">
        <h1
          className="text-xl font-bold text-text-main"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          AlgoVest
        </h1>
        <div className="flex items-center gap-2">
            <button
                onClick={onGetStarted}
                className="text-text-muted text-sm font-medium hover:text-text-main transition-colors px-3 py-2"
            >
                Sign in
            </button>
            <button
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary-hover text-base text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
                Get started
            </button>
        </div>
      </nav>

      <div className="relative z-10">

        {/* Hero */}
        <section className="flex flex-col items-center text-center px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 bg-primary-tint border border-primary rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-medium">Powered by Afrifa AI</span>
          </div>

          <h2
            className="text-5xl md:text-7xl font-bold text-text-main leading-tight mb-6 max-w-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Invest smarter.{' '}
            <span className="text-primary italic">Wherever you are.</span>
          </h2>

          <p className="text-text-muted text-lg md:text-xl leading-relaxed max-w-xl mb-10">
            AlgoVest is your AI-powered investment companion. Get personalized portfolio suggestions, live market alerts and expert guidance — built for investors everywhere.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-text-main text-2xl font-bold">{stat.value}</p>
                <p className="text-text-muted text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-6 md:px-16 py-20 border-t border-border">
          <div className="text-center mb-12">
            <h3
              className="text-3xl md:text-4xl font-bold text-text-main mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Everything you need to invest well
            </h3>
            <p className="text-text-muted text-base max-w-lg mx-auto">
              From AI-powered advice to real-time alerts — AlgoVest gives you the tools that were previously only available to professional investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-6 hover:border-primary transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-tint border border-primary flex items-center justify-center mb-4">
                  <span className="text-primary text-sm font-bold">{f.icon}</span>
                </div>
                <p className="text-text-main font-semibold mb-2">{f.title}</p>
                <p className="text-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 md:px-16 py-20 border-t border-border">
          <div className="text-center mb-12">
            <h3
              className="text-3xl md:text-4xl font-bold text-text-main mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How it works
            </h3>
            <p className="text-text-muted text-base max-w-lg mx-auto">
              Get started in minutes. No financial experience required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-border z-0" />
                )}
                <div className="relative z-10">
                  <div
                    className="text-primary text-3xl font-bold mb-3"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {step.number}
                  </div>
                  <p className="text-text-main font-semibold mb-2">{step.title}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-16 py-20 border-t border-border">
          <div className="max-w-2xl mx-auto text-center bg-surface border border-border rounded-3xl p-12">
            <div className="w-16 h-16 rounded-2xl bg-primary-tint border border-primary flex items-center justify-center mx-auto mb-6">
              <span
                className="text-primary text-2xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                A
              </span>
            </div>
            <h3
              className="text-3xl font-bold text-text-main mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready to invest smarter?
            </h3>
            <p className="text-text-muted text-base mb-8 leading-relaxed">
              Join investors across Africa, Europe and the Americas who are using AlgoVest to make better investment decisions every day.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-16 py-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 AlgoVest. Built with Afrifa AI.
          </p>
          <p className="text-text-muted text-xs">
            Not financial advice. Always do your own research.
          </p>
        </footer>

      </div>
    </div>
  )
}