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
  country: string
  category: string
}

const getLogo = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

const APPS: App[] = [
  // West Africa — Ghana
  {
    name: 'Quidax',
    logo: getLogo('quidax.com'),
    tagline: 'Buy and sell crypto in Africa',
    goodFor: 'Crypto trading with GHS and NGN',
    bestFor: 'Beginners in Ghana and Nigeria',
    rating: 4,
    afrifaSays: 'Great starting point if you are in Ghana or Nigeria and want to buy crypto with your local currency.',
    downloadUrl: 'https://quidax.com',
    region: 'Africa',
    country: 'Ghana · Nigeria',
    category: 'Crypto',
  },
  {
    name: 'Zeepay',
    logo: getLogo('myzeepay.com'),
    tagline: 'Mobile money meets investing',
    goodFor: 'Investing with Mobile Money in Ghana',
    bestFor: 'Ghanaians using MTN MoMo or Vodafone Cash',
    rating: 4,
    afrifaSays: 'Perfect if you want to invest directly from your mobile money wallet without a bank account.',
    downloadUrl: 'https://myzeepay.com',
    region: 'Africa',
    country: 'Ghana',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Databank',
    logo: getLogo('databankgroup.com'),
    tagline: "Ghana's leading investment bank",
    goodFor: 'Mutual funds, stocks and bonds in Ghana',
    bestFor: 'Ghanaians wanting local professional investment management',
    rating: 5,
    afrifaSays: 'One of the most trusted investment firms in Ghana. Great for mutual funds and long-term investing in GHS.',
    downloadUrl: 'https://databankgroup.com',
    region: 'Africa',
    country: 'Ghana',
    category: 'Stocks & Funds',
  },
  {
    name: 'CDH Securities',
    logo: getLogo('cdhsecurities.com'),
    tagline: 'Ghana Stock Exchange broker',
    goodFor: 'Buying and selling GSE listed stocks',
    bestFor: 'Ghanaians investing in local companies',
    rating: 4,
    afrifaSays: 'If you want to invest in Ghanaian companies like MTN Ghana, CAL Bank and Tullow Oil, CDH is a solid choice.',
    downloadUrl: 'https://cdhsecurities.com',
    region: 'Africa',
    country: 'Ghana',
    category: 'Stocks',
  },
  {
    name: 'Bamboo',
    logo: getLogo('investbamboo.com'),
    tagline: 'Invest in US stocks from Africa',
    goodFor: 'Buying US stocks from Nigeria and Ghana',
    bestFor: 'Africans who want exposure to US markets',
    rating: 5,
    afrifaSays: 'One of the best ways to buy Apple, Tesla and S&P 500 ETFs from Africa. Highly recommended.',
    downloadUrl: 'https://investbamboo.com',
    region: 'Africa',
    country: 'Ghana · Nigeria · Kenya',
    category: 'Stocks',
  },

  // West Africa — Nigeria
  {
    name: 'Chaka',
    logo: getLogo('chaka.ng'),
    tagline: 'Global stocks for Africans',
    goodFor: 'US and Nigerian stocks in one app',
    bestFor: 'Nigerian investors wanting global diversification',
    rating: 4,
    afrifaSays: 'Solid choice for Nigerians who want to invest in both local and international markets.',
    downloadUrl: 'https://chaka.ng',
    region: 'Africa',
    country: 'Nigeria',
    category: 'Stocks',
  },
  {
    name: 'Rise',
    logo: getLogo('risevest.com'),
    tagline: 'Dollar investments from Africa',
    goodFor: 'Investing in dollars from any African country',
    bestFor: 'Africans who want to protect against currency devaluation',
    rating: 5,
    afrifaSays: 'If you want to invest in dollars and protect your money from currency fluctuation, Rise is excellent.',
    downloadUrl: 'https://risevest.com',
    region: 'Africa',
    country: 'Nigeria · Ghana · Kenya',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Cowrywise',
    logo: getLogo('cowrywise.com'),
    tagline: 'Savings and mutual funds in Nigeria',
    goodFor: 'Savings plans and mutual fund investing',
    bestFor: 'Nigerians starting their investment journey',
    rating: 4,
    afrifaSays: 'Great for disciplined saving and getting started with mutual funds in Nigeria.',
    downloadUrl: 'https://cowrywise.com',
    region: 'Africa',
    country: 'Nigeria',
    category: 'Savings & Funds',
  },
  {
    name: 'PiggyVest',
    logo: getLogo('piggyvest.com'),
    tagline: 'Save and invest in Nigeria',
    goodFor: 'Savings, fixed deposits and investments',
    bestFor: 'Nigerians building a savings habit',
    rating: 4,
    afrifaSays: 'One of the most popular savings apps in Nigeria. Great for locking money away and earning interest.',
    downloadUrl: 'https://piggyvest.com',
    region: 'Africa',
    country: 'Nigeria',
    category: 'Savings',
  },
  {
    name: 'Stanbic IBTC',
    logo: getLogo('stanbicibtc.com'),
    tagline: 'Full service investing in Nigeria',
    goodFor: 'Stocks, bonds, mutual funds and pension',
    bestFor: 'Nigerians wanting a full-service bank and broker',
    rating: 4,
    afrifaSays: 'A trusted name in Nigerian finance. Good if you want stocks, pension and savings all in one place.',
    downloadUrl: 'https://stanbicibtc.com',
    region: 'Africa',
    country: 'Nigeria',
    category: 'Stocks & Funds',
  },
  {
    name: 'Trove',
    logo: getLogo('trovenow.com'),
    tagline: 'Nigerian and US stocks in one place',
    goodFor: 'NGX and NYSE stocks from Nigeria',
    bestFor: 'Nigerian investors wanting both local and US exposure',
    rating: 4,
    afrifaSays: 'Clean app for buying both Nigerian and US stocks. A great alternative to Chaka.',
    downloadUrl: 'https://trovenow.com',
    region: 'Africa',
    country: 'Nigeria',
    category: 'Stocks',
  },

  // West Africa — Francophone
  {
    name: 'BRVM Direct',
    logo: getLogo('brvm.org'),
    tagline: 'West African regional stock exchange',
    goodFor: 'Stocks from 8 West African countries',
    bestFor: 'French-speaking West African investors',
    rating: 4,
    afrifaSays: "The BRVM covers Senegal, Côte d'Ivoire, Burkina Faso and 5 other countries. Great for regional investing.",
    downloadUrl: 'https://brvm.org',
    region: 'Africa',
    country: "Senegal · Côte d'Ivoire · Burkina Faso",
    category: 'Stocks',
  },

  // Pan-African
  {
    name: 'Chipper Cash',
    logo: getLogo('chippercash.com'),
    tagline: 'Cross-border payments and investing',
    goodFor: 'Sending money across Africa and investing',
    bestFor: 'Pan-African users who send and invest money',
    rating: 4,
    afrifaSays: 'Great if you send money across African borders and want to invest at the same time.',
    downloadUrl: 'https://chippercash.com',
    region: 'Africa',
    country: 'Ghana · Nigeria · Kenya · Uganda · Tanzania',
    category: 'Stocks & Crypto',
  },

  // East Africa
  {
    name: 'M-Pesa',
    logo: getLogo('safaricom.co.ke'),
    tagline: 'Mobile money and savings in Kenya',
    goodFor: 'Savings and money transfers in Kenya',
    bestFor: 'Kenyans starting their financial journey',
    rating: 4,
    afrifaSays: 'A great entry point for Kenyans — start saving here before moving into stocks and crypto.',
    downloadUrl: 'https://safaricom.co.ke/personal/m-pesa',
    region: 'Africa',
    country: 'Kenya · Tanzania · Uganda',
    category: 'Savings',
  },
  {
    name: 'Sycamore',
    logo: getLogo('sycamore.ng'),
    tagline: 'Investing and lending in East Africa',
    goodFor: 'Savings and investment products in Kenya',
    bestFor: 'Kenyans wanting easy digital investing',
    rating: 3,
    afrifaSays: 'A growing platform in East Africa for those who want simple digital savings and investment products.',
    downloadUrl: 'https://sycamore.ng',
    region: 'Africa',
    country: 'Kenya · Uganda',
    category: 'Savings & Funds',
  },

  // Southern Africa
  {
    name: 'EasyEquities',
    logo: getLogo('easyequities.co.za'),
    tagline: 'Invest in South African and US stocks',
    goodFor: 'JSE and US stocks with fractional shares',
    bestFor: 'South Africans wanting to invest locally and globally',
    rating: 5,
    afrifaSays: 'The best investing app for South Africans — you can buy fractional shares for as little as R10.',
    downloadUrl: 'https://easyequities.co.za',
    region: 'Africa',
    country: 'South Africa',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Standard Bank',
    logo: getLogo('standardbank.com'),
    tagline: 'Full service investing across Africa',
    goodFor: 'Stocks, bonds and funds across Southern Africa',
    bestFor: 'Southern African investors wanting a trusted bank',
    rating: 4,
    afrifaSays: 'Standard Bank has operations across Africa and offers solid investment products for Southern African investors.',
    downloadUrl: 'https://standardbank.com',
    region: 'Africa',
    country: 'South Africa · Zimbabwe · Zambia · Botswana',
    category: 'Stocks & Funds',
  },

  // North Africa
  {
    name: 'EFG Hermes',
    logo: getLogo('efghermes.com'),
    tagline: 'Leading investment bank in North Africa',
    goodFor: 'Egyptian Exchange stocks and regional investments',
    bestFor: 'Egyptian and North African investors',
    rating: 4,
    afrifaSays: 'One of the most respected investment firms in Egypt and the Middle East. Great for North African investors.',
    downloadUrl: 'https://efghermes.com',
    region: 'Africa',
    country: 'Egypt · Morocco · Tunisia',
    category: 'Stocks',
  },

  // Americas
  {
    name: 'Robinhood',
    logo: getLogo('robinhood.com'),
    tagline: 'Commission-free stock trading',
    goodFor: 'Stocks, ETFs and crypto with no fees',
    bestFor: 'US-based beginners',
    rating: 4,
    afrifaSays: 'The easiest way to start buying stocks if you are in the US. Zero commission is a big plus.',
    downloadUrl: 'https://robinhood.com',
    region: 'Americas',
    country: 'USA',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Fidelity',
    logo: getLogo('fidelity.com'),
    tagline: 'Full service investing for everyone',
    goodFor: 'Stocks, ETFs, mutual funds and retirement accounts',
    bestFor: 'US investors who want a complete platform',
    rating: 5,
    afrifaSays: 'One of the best all-round platforms in the US. Great for both beginners and experienced investors. No fees on stocks and ETFs.',
    downloadUrl: 'https://fidelity.com',
    region: 'Americas',
    country: 'USA',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Cash App',
    logo: getLogo('cash.app'),
    tagline: 'Send money and buy stocks and Bitcoin',
    goodFor: 'Buying stocks and Bitcoin from your phone',
    bestFor: 'US beginners who want to start with very small amounts',
    rating: 4,
    afrifaSays: 'Super easy to use — you can buy fractional shares of stocks and Bitcoin with just $1. Great for beginners.',
    downloadUrl: 'https://cash.app',
    region: 'Americas',
    country: 'USA',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Webull',
    logo: getLogo('webull.com'),
    tagline: 'Advanced free stock trading',
    goodFor: 'Stocks, ETFs, options and crypto',
    bestFor: 'US investors who want more advanced tools',
    rating: 4,
    afrifaSays: 'More powerful than Robinhood with better charts and analysis tools. Great for growing investors.',
    downloadUrl: 'https://webull.com',
    region: 'Americas',
    country: 'USA',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Acorns',
    logo: getLogo('acorns.com'),
    tagline: 'Invest your spare change automatically',
    goodFor: 'Automatic micro-investing from everyday purchases',
    bestFor: 'US beginners who struggle to save',
    rating: 4,
    afrifaSays: 'If you find it hard to invest regularly, Acorns does it automatically by rounding up your purchases.',
    downloadUrl: 'https://acorns.com',
    region: 'Americas',
    country: 'USA',
    category: 'ETFs',
  },
  {
    name: 'Coinbase',
    logo: getLogo('coinbase.com'),
    tagline: 'The most trusted crypto exchange',
    goodFor: 'Buying Bitcoin, Ethereum and 200+ coins',
    bestFor: 'Crypto beginners in the US and Canada',
    rating: 5,
    afrifaSays: 'If you are new to crypto this is the safest and most beginner-friendly place to start.',
    downloadUrl: 'https://coinbase.com',
    region: 'Americas',
    country: 'USA · Canada',
    category: 'Crypto',
  },
  {
    name: 'Wealthsimple',
    logo: getLogo('wealthsimple.com'),
    tagline: 'Investing made simple for Canadians',
    goodFor: 'Stocks, ETFs and crypto for Canadians',
    bestFor: 'Canadian beginners and long-term investors',
    rating: 5,
    afrifaSays: 'The best investing app for Canadians — clean interface, no fees on basic trades and great ETF options.',
    downloadUrl: 'https://wealthsimple.com',
    region: 'Americas',
    country: 'Canada',
    category: 'Stocks & ETFs',
  },

  // Europe
  {
    name: 'Trading 212',
    logo: getLogo('trading212.com'),
    tagline: 'Free stock and ETF trading in Europe',
    goodFor: 'Stocks and ETFs with zero commission',
    bestFor: 'UK and EU investors starting out',
    rating: 5,
    afrifaSays: 'Probably the best free investing app in Europe. Great for building a long-term ETF portfolio.',
    downloadUrl: 'https://trading212.com',
    region: 'Europe',
    country: 'UK · EU',
    category: 'Stocks & ETFs',
  },
  {
    name: 'eToro',
    logo: getLogo('etoro.com'),
    tagline: 'Social trading — copy top investors',
    goodFor: 'Stocks, crypto and copying other investors',
    bestFor: 'Beginners who want to learn by copying experts',
    rating: 4,
    afrifaSays: 'Unique because you can copy what successful investors are doing automatically. Great for learning.',
    downloadUrl: 'https://etoro.com',
    region: 'Europe',
    country: 'UK · EU · Global',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Revolut',
    logo: getLogo('revolut.com'),
    tagline: 'Banking and investing in one app',
    goodFor: 'Stocks, crypto and currency exchange',
    bestFor: 'Europeans who want everything in one place',
    rating: 4,
    afrifaSays: 'Convenient if you already use Revolut for banking — easy to start investing without opening a new account.',
    downloadUrl: 'https://revolut.com',
    region: 'Europe',
    country: 'UK · EU',
    category: 'Stocks & Crypto',
  },
  {
    name: 'Freetrade',
    logo: getLogo('freetrade.io'),
    tagline: 'Simple stock investing for the UK',
    goodFor: 'UK stocks and ETFs with no commission',
    bestFor: 'UK beginners building a long-term portfolio',
    rating: 4,
    afrifaSays: 'Clean and simple — great for UK investors who want to start small and grow over time.',
    downloadUrl: 'https://freetrade.io',
    region: 'Europe',
    country: 'UK',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Degiro',
    logo: getLogo('degiro.eu'),
    tagline: 'Low cost broker across Europe',
    goodFor: 'Stocks, ETFs and bonds at very low fees',
    bestFor: 'European investors who want the lowest fees',
    rating: 4,
    afrifaSays: 'One of the cheapest brokers in Europe. If keeping costs low is your priority, DEGIRO is excellent.',
    downloadUrl: 'https://degiro.eu',
    region: 'Europe',
    country: 'EU',
    category: 'Stocks & ETFs',
  },

  // Asia
  {
    name: 'Groww',
    logo: getLogo('groww.in'),
    tagline: 'Stocks and mutual funds for Indians',
    goodFor: 'Indian stocks, mutual funds and ETFs',
    bestFor: 'Indian beginners investing in local markets',
    rating: 5,
    afrifaSays: 'The go-to app for Indian investors — huge selection of mutual funds and very easy to use.',
    downloadUrl: 'https://groww.in',
    region: 'Asia',
    country: 'India',
    category: 'Stocks & Funds',
  },
  {
    name: 'Zerodha',
    logo: getLogo('zerodha.com'),
    tagline: "India's largest stock broker",
    goodFor: 'Stocks, F&O, mutual funds in India',
    bestFor: 'Experienced Indian investors',
    rating: 5,
    afrifaSays: 'The most popular broker in India with millions of users. Reliable and feature-rich.',
    downloadUrl: 'https://zerodha.com',
    region: 'Asia',
    country: 'India',
    category: 'Stocks',
  },
  {
    name: 'Tiger Brokers',
    logo: getLogo('tigerbrokers.com'),
    tagline: 'Global investing from Asia',
    goodFor: 'US, HK and Singapore stocks',
    bestFor: 'Asian investors wanting global exposure',
    rating: 4,
    afrifaSays: 'Strong choice for Singapore and Hong Kong investors who want access to US and Asian markets.',
    downloadUrl: 'https://tigerbrokers.com',
    region: 'Asia',
    country: 'Singapore · Hong Kong',
    category: 'Stocks',
  },
  {
    name: 'Moomoo',
    logo: getLogo('moomoo.com'),
    tagline: 'Advanced trading across Asia and US',
    goodFor: 'Stocks and ETFs with advanced charts',
    bestFor: 'Asian investors who want professional tools',
    rating: 4,
    afrifaSays: 'Great tools for more serious investors across Asia. The charting and analysis features are top notch.',
    downloadUrl: 'https://moomoo.com',
    region: 'Asia',
    country: 'Singapore · Australia · USA',
    category: 'Stocks & ETFs',
  },
  {
    name: 'Binance',
    logo: getLogo('binance.com'),
    tagline: "World's largest crypto exchange",
    goodFor: 'Crypto trading available in most countries',
    bestFor: 'Anyone serious about crypto globally',
    rating: 5,
    afrifaSays: 'Available almost everywhere and has the most trading options. Good for intermediate crypto investors.',
    downloadUrl: 'https://binance.com',
    region: 'Asia',
    country: 'Global',
    category: 'Crypto',
  },
]

