import { useState } from 'react'

type Video = {
  id: string
  title: string
  channel: string
  url: string
  level: 'beginner' | 'intermediate' | 'advanced'
  topic: 'stocks' | 'crypto' | 'etfs' | 'budgeting' | 'mindset'
  goal: 'why invest' | 'how to start' | 'how to grow'
}

const VIDEOS: Video[] = [
  {
    id: 'XTGlde-Pbd8',
    title: 'No.1 Money Saving Experts: Do Not Buy A House! Putting Money In A Bank Makes You Poorer!',
    channel: 'The Diary of a CEO',
    url: 'https://youtu.be/XTGlde-Pbd8',
    level: 'beginner',
    topic: 'mindset',
    goal: 'why invest',
  },
  {
    id: 'mpAZehPviLQ',
    title: "Kevin O'Leary: Every Time You Get Paid, Do This! It 10xs Your Income Without Having To Work Harder!",
    channel: 'The Diary of a CEO',
    url: 'https://youtu.be/mpAZehPviLQ',
    level: 'beginner',
    topic: 'mindset',
    goal: 'why invest',
  },
  {
    id: 'IYu_PDPqKFc',
    title: "Codie Sanchez: They're Lying To You About How To Get Rich! How To Turn $0 Into $1M!",
    channel: 'The Diary of a CEO',
    url: 'https://youtu.be/IYu_PDPqKFc',
    level: 'beginner',
    topic: 'mindset',
    goal: 'why invest',
  },
  {
    id: 'hVlAOIUA71Y',
    title: 'The SIMPLE (& Proven) Way To Earn $100,000 From Nothing!',
    channel: 'The Diary of a CEO',
    url: 'https://youtu.be/hVlAOIUA71Y',
    level: 'beginner',
    topic: 'mindset',
    goal: 'why invest',
  },
  {
    id: 'uxu37dqVR90',
    title: 'The Savings Expert: The Truth About America Collapsing! The Cost Of Living Is About To Skyrocket!',
    channel: 'The Diary of a CEO',
    url: 'https://youtu.be/uxu37dqVR90',
    level: 'beginner',
    topic: 'mindset',
    goal: 'why invest',
  },
  {
    id: 'Ay4fmZdZqJE',
    title: "The Only Investing Video You'll Ever Need (Start With $100)",
    channel: 'Mark Tilbury',
    url: 'https://youtu.be/Ay4fmZdZqJE',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: '6IiEoSHw9gY',
    title: "If I Started From Scratch Again, I'd Do This",
    channel: 'Mark Tilbury',
    url: 'https://youtu.be/6IiEoSHw9gY',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'bEElvs_5byk',
    title: 'How to Invest as a Beginner (and Everything to Do Before That)',
    channel: 'Miki Rai',
    url: 'https://youtu.be/bEElvs_5byk',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'lNdOtlpmH5U',
    title: 'How to Invest for Beginners (2026)',
    channel: 'Ali Abdaal',
    url: 'https://youtu.be/lNdOtlpmH5U',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: '0tP24IHnDCg',
    title: 'How to Buy Shares in Ghana: Invest in Ghana Stock Exchange',
    channel: 'Pickins Hub',
    url: 'https://youtu.be/0tP24IHnDCg',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: '4dSmepQ3Vm0',
    title: 'This is How to Invest in Ghana in 2026',
    channel: 'Pickins Hub',
    url: 'https://youtu.be/4dSmepQ3Vm0',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'IfZ-0NvwLNo',
    title: 'How to Invest Your First 5000 (or 2000+ Cedis)',
    channel: 'The Antwiwaa',
    url: 'https://youtu.be/IfZ-0NvwLNo',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'QThz1B8SHmc',
    title: 'How to Manage Your Money Like the 1%',
    channel: 'Mark Tilbury',
    url: 'https://youtu.be/QThz1B8SHmc',
    level: 'beginner',
    topic: 'budgeting',
    goal: 'how to start',
  },
  {
    id: 'bb6_M_srMBk',
    title: 'Stock Market for Beginners 2025/2026 — The Ultimate Investing Guide',
    channel: 'Humphrey Yang',
    url: 'https://youtu.be/bb6_M_srMBk',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'YBzT_mzGl9Q',
    title: 'How to Start Investing for Beginners in Nigeria',
    channel: 'Financial Jennifer',
    url: 'https://youtu.be/YBzT_mzGl9Q',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: '_xpFc_x0OwA',
    title: "If I Started Investing in 2026, This is What I Would Do (Full Beginner's Guide)",
    channel: 'I Will Teach You to Be Rich',
    url: 'https://youtu.be/_xpFc_x0OwA',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'bNIAi9Sm3rY',
    title: "If I Started Investing in 2026, This is What I Would Do (Full Beginner's Guide)",
    channel: 'Humphrey Yang',
    url: 'https://youtu.be/bNIAi9Sm3rY',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
  {
    id: 'c7JJGGDQmEQ',
    title: "Starting from $0 in 2026? Here's How I'd Invest Step-by-Step",
    channel: 'Steve | Call to Leap',
    url: 'https://youtu.be/c7JJGGDQmEQ',
    level: 'beginner',
    topic: 'stocks',
    goal: 'how to start',
  },
]

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const TOPICS = ['All', 'Stocks', 'Crypto', 'ETFs', 'Budgeting', 'Mindset']
const GOALS = ['All', 'Why Invest', 'How to Start', 'How to Grow']

export default function LearnTab() {
  const [activeLevel, setActiveLevel] = useState('All')
  const [activeTopic, setActiveTopic] = useState('All')
  const [activeGoal, setActiveGoal] = useState('All')

  const filtered = VIDEOS.filter(v => {
    const levelMatch = activeLevel === 'All' || v.level === activeLevel.toLowerCase()
    const topicMatch = activeTopic === 'All' || v.topic === activeTopic.toLowerCase()
    const goalMatch = activeGoal === 'All' || v.goal === activeGoal.toLowerCase()
    return levelMatch && topicMatch && goalMatch
  })

  return (
    <div className="w-full">

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div>
          <p className="text-text-muted text-xs font-medium mb-2">LEVEL</p>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setActiveLevel(l)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeLevel === l
                    ? 'bg-primary text-base'
                    : 'bg-elevated border border-border text-text-muted hover:text-text-main'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-text-muted text-xs font-medium mb-2">TOPIC</p>
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTopic === t
                    ? 'bg-primary text-base'
                    : 'bg-elevated border border-border text-text-muted hover:text-text-main'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-text-muted text-xs font-medium mb-2">GOAL</p>
          <div className="flex gap-2 flex-wrap">
            {GOALS.map(g => (
              <button
                key={g}
                onClick={() => setActiveGoal(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeGoal === g
                    ? 'bg-primary text-base'
                    : 'bg-elevated border border-border text-text-muted hover:text-text-main'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-text-muted text-xs mb-4">{filtered.length} video{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Video grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-main font-medium mb-1">No videos found</p>
          <p className="text-text-muted text-sm">Try different filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video) => (
            <button
              key={video.id}
              onClick={() => window.open(video.url, '_blank')}
              className="text-left bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all group"
            >
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
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">                  
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary-tint text-primary">
                    {video.level}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-text-main text-sm font-medium leading-snug line-clamp-2 mb-1">
                  {video.title}
                </p>
                <p className="text-text-muted text-xs">{video.channel}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className="text-xs bg-elevated text-text-hint px-2 py-0.5 rounded-full capitalize">
                    {video.topic}
                  </span>
                  <span className="text-xs bg-elevated text-text-hint px-2 py-0.5 rounded-full capitalize">
                    {video.goal}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}