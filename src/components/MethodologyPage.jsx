import { ArrowLeft, CheckCircle, TrendingUp, Shield, Scale, BookOpen } from 'lucide-react'

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="card p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Term({ word, def }) {
  return (
    <div className="py-3 border-b border-slate-50 last:border-0">
      <p className="text-slate-800 font-semibold text-sm mb-0.5">{word}</p>
      <p className="text-slate-500 text-xs leading-relaxed">{def}</p>
    </div>
  )
}

function Step({ num, title, children }) {
  return (
    <div className="flex gap-4 mb-6 last:mb-0">
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {num}
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-sm mb-1">{title}</p>
        <div className="text-slate-500 text-xs leading-relaxed space-y-1">{children}</div>
      </div>
    </div>
  )
}

export default function MethodologyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Nav */}
        <button onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Research Tool
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="text-blue-600" size={20} />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900">How It Works</h1>
          </div>
          <p className="text-slate-500 leading-relaxed">
            This tool helps you decide whether a stock is worth buying — using the same framework
            professional investors use, explained in plain English.
          </p>
        </div>

        {/* The Core Idea */}
        <Section icon={TrendingUp} title="The Core Idea" color="bg-blue-600">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Every stock has two prices: the <strong>market price</strong> (what people are paying today)
            and the <strong>fair value</strong> (what the company is actually worth based on its business).
          </p>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            When the market price is <em>lower</em> than fair value, you're getting a bargain —
            like buying a $100 item for $75. When it's higher, you're overpaying.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-blue-800 font-semibold text-sm mb-2">The simple rule:</p>
            <div className="space-y-1 text-sm">
              <p className="text-emerald-600 font-medium">✓ Price &lt; Fair Value = Potential opportunity</p>
              <p className="text-red-600 font-medium">✗ Price &gt; Fair Value = Potentially overpriced</p>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            But price alone isn't enough. A cheap stock might be cheap for good reason — a struggling business.
            That's why we also check the health of the business.
          </p>
        </Section>

        {/* Our 4-Step Process */}
        <Section icon={Scale} title="Our 4-Step Process" color="bg-violet-600">
          <Step num="1" title="Calculate Fair Value (5 Methods)">
            <p>We use 5 different valuation methods and average them — like getting 5 opinions from different experts.</p>
            <p>This reduces the chance of any one flawed assumption distorting the result.</p>
          </Step>
          <Step num="2" title="Check Business Health">
            <p>Is this company growing? Is it profitable? Does it have too much debt?</p>
            <p>A cheap stock in a deteriorating business is a "value trap" — it looks attractive but keeps falling.</p>
          </Step>
          <Step num="3" title="Apply the Decision Rule">
            <p>Only recommend buying if both conditions are met: <strong>undervalued AND healthy business.</strong></p>
            <p>If only one is met, the decision is CONDITIONAL or HOLD.</p>
          </Step>
          <Step num="4" title="Consider the Macro Environment">
            <p>Interest rates, inflation, and unemployment affect every stock.</p>
            <p>A great company at a fair price can still be a bad investment in a rising-rate environment.</p>
          </Step>
        </Section>

        {/* The 5 Valuation Methods */}
        <Section icon={Scale} title="The 5 Valuation Methods" color="bg-indigo-600">
          <p className="text-slate-500 text-sm mb-5">
            No single method is perfect. By averaging five approaches, we get a more balanced picture of fair value.
          </p>
          <div className="space-y-5">
            {[
              {
                name: 'P/E Method (Price-to-Earnings)',
                how: 'Multiply earnings per share by a "fair" P/E multiple',
                example: 'If a company earns $5/share and fair P/E is 20x, fair value = $100',
                best: 'Mature, consistently profitable companies',
                weakness: "Useless for unprofitable companies. High-growth companies always look 'expensive'.",
              },
              {
                name: 'P/S Method (Price-to-Sales)',
                how: 'Apply a target revenue multiple to revenue per share',
                example: 'If revenue/share is $40 and fair P/S is 2.5x, fair value = $100',
                best: 'Fast-growing companies not yet profitable',
                weakness: 'Ignores profitability — a company with no margins can have great revenue.',
              },
              {
                name: 'FCF Yield Method',
                how: 'Ask: what price gives a 4% free cash flow yield?',
                example: "If FCF/share is $4, a 4% yield implies $100 fair value ($4/$100 = 4%)",
                best: 'Mature cash-generating businesses',
                weakness: 'Capex-heavy or high-growth companies reinvest heavily, making FCF look low.',
              },
              {
                name: 'EV/EBITDA Method',
                how: 'Apply a 12x EBITDA multiple to implied enterprise value, then subtract debt',
                example: 'If EBITDA is $10/share and 12x target → $120 enterprise value/share',
                best: 'Comparing companies with different debt levels',
                weakness: 'EBITDA ignores capex, so it overstates profitability for asset-heavy businesses.',
              },
              {
                name: 'Analyst Consensus Target',
                how: 'The average 12-month price target from Wall Street analysts',
                example: '20 analysts cover AAPL; average target = $200',
                best: 'As a sanity check against your own estimates',
                weakness: 'Analysts are often optimistic and slow to revise after bad news.',
              },
            ].map((m, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="font-semibold text-slate-800 text-sm mb-2">{i + 1}. {m.name}</p>
                <div className="space-y-1.5 text-xs">
                  <p><span className="text-slate-400">How: </span><span className="text-slate-600">{m.how}</span></p>
                  <p><span className="text-slate-400">Example: </span><span className="text-slate-600">{m.example}</span></p>
                  <p><span className="text-emerald-500">Best for: </span><span className="text-slate-600">{m.best}</span></p>
                  <p><span className="text-amber-500">Weakness: </span><span className="text-slate-600">{m.weakness}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Margin of Safety */}
        <Section icon={Shield} title="What is Margin of Safety?" color="bg-emerald-600">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Even the best analysis can be wrong. Companies face unexpected challenges.
            The margin of safety is a buffer — you only buy when the discount is large enough
            to protect you if your assumptions turn out to be slightly off.
          </p>
          <div className="space-y-2">
            {[
              { mos: '> 25%', label: 'Strong buy signal', color: 'bg-emerald-50 border-emerald-100 text-emerald-700', note: 'Significant discount — good protection against being wrong' },
              { mos: '15–25%', label: 'Reasonable buy', color: 'bg-blue-50 border-blue-100 text-blue-700', note: 'Decent discount with reasonable risk' },
              { mos: '5–15%', label: 'Wait for better entry', color: 'bg-amber-50 border-amber-100 text-amber-700', note: 'Not much room for error' },
              { mos: '< 0%', label: 'Overvalued — avoid', color: 'bg-red-50 border-red-100 text-red-700', note: "You're already paying more than it's worth" },
            ].map((row, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs ${row.color}`}>
                <div>
                  <strong>{row.mos}</strong>
                  <span className="text-slate-400 ml-2">{row.note}</span>
                </div>
                <span className="font-medium">{row.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Halal Check */}
        <Section icon={CheckCircle} title="Halal Status" color="bg-teal-600">
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            For Muslim investors, Islamic finance principles prohibit investing in certain businesses
            (alcohol, gambling, conventional banking, weapons, pork, adult content) and companies
            with excessive debt or interest income.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            We ask you to set the halal status manually using a trusted screening service like
            <strong> Musaffa</strong> or <strong>Zoya</strong>. If you mark a stock as Non-Compliant,
            the tool will automatically give it a NO decision regardless of valuation.
          </p>
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <p className="text-teal-700 text-xs font-medium mb-2">Recommended screening services:</p>
            <div className="space-y-1 text-xs text-teal-600">
              <p>• <strong>Musaffa</strong> (musaffa.com) — 200K+ stocks covered</p>
              <p>• <strong>Zoya</strong> (zoya.finance) — Clean mobile app</p>
              <p>• <strong>IslamicFinanceGuru</strong> — Free UK-focused resource</p>
            </div>
          </div>
        </Section>

        {/* Key Terms */}
        <Section icon={BookOpen} title="Key Terms Glossary" color="bg-slate-600">
          <Term word="Market Cap"        def="The total value of all shares. If a company has 100 shares at $10 each, market cap = $1,000." />
          <Term word="EPS (Earnings Per Share)" def="Net profit divided by number of shares. If profit is $100M and there are 50M shares, EPS = $2." />
          <Term word="Revenue"           def="Total money the company received from selling goods/services. Also called 'top line'." />
          <Term word="EBITDA"            def="Earnings before interest, taxes, depreciation and amortisation. A clean measure of operating profitability." />
          <Term word="Free Cash Flow"    def="The actual cash left over after running the business and making necessary investments. The purest measure of financial health." />
          <Term word="P/E Ratio"         def="Price divided by earnings per share. Tells you how many years of earnings you're paying for the stock today." />
          <Term word="P/S Ratio"         def="Price divided by revenue per share. Useful for companies not yet profitable." />
          <Term word="Margin of Safety"  def="How much below fair value the stock is trading. Acts as a buffer against errors in your analysis." />
          <Term word="Value Trap"        def="A stock that looks cheap but keeps falling because the business is genuinely deteriorating." />
          <Term word="Bull Case"         def="The optimistic scenario — everything goes better than expected." />
          <Term word="Bear Case"         def="The pessimistic scenario — things go worse than expected." />
          <Term word="Fed Funds Rate"    def="The interest rate the US Federal Reserve sets. It ripples through the entire economy." />
          <Term word="CPI"               def="Consumer Price Index — measures how much everyday prices are rising (inflation)." />
          <Term word="TTM"               def="Trailing Twelve Months — the most recent 12-month period of financial data." />
        </Section>

        {/* Disclaimer */}
        <div className="text-center text-slate-400 text-xs py-6">
          <p className="mb-1">This tool is for educational and personal research purposes only.</p>
          <p>It is not financial advice. Always do your own research before investing.</p>
        </div>
      </div>
    </div>
  )
}
