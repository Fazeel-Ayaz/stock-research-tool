import { ArrowLeft, BookOpen } from 'lucide-react'
import DecisionBanner      from './sections/DecisionBanner'
import ValuationSection    from './sections/ValuationSection'
import HealthCheck         from './sections/HealthCheck'
import MacroSection        from './sections/MacroSection'
import NewsSection         from './sections/NewsSection'
import { fmtB }            from './sections/utils'

export default function Report({ result, onBack, onLearn }) {
  const { data, analysis, halalStatus, notionSaved } = result
  const { valuation, health, decision } = analysis
  const { quote, profile, income, balance, cashflow, macro, news } = data

  return (
    <div className="min-h-screen bg-slate-50 py-4 px-3 sm:py-8 sm:px-4">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition-colors">
            <ArrowLeft size={16} /> New Analysis
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onLearn}
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 text-xs transition-colors">
              <BookOpen size={13} /> <span className="hidden sm:inline">How does this work?</span><span className="sm:hidden">Methodology</span>
            </button>
          </div>
        </div>

        {/* Company header */}
        <div className="mb-4 animate-fade-in">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">{quote?.companyName}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="text-slate-400 text-sm">{quote?.ticker}</span>
            {profile?.exchange && <span className="text-slate-300 text-xs">· {profile.exchange}</span>}
            {profile?.sector   && <span className="text-slate-300 text-xs">· {profile.sector}</span>}
            {quote?.marketCap  && <span className="text-slate-300 text-xs">· {fmtB(quote.marketCap)} mktcap</span>}
            {quote?.change1d != null && (
              <span className={`text-xs font-medium ${quote.change1d >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {quote.change1d >= 0 ? '+' : ''}{quote.change1d.toFixed(2)}% today
              </span>
            )}
          </div>
        </div>

        <div className="mb-4"><DecisionBanner decision={decision} quote={quote} halalStatus={halalStatus} notionSaved={notionSaved} /></div>

        {/* Top disclaimer */}
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5 animate-fade-in">
          <span className="text-amber-500 text-base leading-none mt-0.5">⚠</span>
          <p className="text-amber-700 text-xs leading-relaxed">
            <strong>Not financial advice.</strong> This analysis is for personal research only.
            Fair value estimates are model-based approximations — not a recommendation to buy, sell, or hold.
            Always verify independently before making investment decisions.
          </p>
        </div>
        <div className="mb-4"><ValuationSection valuation={valuation} quote={quote} income={income} cashflow={cashflow} /></div>
        <div className="mb-4"><HealthCheck health={health} income={income} balance={balance} cashflow={cashflow} /></div>
        <div className="mb-4"><MacroSection macro={macro} /></div>
        <div className="mb-4"><NewsSection news={news} /></div>

        {profile?.description && (
          <div className="card p-6 mb-4 animate-fade-in-delay-4">
            <h2 className="font-display text-lg font-bold text-slate-900 mb-3">About {quote?.companyName}</h2>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-4">{profile.description}</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="card p-5 mb-4 bg-amber-50 border-amber-100">
          <p className="text-amber-800 font-semibold text-sm mb-2">⚠ Disclaimer & Limitations</p>
          <p className="text-amber-700 text-xs leading-relaxed mb-2">
            This tool is for <strong>educational and personal research purposes only</strong>. It is not financial advice.
            No output from this tool constitutes a recommendation to buy, sell, or hold any security.
          </p>
          <p className="text-amber-600 text-xs leading-relaxed">
            <strong>Key limitations:</strong> Fair value estimates use simplified models — two analysts using the same data
            will reach different conclusions. Target multiples (P/S, EV/EBITDA, P/E) are calibrated for mainstream
            equities and <strong>do not apply</strong> to banks, REITs, utilities, or early-stage companies.
            EBITDA margin is approximated using operating margin (Finnhub free tier limitation).
            Always verify with independent sources before making any investment decision.
          </p>
        </div>

        <div className="text-center text-slate-400 text-xs py-4">
          Data: Finnhub · Analyst targets: Yahoo Finance · Logged to Notion
        </div>
      </div>
    </div>
  )
}
