function Explain({ text }) {
  return <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{text}</p>
}

export default function MacroSection({ macro }) {
  if (!macro) return null

  const indicators = [
    {
      label:   'Fed Funds Rate',
      value:   `${macro.fedFundsRate?.toFixed(2)}%`,
      explain: 'The interest rate set by the US Federal Reserve. Higher rates = borrowing is more expensive for businesses = slower growth, lower stock valuations.',
      color:   macro.fedFundsRate > 4 ? 'text-red-600' : macro.fedFundsRate > 2 ? 'text-amber-600' : 'text-emerald-600',
    },
    {
      label:   '10-Year Treasury Yield',
      value:   `${macro.treasury10y?.toFixed(2)}%`,
      explain: "The return on 10-year US government bonds. This is the 'risk-free rate' — when it's high, investors demand more from stocks too, which pushes stock prices down.",
      color:   macro.treasury10y > 5 ? 'text-red-600' : 'text-slate-800',
    },
    {
      label:   'CPI (Inflation)',
      value:   `${macro.cpi?.toFixed(1)}%`,
      explain: "How fast prices are rising. The Fed targets 2%. High inflation forces the Fed to keep rates high, which hurts growth stocks. It also erodes consumer purchasing power.",
      color:   macro.cpi > 4 ? 'text-red-600' : macro.cpi > 2.5 ? 'text-amber-600' : 'text-emerald-600',
    },
    {
      label:   'Unemployment Rate',
      value:   `${macro.unemployment?.toFixed(1)}%`,
      explain: 'The % of people looking for work but unable to find it. Low unemployment = consumers have money to spend = good for most businesses.',
      color:   macro.unemployment > 5 ? 'text-amber-600' : 'text-emerald-600',
    },
  ]

  const signals = []
  if (macro.cpi > 4)
    signals.push({ text: 'High inflation — Fed unlikely to cut rates soon. Growth stocks face headwinds.', negative: true })
  else if (macro.cpi < 2.5)
    signals.push({ text: 'Inflation near target — rate cuts are possible. Good for growth stocks.', negative: false })
  if (macro.treasury10y > 5)
    signals.push({ text: 'High long-term rates compress equity valuations — especially for growth stocks.', negative: true })
  if (macro.unemployment < 4.5)
    signals.push({ text: 'Strong labor market supports consumer spending.', negative: false })
  else if (macro.unemployment > 5.5)
    signals.push({ text: 'Rising unemployment — consumer spending may slow down.', negative: true })

  return (
    <div className="card p-6 animate-fade-in-delay-3">
      <h2 className="font-display text-lg font-bold text-slate-900 mb-1">Macro Environment</h2>
      <p className="text-slate-400 text-sm mb-5">
        The economy affects every stock. Here's the current backdrop that this investment sits in.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {indicators.map(ind => (
          <div key={ind.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-xs font-medium mb-1">{ind.label}</p>
            <p className={`font-display text-2xl font-bold ${ind.color}`}>{ind.value}</p>
            <Explain text={ind.explain} />
          </div>
        ))}
      </div>

      {signals.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">What This Means</p>
          {signals.map((s, i) => (
            <div key={i} className={`text-sm px-3 py-2.5 rounded-lg border ${
              s.negative
                ? 'bg-red-50 border-red-100 text-red-700'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              {s.negative ? '↓ ' : '↑ '}{s.text}
            </div>
          ))}
        </div>
      )}

      <p className="text-slate-300 text-xs mt-4">Macro data updated {macro.lastUpdated}</p>
    </div>
  )
}
