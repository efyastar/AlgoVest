import { useState } from 'react'

const VIDEOS = {
  learn: [
    {
      id: 'XTGlde-Pbd8',
      title: "No.1 Money Saving Experts: Do Not Buy A House! Putting Money In A Bank Makes You Poorer!",
      channel: 'The Diary of a CEO',
      url: 'https://youtu.be/XTGlde-Pbd8',
    },
    {
      id: 'mpAZehPviLQ',
      title: "Kevin O'Leary: Every Time You Get Paid, Do This! It 10xs Your Income Without Having To Work Harder!",
      channel: 'The Diary of a CEO',
      url: 'https://youtu.be/mpAZehPviLQ',
    },
    {
      id: 'IYu_PDPqKFc',
      title: "Codie Sanchez: They're Lying To You About How To Get Rich! How To Turn $0 Into $1M!",
      channel: 'The Diary of a CEO',
      url: 'https://youtu.be/IYu_PDPqKFc',
    },
    {
      id: 'hVlAOIUA71Y',
      title: "The SIMPLE (& Proven) Way To Earn $100,000 From Nothing! | The Money Making Experts",
      channel: 'The Diary of a CEO',
      url: 'https://youtu.be/hVlAOIUA71Y',
    },
    {
      id: 'uxu37dqVR90',
      title: "The Savings Expert: The Truth About America Collapsing! The Cost Of Living Is About To Skyrocket!",
      channel: 'The Diary of a CEO',
      url: 'https://youtu.be/uxu37dqVR90',
    },
    {
      id: 'Ay4fmZdZqJE',
      title: "The Only Investing Video You'll Ever Need (Start With $100)",
      channel: 'Mark Tilbury',
      url: 'https://youtu.be/Ay4fmZdZqJE',
    },
    {
      id: '6IiEoSHw9gY',
      title: "If I Started From Scratch Again, I'd Do This",
      channel: 'Mark Tilbury',
      url: 'https://youtu.be/6IiEoSHw9gY',
    },
    {
      id: 'bEElvs_5byk',
      title: "How to Invest as a Beginner (and Everything to Do Before That)",
      channel: 'Miki Rai',
      url: 'https://youtu.be/bEElvs_5byk',
    },
    {
      id: 'lNdOtlpmH5U',
      title: "How to Invest for Beginners (2026)",
      channel: 'Ali Abdaal',
      url: 'https://youtu.be/lNdOtlpmH5U',
    },
    {
      id: '0tP24IHnDCg',
      title: "How to Buy Shares in Ghana: Invest in Ghana Stock Exchange",
      channel: 'Pickins Hub',
      url: 'https://youtu.be/0tP24IHnDCg',
    },
    {
      id: '4dSmepQ3Vm0',
      title: "This is How to Invest in Ghana in 2026",
      channel: 'Pickins Hub',
      url: 'https://youtu.be/4dSmepQ3Vm0',
    },
    {
      id: 'IfZ-0NvwLNo',
      title: "How to Invest Your First 5000 (or 2000+ Cedis) | What to Invest in | How to Invest in Ghana",
      channel: 'The Antwiwaa',
      url: 'https://youtu.be/IfZ-0NvwLNo',
    },
  ],
  beginners: [
    {
      id: 'QThz1B8SHmc',
      title: "How to Manage Your Money Like the 1%",
      channel: 'Mark Tilbury',
      url: 'https://youtu.be/QThz1B8SHmc',
    },
    {
      id: 'bb6_M_srMBk',
      title: "Stock Market for Beginners 2025/2026 — The Ultimate Investing Guide",
      channel: 'Humphrey Yang',
      url: 'https://youtu.be/bb6_M_srMBk',
    },
    {
      id: 'YBzT_mzGl9Q',
      title: "How to Start Investing for Beginners in Nigeria (Investment Banker Explained)",
      channel: 'Financial Jennifer',
      url: 'https://youtu.be/YBzT_mzGl9Q',
    },
    {
      id: '_xpFc_x0OwA',
      title: "If I Started Investing in 2026, This is What I Would Do (Full Beginner's Guide)",
      channel: 'I Will Teach You to Be Rich',
      url: 'https://youtu.be/_xpFc_x0OwA',
    },
    {
      id: 'bNIAi9Sm3rY',
      title: "If I Started Investing in 2026, This is What I Would Do (Full Beginner's Guide)",
      channel: 'Humphrey Yang',
      url: 'https://youtu.be/bNIAi9Sm3rY',
    },
    {
      id: 'c7JJGGDQmEQ',
      title: "Starting from $0 in 2026? Here's How I'd Invest Step-by-Step",
      channel: 'Steve | Call to Leap',
      url: 'https://youtu.be/c7JJGGDQmEQ',
    },
  ],
}

type Category = 'learn' | 'beginners'

export default function LearnTab() {
  const [activeCategory, setActiveCategory] = useState<Category>('learn')

  const videos = VIDEOS[activeCategory]

  return (
    <div className="w-full">

      {/* Category tabs */}
      <div className="flex gap-2 mb-6">
        {(['learn', 'beginners'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              activeCategory === cat
                ? 'bg-primary text-base'
                : 'bg-elevated border border-border text-text-muted hover:text-text-main'
            }`}
          >
            {cat === 'learn' ? '📈 Learn' : '🎓 Beginners'}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => window.open(video.url, '_blank')}
            className="text-left bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all group"
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-elevated">
              <img
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 
                  `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                }}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="text-base text-lg ml-1">▶</span>
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="p-3">
              <p className="text-text-main text-sm font-medium leading-snug line-clamp-2 mb-1">
                {video.title}
              </p>
              <p className="text-text-muted text-xs">{video.channel}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}