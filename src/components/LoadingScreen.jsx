export default function LoadingScreen({ ticker, step }) {
  const steps = ['Fetching stock data...', 'Running valuation analysis...', 'Saving to Notion...']
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-slate-900 mb-1">{ticker}</p>
        <p className="text-slate-500 text-sm">{step || 'Fetching data...'}</p>
      </div>
      <div className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 text-sm ${step === s ? 'text-blue-600 font-medium' : 'text-slate-300'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${step === s ? 'bg-blue-500' : 'bg-slate-200'}`} />
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
