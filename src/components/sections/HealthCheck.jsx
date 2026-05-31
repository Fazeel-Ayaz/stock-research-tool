import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

function Explain({ text }) {
  return <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{text}</p>
}

export default function HealthCheck({ health, income, balance, cashflow }) {
  const { score, flags } = health

  const scoreColor = score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-blue-600' : score >= 4 ? 'text-amber-600' : 'text-red-600'
  const scoreLabel = score >= 8 ? 'Strong'         : score >= 6 ? 'Healthy'        : score >= 4 ? 'Weak'            : 'Deteriorating'
  const barColor   = score >= 7
    ? 'from-emerald-400 to-emerald-500'
    : score >= 5 ? 'from-blue-400 to-blue-500'
    : score >= 3 ? 'from-amber-400 to-amber-500'
    : 'from-red-400 to-red-500'

  const checks = [
    {
      label:   'Revenue is growing',
      ok:      income?.revenueGrowth != null && income.revenueGrowth > 0,
      value:   income?.revenueGrowth != null ? `${income.revenueGrowth.toFixed(1)}% YoY` : '—',
      explain: 'A growing company sells more each year than the year before. Declining revenue is a red flag.',
    },
    {
      label:   income?.ebitdaMargin != null ? 'Profitable operations (EBITDA)' : 'Strong gross margin',
      ok:      income?.ebitdaMargin != null ? income.ebitdaMargin > 0
             : income?.grossMargin  != null ? income.grossMargin  > 20 : false,
      value:   income?.ebitdaMargin != null ? `${income.ebitdaMargin.toFixed(1)}% EBITDA margin`
             : income?.grossMargin  != null ? `${income.grossMargin.toFixed(1)}% gross margin` : '—',
      explain: income?.ebitdaMargin != null
        ? 'EBITDA tells us if the core business makes money before accounting items. Negative EBITDA means it costs more to run the business than it earns.'
        : 'Gross margin shows how much profit remains after direct costs. Higher is better — above 40% is generally strong.',
    },
    {
      label:   'Manageable debt',
      ok:      !health.flags.some(f => f.text?.includes('leverage') || f.text?.includes('debt')),
      value:   balance?.totalDebt != null ? `$${(balance.totalDebt / 1e9).toFixed(1)}B total debt` : '—',
      explain: 'Too much debt is risky — if business slows down, debt repayments can crush the company. We flag debt above 5x EBITDA as high risk.',
    },
    {
      label:   'Net income positive',
      ok:      income?.netMargin != null && income.netMargin >= 0,
      value:   income?.netMargin != null ? `${income.netMargin.toFixed(1)}% margin` : '—',
      explain: 'After all expenses, taxes, and interest — is the company actually making money? Net loss means shareholders are losing value.',
    },
  ]

  return (
    <div className="card p-6 animate-fade-in-delay-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-lg font-bold text-slate-900">Business Health</h2>
        <div className="text-right">
          <span className={`font-display text-2xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-slate-300 text-lg">/10</span>
          <p className={`text-xs font-semibold ${scoreColor}`}>{scoreLabel}</p>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-5">
        Is this a healthy, well-run business — or are there warning signs we should worry about?
      </p>

      {/* Score bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all`}
             style={{ width: `${score * 10}%` }} />
      </div>

      {/* Checklist */}
      <div className="space-y-4 mb-5">
        {checks.map(c => (
          <div key={c.label}>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                {c.ok
                  ? <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                  : <XCircle    size={15} className="text-slate-300 shrink-0" />
                }
                <span className={`text-sm font-medium ${c.ok ? 'text-slate-700' : 'text-slate-400'}`}>{c.label}</span>
              </div>
              <span className="text-slate-400 text-xs">{c.value}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed pl-5">{c.explain}</p>
          </div>
        ))}
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">
            {flags.length} Flag{flags.length > 1 ? 's' : ''} Raised
          </p>
          <div className="space-y-2">
            {flags.map((f, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                f.type === 'critical'
                  ? 'bg-red-50 border border-red-100 text-red-700'
                  : 'bg-amber-50 border border-amber-100 text-amber-700'
              }`}>
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                {f.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {flags.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm border-t border-slate-100 pt-4">
          <CheckCircle size={15} />
          No flags raised — business looks healthy
        </div>
      )}
    </div>
  )
}
