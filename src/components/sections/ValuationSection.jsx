import { fmtB } from './utils'
import { Info } from 'lucide-react'

function Explain({ text }) {
  return <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{text}</p>
}

function MetricCard({ label, value, explain, sub, highlight }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${highlight ?? 'text-slate-900'}`}>{value ?? '—'}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      <Explain text={explain} />
    </div>
  )
}

export default function ValuationSection({ valuation, quote, income, cashflow }) {
  const { pe, ps, evEbitda, fairValue, fairValueLow, fairValueHigh, marginOfSafety, methods } = valuation
  const price = quote?.price

  return (
    <div className="card p-6 animate-fade-in-delay-1">
      <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Valuation</h2>
      <p className="text-slate-400 text-sm mb-6">How expensive or cheap is this stock compared to what it's worth?</p>

      {/* Quick ratios */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <MetricCard
          label="P/E Ratio"
          value={pe ? `${pe.toFixed(1)}x` : null}
          explain="How much you pay for every $1 of profit. A P/E of 20 means you're paying $20 for $1 of earnings. Lower is generally cheaper."
          sub="Price ÷ Earnings"
        />
        <MetricCard
          label="P/S Ratio"
          value={ps ? `${ps.toFixed(1)}x` : null}
          explain="How much you pay per $1 of revenue. Useful for fast-growing companies that aren't yet profitable."
          sub="Price ÷ Revenue"
        />
        <MetricCard
          label="EV/EBITDA"
          value={evEbitda ? `${evEbitda.toFixed(1)}x` : null}
          explain="Values the whole business (including its debt) relative to operating profit. Useful for comparing companies with different debt levels."
          sub="Enterprise Value ÷ EBITDA"
        />
      </div>

      {/* Individual method breakdown */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-slate-800 text-sm">Fair Value by Method</h3>
          <span className="text-slate-400 text-xs bg-slate-100 px-2 py-0.5 rounded-full">
            {methods.filter(m => m.estimate != null).length} of {methods.length} methods available
          </span>
        </div>
        <p className="text-slate-400 text-xs mb-4">
          We attempt up to {methods.length} valuation methods and average those that return data. This reduces reliance on any single approach.
        </p>

        <div className="space-y-2">
          {methods.map((m, i) => {
            const hasEstimate = m.estimate != null
            const diff = hasEstimate && price ? ((m.estimate - price) / price) * 100 : null

            return (
              <div key={i} className="flex items-start justify-between gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-sm font-medium">{m.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{m.explanation}</p>
                  {m.assumption && (
                    <p className="text-blue-400 text-xs mt-1 leading-relaxed">
                      ⚙ {m.assumption}
                    </p>
                  )}
                  {m.inputs && <p className="text-slate-300 text-xs mt-0.5">{m.inputs}</p>}
                </div>
                <div className="text-right shrink-0 min-w-[56px]">
                  {hasEstimate ? (
                    <>
                      <p className="font-display font-bold text-slate-900 text-sm sm:text-base">${m.estimate.toFixed(0)}</p>
                      {diff != null && (
                        <p className={`text-xs font-medium ${diff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-300 text-sm">—</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fair value summary */}
      {fairValue && price && (
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-blue-800 font-semibold text-sm">Average Fair Value</p>
              <p className="text-blue-500 text-xs mt-0.5">Based on {methods.filter(m => m.estimate).length} methods above</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-blue-700">${fairValue.toFixed(0)}</p>
              <p className="text-blue-400 text-xs">range ${fairValueLow?.toFixed(0)}–${fairValueHigh?.toFixed(0)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600">Current price: <strong>${price.toFixed(2)}</strong></span>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              marginOfSafety > 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {marginOfSafety > 0
                ? `${marginOfSafety.toFixed(0)}% below fair value`
                : `${Math.abs(marginOfSafety).toFixed(0)}% above fair value`}
            </span>
          </div>

          {/* Bar */}
          <div className="relative h-1.5 bg-blue-100 rounded-full mt-4 overflow-visible">
            {(() => {
              const min   = Math.min(fairValueLow, price) * 0.85
              const max   = Math.max(fairValueHigh, price) * 1.15
              const range = max - min
              const leftPct  = ((fairValueLow  - min) / range) * 100
              const widthPct = ((fairValueHigh - fairValueLow) / range) * 100
              const pricePct = ((price - min) / range) * 100
              return (
                <>
                  <div className="absolute h-full bg-blue-200 rounded-full"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
                  <div className="absolute w-3 h-3 -top-0.5 rounded-full border-2 border-white shadow-sm"
                    style={{
                      left: `${Math.min(Math.max(pricePct, 0), 100)}%`,
                      transform: 'translateX(-50%)',
                      backgroundColor: marginOfSafety > 0 ? '#16a34a' : '#dc2626',
                    }} />
                </>
              )
            })()}
          </div>
          <div className="flex justify-between text-xs text-blue-300 mt-1">
            <span>Low ${fairValueLow?.toFixed(0)}</span>
            <span>High ${fairValueHigh?.toFixed(0)}</span>
          </div>

          <p className="text-blue-400 text-xs mt-3">
            💡 <strong>Margin of safety</strong> is the gap between the current price and fair value.
            Like buying a $100 item on sale for $75 — a 25% margin of safety. The bigger the discount, the better the deal.
          </p>
        </div>
      )}

      {/* Financials */}
      <div className="border-t border-slate-100 pt-5">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-4">Financials (TTM — Trailing Twelve Months)</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Revenue', value: income?.revenue ? fmtB(income.revenue) : '—', explain: 'Total sales in the last 12 months.' },
            { label: 'Revenue Growth', value: income?.revenueGrowth != null ? `${income.revenueGrowth.toFixed(1)}%` : '—',
              explain: 'How much faster or slower the company is selling vs. last year.',
              color: income?.revenueGrowth > 0 ? 'text-emerald-600' : 'text-red-500' },
            { label: 'EBITDA', value: income?.ebitda ? fmtB(income.ebitda) : '—', explain: 'Operating profit before accounting adjustments — a clean view of business profitability.' },
            { label: 'EBITDA Margin', value: income?.ebitdaMargin != null ? `${income.ebitdaMargin.toFixed(1)}%` : '—',
              explain: 'What % of revenue becomes operating profit. Higher % = more profitable business.',
              color: income?.ebitdaMargin > 15 ? 'text-emerald-600' : income?.ebitdaMargin > 5 ? 'text-slate-700' : 'text-red-500' },
            { label: 'Net Margin', value: income?.netMargin != null ? `${income.netMargin.toFixed(1)}%` : '—',
              explain: 'What % of every dollar of sales turns into profit after all expenses.' },
          ].map(f => (
            <div key={f.label}>
              <p className="text-slate-500 text-xs font-medium mb-0.5">{f.label}</p>
              <p className={`font-semibold text-sm ${f.color ?? 'text-slate-800'}`}>{f.value}</p>
              <Explain text={f.explain} />
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Model Limitations</p>
        <ul className="space-y-1.5 text-slate-400 text-xs leading-relaxed">
          <li>· Target multiples (P/S, EV/EBITDA, P/E) are calibrated for mainstream equities — <strong className="text-slate-500">not suitable for banks, REITs, utilities, or pre-revenue companies</strong></li>
          <li>· EBITDA margin uses operating margin as a proxy (direct EBITDA margin not available on our data tier)</li>
          <li>· Fair value is an average of available methods — fewer methods = less reliable estimate</li>
          <li>· All figures are trailing twelve months (TTM); forward guidance is not factored in</li>
        </ul>
      </div>
    </div>
  )
}