const ACCOUNT_STEPS: Record<string, { step: string, desc: string, note?: string }[]> = {
  general: [
    { step: 'Choose your platform', desc: 'Pick an app from the list above that works in your country and fits your goals.' },
    { step: 'Prepare your documents', desc: 'You will need a government issued ID (passport or national ID) and proof of address (utility bill or bank statement).' },
    { step: 'Create your account', desc: 'Download the app, sign up with your email and fill in your personal details.' },
    { step: 'Verify your identity', desc: 'Upload your ID and proof of address. This is called KYC (Know Your Customer) and is required by law. Usually takes 1-24 hours.' },
    { step: 'Add funds', desc: 'Connect your bank account, mobile money or card and deposit your first investment amount.' },
    { step: 'Make your first investment', desc: 'Search for the stock or ETF you want, enter the amount and confirm. You are now an investor!' },
  ],
  Ghana: [
    { step: 'Choose a platform', desc: 'Best options for Ghana: Bamboo, Quidax, Zeepay, Databank or Rise.', note: 'Bamboo is best for US stocks, Databank for local GHS investing' },
    { step: 'Prepare your documents', desc: 'Ghana Card (national ID) or passport + proof of address (utility bill or bank statement).' },
    { step: 'Create and verify your account', desc: 'Sign up, upload your Ghana Card and selfie. Verification usually takes a few hours.' },
    { step: 'Add funds via Mobile Money', desc: 'Most Ghanaian apps accept MTN MoMo, Vodafone Cash and AirtelTigo. You can also use a bank transfer.' },
    { step: 'Make your first investment', desc: 'Start small — even GHS 50-100 is fine. Buy a stock or ETF and watch it grow!' },
  ],
  Nigeria: [
    { step: 'Choose a platform', desc: 'Best options for Nigeria: Bamboo, Chaka, Rise, Cowrywise or PiggyVest.', note: 'Bamboo and Chaka for stocks, Cowrywise for mutual funds' },
    { step: 'Prepare your documents', desc: 'BVN (Bank Verification Number), NIN or passport + proof of address.' },
    { step: 'Create and verify your account', desc: 'Sign up, link your BVN and upload your ID. Verification is usually fast.' },
    { step: 'Add funds', desc: 'Bank transfer or USSD transfer from your Nigerian bank account.' },
    { step: 'Make your first investment', desc: 'Start with a mutual fund on Cowrywise or a US stock on Bamboo. Even NGN 1,000 works!' },
  ],
  USA: [
    { step: 'Choose a platform', desc: 'Best options: Robinhood (simple), Fidelity (complete), Cash App (easiest).', note: 'Fidelity is best overall for US investors' },
    { step: 'Prepare your documents', desc: 'Social Security Number (SSN), government ID and bank account details.' },
    { step: 'Create and verify your account', desc: 'Sign up, enter your SSN and personal details. Usually approved instantly.' },
    { step: 'Consider a Roth IRA', desc: 'If you have earned income, open a Roth IRA for tax-free long-term investing. Limit is $7,000/year in 2026.', note: 'Huge tax advantage for long-term investors' },
    { step: 'Add funds', desc: 'Link your bank account and transfer funds. Most apps have no minimum deposit.' },
    { step: 'Make your first investment', desc: 'Buy a fractional share of VOO or QQQ to start. Even $10 gets you started!' },
  ],
  UK: [
    { step: 'Choose a platform', desc: 'Best options: Trading 212, Freetrade or eToro.', note: 'Trading 212 is best for beginners' },
    { step: 'Prepare your documents', desc: 'UK passport or driving licence + proof of address (bank statement or utility bill).' },
    { step: 'Open an ISA account', desc: 'A Stocks & Shares ISA lets you invest up to £20,000/year completely tax-free. Always use this first!', note: 'This is the UK equivalent of a Roth IRA' },
    { step: 'Verify your identity', desc: 'Upload your ID and selfie. Usually takes minutes to a few hours.' },
    { step: 'Add funds', desc: 'Bank transfer or debit card. Most apps have no minimum deposit.' },
    { step: 'Make your first investment', desc: 'Buy VUSA (S&P 500) or VWRL (global ETF) inside your ISA for maximum tax efficiency.' },
  ],
}

