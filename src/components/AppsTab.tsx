import { useState } from 'react'

type App = {
  name: string
  logo: string
  tagline: string
  goodFor: string
  bestFor: string
  rating: number
  afrifaSays: string
  downloadUrl: string
  region: string
  category: string
}

const APPS: App[] = [
  // Africa
  {
    name: 'Quidax',
    logo: '🇬🇭',
    tagline: 'Buy and sell crypto in Africa',
    goodFor: 'Crypto trading with GHS, NGN and KES',
    bestFor: 'Beginners in Ghana, Nigeria and Kenya',
    rating: 4,
    afrifaSays: 'Great starting point if you are in Ghana or Nigeria and want to buy crypto with your local currency.',
    downloadUrl: 'https://quidax.com',
    region: 'Africa',
    category: 'Crypto',
  },
  {
    name: 'Zeepay',
    logo: '🇬🇭',
    tagline: 'Mobile money meets investing',
    goodFor: 'Investing with Mobile Money in Ghana',
    bestFor: 'Ghanaians using MTN MoMo or Vodafone Cash',
    rating: 4,
    afrifaSays: 'Perfect if you want to invest directly from your mobile money wallet without a bank account.',
    downloadUrl: 'https://myzeepay.com',
    region: 'Africa',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Bamboo',
    logo: '🇳🇬',
    tagline: 'Invest in US stocks from Africa',
    goodFor: 'Buying US stocks from Nigeria and Ghana',
    bestFor: 'Africans who want exposure to US markets',
    rating: 5,
    afrifaSays: 'One of the best ways to buy Apple, Tesla and S&P 500 ETFs from Africa. Highly recommended.',
    downloadUrl: 'https://investbamboo.com',
    region: 'Africa',
    category: 'Stocks',
  },
  {
    name: 'Chaka',
    logo: '🇳🇬',
    tagline: 'Global stocks for Africans',
    goodFor: 'US and Nigerian stocks in one app',
    bestFor: 'Nigerian investors wanting global diversification',
    rating: 4,
    afrifaSays: 'Solid choice for Nigerians who want to invest in both local and international markets.',
    downloadUrl: 'https://chaka.ng',
    region: 'Africa',
    category: 'Stocks',
  },
  {
    name: 'M-Pesa',
    logo: '🇰🇪',
    tagline: 'Mobile money and savings in Kenya',
    goodFor: 'Savings and money transfers in Kenya',
    bestFor: 'Kenyans starting their financial journey',
    rating: 4,
    afrifaSays: 'A great entry point for Kenyans — start saving here before moving into stocks and crypto.',
    downloadUrl: 'https://mpesa.com',
    region: 'Africa',
    category: 'Savings',
  },

  // Americas
  {
    name: 'Robinhood',
    logo: '🇺🇸',
    tagline: 'Commission-free stock trading',
    goodFor: 'Stocks, ETFs and crypto with no fees',
    bestFor: 'US-based beginners',
    rating: 4,
    afrifaSays: 'The easiest way to start buying stocks if you are in the US. Zero commission is a big plus.',
    downloadUrl: 'https://robinhood.com',
    region: 'Americas',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Coinbase',
    logo: '🇺🇸',
    tagline: 'The most trusted crypto exchange',
    goodFor: 'Buying Bitcoin, Ethereum and 200+ coins',
    bestFor: 'Crypto beginners in the US and Canada',
    rating: 5,
    afrifaSays: 'If you are new to crypto this is the safest and most beginner-friendly place to start.',
    downloadUrl: 'https://coinbase.com',
    region: 'Americas',
    category: 'Crypto',
  },
  {
    name: 'Wealthsimple',
    logo: '🇨🇦',
    tagline: 'Investing made simple for Canadians',
    goodFor: 'Stocks, ETFs and crypto for Canadians',
    bestFor: 'Canadian beginners and long-term investors',
    rating: 5,
    afrifaSays: 'The best investing app for Canadians — clean interface, no fees on basic trades and great ETF options.',
    downloadUrl: 'https://wealthsimple.com',
    region: 'Americas',
    category: 'Stocks & ETFs',
  },

  // Europe
  {
    name: 'Trading 212',
    logo: '🇬🇧',
    tagline: 'Free stock and ETF trading in Europe',
    goodFor: 'Stocks and ETFs with zero commission',
    bestFor: 'UK and EU investors starting out',
    rating: 5,
    afrifaSays: 'Probably the best free investing app in Europe. Great for building a long-term ETF portfolio.',
    downloadUrl: 'https://trading212.com',
    region: 'Europe',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Revolut',
    logo: '🇬🇧',
    tagline: 'Banking and investing in one app',
    goodFor: 'Stocks, crypto and currency exchange',
    bestFor: 'Europeans who want everything in one place',
    rating: 4,
    afrifaSays: 'Convenient if you already use Revolut for banking — easy to start investing without opening a new account.',
    downloadUrl: 'https://revolut.com',
    region: 'Europe',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Freetrade',
    logo: '🇬🇧',
    tagline: 'Simple stock investing for the UK',
    goodFor: 'UK stocks and ETFs with no commission',
    bestFor: 'UK beginners building a long-term portfolio',
    rating: 4,
    afrifaSays: 'Clean and simple — great for UK investors who want to start small and grow over time.',
    downloadUrl: 'https://freetrade.io',
    region: 'Europe',
    category: 'Stocks & ETFs',
  },

  // Asia
  {
    name: 'Groww',
    logo: '🇮🇳',
    tagline: 'Stocks and mutual funds for Indians',
    goodFor: 'Indian stocks, mutual funds and ETFs',
    bestFor: 'Indian beginners investing in local markets',
    rating: 5,
    afrifaSays: 'The go-to app for Indian investors — huge selection of mutual funds and very easy to use.',
    downloadUrl: 'https://groww.in',
    region: 'Asia',
    category: 'Stocks & Funds',
  },
  {
    name: 'Tiger Brokers',
    logo: '🇸🇬',
    tagline: 'Global investing from Asia',
    goodFor: 'US, HK and Singapore stocks',
    bestFor: 'Asian investors wanting global exposure',
    rating: 4,
    afrifaSays: 'Strong choice for Singapore and Hong Kong investors who want access to US and Asian markets.',
    downloadUrl: 'https://tigerbrokers.com',
    region: 'Asia',
    category: 'Stocks',
  },
  {
    name: 'Binance',
    logo: '🌍',
    tagline: 'World\'s largest crypto exchange',
    goodFor: 'Crypto trading available in most countries',
    bestFor: 'Anyone serious about crypto globally',
    rating: 5,
    afrifaSays: 'Available almost everywhere and has the most trading options. Good for intermediate crypto investors.',
    downloadUrl: 'https://binance.com',
    region: 'Asia',
    category: 'Crypto',
  },
]

