import { useState } from 'react'
import { fetchAllStockData } from '../lib/fmp'
import { runAnalysis } from '../lib/analysis'
import { logAnalysis } from '../lib/notion'

export function useAnalysis() {
  const [state, setState] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState('')

  async function analyze(ticker, halalStatus) {
    setState('loading')
    setError(null)
    setResult(null)

    try {
      setLoadingStep('Fetching stock data...')
      const data = await fetchAllStockData(ticker)

      if (!data.quote) {
        throw new Error(`Could not find data for "${ticker}". Check the ticker symbol and try again.`)
      }

      setLoadingStep('Running valuation analysis...')
      const analysis = runAnalysis(data, halalStatus)

      setLoadingStep('Saving to Notion...')
      let notionSaved = false
      try {
        await logAnalysis({ data, ...analysis, halalStatus })
        notionSaved = true
      } catch (notionErr) {
        console.warn('Notion logging failed:', notionErr.message)
        // Don't fail the whole analysis if Notion is not configured
      }

      setResult({ data, analysis, halalStatus, notionSaved })
      setState('done')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setResult(null)
    setError(null)
    setLoadingStep('')
  }

  return { state, result, error, loadingStep, analyze, reset }
}