const REGIONS = ['All', 'Africa', 'Americas', 'Europe', 'Asia']
const CATEGORIES = ['All', 'Stocks', 'Crypto', 'ETFs', 'Savings']
const GUIDE_REGIONS = ['general', 'Ghana', 'Nigeria', 'USA', 'UK']

export default function AppsTab() {
  const [activeRegion, setActiveRegion] = useState('All')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeView, setActiveView] = useState<'apps' | 'guide'>('apps')
  const [activeGuide, setActiveGuide] = useState('general')

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

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveView('apps')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'apps'
              ? 'bg-primary text-base'
              : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          Apps
        </button>
        <button
          onClick={() => setActiveView('guide')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'guide'
              ? 'bg-primary text-base'
              : 'bg-elevated border border-border text-text-muted'
          }`}
        >
          How to open an account
        </button>
      </div>

      {/* APPS VIEW */}
      {activeView === 'apps' && (
        <div>
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
              {CATEGORIES.map(cat => (
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
                  <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={app.logo}
                      alt={app.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span style="color:var(--tw-color-text-main);font-size:14px;font-weight:700">${app.name[0]}</span>`
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-text-main font-semibold">{app.name}</p>
                      <span className="text-xs bg-elevated text-text-muted px-2 py-0.5 rounded-full">
                        {app.country}
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
      )}

      {/* GUIDE VIEW */}
      {activeView === 'guide' && (
        <div>
          <p className="text-text-muted text-sm mb-4">
            Step by step guide to opening your first investment account.
          </p>

          {/* Region selector */}
          <div className="flex gap-2 flex-wrap mb-6">
            {GUIDE_REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setActiveGuide(region)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  activeGuide === region
                    ? 'bg-primary text-base'
                    : 'bg-elevated border border-border text-text-muted hover:text-text-main'
                }`}
              >
                {region === 'general' ? 'General' : region}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {ACCOUNT_STEPS[activeGuide].map((step, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-base text-xs font-bold">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-text-main font-medium text-sm mb-1">{step.step}</p>
                  <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                  {step.note && (
                    <div className="mt-2 bg-primary-tint border border-primary rounded-lg px-3 py-1.5">
                      <p className="text-primary text-xs font-medium"> {step.note}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Afrifa tip */}
          <div className="mt-6 bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-base text-xs font-bold">A</span>
              </div>
              <p className="text-text-muted text-xs font-medium">AFRIFA'S TIP</p>
            </div>
            <p className="text-text-main text-sm leading-relaxed">
              Don't wait until you have a lot of money to start. The most important thing is to start early — even $10 or GHS 50 invested today is better than waiting. Time in the market beats timing the market!
            </p>
          </div>
        </div>
      )}

    </div>
  )
}