const REGIONS = ['All', 'Africa', 'Americas', 'Europe', 'Asia']
const CATEGORIES = ['All', 'Stocks', 'Crypto', 'ETFs', 'Savings', 'Stocks & Crypto', 'Stocks & ETFs', 'Stocks & Funds']

export default function AppsTab() {
  const [activeRegion, setActiveRegion] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = APPS.filter(app => {
    const regionMatch = activeRegion === 'All' || app.region === activeRegion
    const categoryMatch = activeCategory === 'All' || app.category.includes(activeCategory)
    return regionMatch && categoryMatch
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-primary' : 'text-border'}>★</span>
    ))
  }

  return (
    <div className="w-full max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-text-main text-xl font-bold mb-1">Investment Apps</h2>
        <p className="text-text-muted text-sm">
          Afrifa's picks for the best investing apps by region
        </p>
      </div>

      {/* Region filter */}
      <div className="mb-3">
        <p className="text-text-muted text-xs font-medium mb-2">REGION</p>
        <div className="flex gap-2 flex-wrap">
          {REGIONS.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeRegion === region
                  ? 'bg-primary text-base'
                  : 'bg-elevated border border-border text-text-muted hover:text-text-main'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <p className="text-text-muted text-xs font-medium mb-2">CATEGORY</p>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Stocks', 'Crypto', 'ETFs', 'Savings'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-base'
                  : 'bg-elevated border border-border text-text-muted hover:text-text-main'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* App cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📲</p>
            <p className="text-text-main font-medium mb-1">No apps found</p>
            <p className="text-text-muted text-sm">Try a different region or category</p>
          </div>
        )}

        {filtered.map((app, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5">

            {/* Top row */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center text-2xl flex-shrink-0">
                {app.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-text-main font-semibold">{app.name}</p>
                  <span className="text-xs bg-elevated text-text-muted px-2 py-0.5 rounded-full">
                    {app.region}
                  </span>
                </div>
                <p className="text-text-muted text-xs mt-0.5">{app.tagline}</p>
                <div className="flex items-center gap-1 mt-1">
                  {renderStars(app.rating)}
                  <span className="text-text-muted text-xs ml-1">Afrifa's rating</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-elevated rounded-xl p-3 mb-3">
              <div className="flex gap-2 mb-2">
                <span className="text-text-muted text-xs w-20 flex-shrink-0">Good for</span>
                <span className="text-text-main text-xs">{app.goodFor}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-xs w-20 flex-shrink-0">Best for</span>
                <span className="text-text-main text-xs">{app.bestFor}</span>
              </div>
            </div>

            {/* Afrifa says */}
            <div className="flex gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-base text-xs font-bold">A</span>
              </div>
              <p className="text-text-muted text-xs leading-relaxed italic">
                "{app.afrifaSays}"
              </p>
            </div>

            {/* Download button */}
            <button
              onClick={() => window.open(app.downloadUrl, '_blank')}
              className="w-full bg-primary hover:bg-primary-hover text-base font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Visit {app.name} →
            </button>

          </div>
        ))}
      </div>

    </div>
  )
}