import { useState } from 'react'
import { Search, TrendingUp, BookOpen } from 'lucide-react'

export default function TickerInput({ onAnalyze, onLearn }) {
  const [ticker, setTicker] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!ticker.trim()) return
    onAnalyze(ticker.trim().toUpperCase(), 'Unknown')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <TrendingUp className="text-blue-600" size={20} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">Stock Research</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-sm">
          Enter a ticker to get a full valuation, health check, and investment decision.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md animate-fade-in-delay-1">
        <div className="card p-6 shadow-sm">
          <label className="block text-slate-700 text-sm font-semibold mb-1.5">
            Ticker Symbol
          </label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              placeholder="AAPL, MSFT, UBER..."
              className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900
                         font-display text-lg tracking-widest bg-white
                         focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                         placeholder-slate-300 transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!ticker.trim()}
            className="w-full py-3 rounded-lg font-display font-semibold text-white
                       bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200"
          >
            Analyze
          </button>
        </div>
      </form>

      <button
        onClick={onLearn}
        className="mt-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm transition-colors animate-fade-in-delay-2"
      >
        <BookOpen size={15} />
        How does this analysis work?
      </button>

      <p className="mt-4 text-slate-400 text-xs animate-fade-in-delay-2">
        Data from Finnhub · Logged to Notion
      </p>
    </div>
  )
}
