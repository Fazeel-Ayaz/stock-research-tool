import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function sentimentConfig(sentiment) {
  if (!sentiment) return { color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-100', icon: Minus, label: 'Neutral' }
  const s = sentiment.toLowerCase()
  if (s.includes('bullish'))  return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: TrendingUp,   label: sentiment }
  if (s.includes('bearish'))  return { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-100',     icon: TrendingDown, label: sentiment }
  return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', icon: Minus, label: sentiment }
}

function timeAgo(published) {
  if (!published) return ''
  // Finnhub returns datetime as a Unix timestamp (seconds)
  const date = typeof published === 'number'
    ? new Date(published * 1000)
    : new Date(published)
  if (isNaN(date.getTime())) return ''
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000)
  if (hours < 1)  return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NewsSection({ news }) {
  if (!news?.length) return null

  return (
    <div className="card p-6 animate-fade-in-delay-4">
      <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Latest News</h2>
      <p className="text-slate-400 text-sm mb-5">
        Recent headlines and their sentiment signal — bullish coverage can push prices up, bearish can drag them down.
      </p>

      <div className="space-y-3">
        {news.map((article, i) => {
          const cfg  = sentimentConfig(article.sentiment)
          const Icon = cfg.icon
          return (
            <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
               className="block card-hover p-4 group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-medium leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-slate-400 text-xs">{article.source}</span>
                    <span className="text-slate-300 text-xs">·</span>
                    <span className="text-slate-400 text-xs">{timeAgo(article.publishedAt)}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    <Icon size={10} />
                    {cfg.label}
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      <p className="text-slate-300 text-xs mt-4">
        💡 News sentiment is one signal among many — don't make decisions based on headlines alone.
      </p>
    </div>
  )
}
