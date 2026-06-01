import { useState } from 'react'
import TickerInput     from './components/TickerInput'
import LoadingScreen   from './components/LoadingScreen'
import Report          from './components/Report'
import MethodologyPage from './components/MethodologyPage'
import { useAnalysis } from './hooks/useAnalysis'

export default function App() {
  const { state, result, error, loadingStep, analyze, reset } = useAnalysis()
  const [showMethodology, setShowMethodology] = useState(false)

  if (showMethodology) {
    return <MethodologyPage onBack={() => setShowMethodology(false)} />
  }

  if (state === 'idle') {
    return <TickerInput onAnalyze={analyze} onLearn={() => setShowMethodology(true)} />
  }

  if (state === 'loading') {
    return <LoadingScreen ticker="..." step={loadingStep} />
  }

  if (state === 'done' && result) {
    return (
      <Report
        result={result}
        onBack={reset}
        onLearn={() => setShowMethodology(true)}
      />
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <div className="card p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-red-500 font-display text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button onClick={reset}
            className="px-6 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors">
            Try again
          </button>
        </div>
      </div>
    )
  }
}
