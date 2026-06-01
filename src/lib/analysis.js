// ── Valuation ─────────────────────────────────────────────────────────────────

export function calcValuation(data) {
  const { quote, income, balance, cashflow, keyMetrics, priceTarget } = data
  const price     = quote?.price
  const marketCap = quote?.marketCap
  const revenue   = income?.revenue
  const ebitda    = income?.ebitda
  const netDebt   = balance?.netDebt ?? 0

  const pe      = quote?.pe ?? null
  const ps      = marketCap && revenue ? marketCap / revenue : null
  const evEbitda = keyMetrics?.evEbitda ?? (ebitda && marketCap ? (marketCap + netDebt) / ebitda : null)

  // Growth rate — use revenue growth as primary signal for multiple selection
  const growthRate = income?.revenueGrowth ?? income?.ebitdaGrowth ?? 0

  // Margin — determines appropriate P/S multiple (high-margin companies deserve higher P/S)
  const marginPct = income?.netMargin ?? income?.ebitdaMargin ?? income?.grossMargin ?? null

  // ── Individual method estimates ────────────────────────────────────────────
  const methods = []

  // ── 1. P/E Method ──────────────────────────────────────────────────────────
  // IMPORTANT: Finnhub's epsBasicExclExtraTTM can be unreliable on the free tier.
  // Derive EPS from price ÷ P/E instead — both are accurate and self-consistent.
  const effectiveEPS = (pe && price) ? price / pe : (quote?.eps ?? null)

  // Target P/E: apply a modest haircut to current P/E, scaled by growth.
  // We never argue for P/E expansion — only fair value at a slight discount.
  let targetPE = null
  if (pe && pe > 0 && pe < 300 && effectiveEPS) {
    if      (growthRate >= 25) targetPE = Math.min(pe * 0.95, 55) // hyper-growth
    else if (growthRate >= 15) targetPE = Math.min(pe * 0.90, 38) // high growth
    else if (growthRate >= 8)  targetPE = Math.min(pe * 0.85, 25) // moderate growth
    else                       targetPE = Math.min(pe * 0.80, 18) // low/no growth
  }
  const peEstimate = effectiveEPS && targetPE ? effectiveEPS * targetPE : null
  methods.push({
    name: 'P/E Method',
    estimate: peEstimate,
    inputs: pe ? `${pe.toFixed(1)}x current P/E → ${targetPE?.toFixed(1)}x target` : null,
    assumption: `EPS derived from Price ÷ P/E (${price?.toFixed(2)} ÷ ${pe?.toFixed(1)}x). Target P/E of ${targetPE?.toFixed(1)}x based on revenue growth of ${growthRate?.toFixed(1)}%. We apply a haircut to current P/E — never argue for multiple expansion.`,
    explanation: 'Values the stock by applying a "fair" price-to-earnings multiple. Target scales with growth rate — faster-growing companies deserve higher multiples.',
  })

  // ── 2. P/S Method ──────────────────────────────────────────────────────────
  // Target P/S scales with profitability: a 40% margin software company
  // deserves a much higher P/S than a 5% margin retailer.
  let targetPS = 2.5
  if (marginPct !== null) {
    if      (marginPct >= 35) targetPS = 10   // e.g. MSFT, AAPL — very high margin
    else if (marginPct >= 25) targetPS = 7    // e.g. GOOGL, META
    else if (marginPct >= 15) targetPS = 4.5  // e.g. mid-margin tech/software
    else if (marginPct >= 5)  targetPS = 2.5  // e.g. diversified businesses
    else                      targetPS = 1.5  // e.g. low-margin retail/distribution
  }

  if (revenue && marketCap && price) {
    const shares      = marketCap / price
    const revPerShare = revenue / shares
    methods.push({
      name: 'P/S Method',
      estimate: revPerShare * targetPS,
      inputs: `${ps?.toFixed(1)}x current → ${targetPS}x target (margin-adjusted)`,
      assumption: `Target P/S of ${targetPS}x based on profit margin of ${marginPct?.toFixed(1)}%. High-margin businesses deserve higher revenue multiples — a 35%+ margin company warrants 10x vs 2.5x for low-margin businesses.`,
      explanation: 'Values the stock relative to revenue. Target multiple is adjusted for the company\'s profit margin — higher-margin businesses deserve higher P/S.',
    })
  } else {
    methods.push({
      name: 'P/S Method', estimate: null, inputs: null, assumption: null,
      explanation: 'Values the stock relative to revenue, adjusted for profit margin.',
    })
  }

  // ── 3. EV/EBITDA Method ────────────────────────────────────────────────────
  // Target EV/EBITDA scales with growth rate.
  // Slow-growing businesses: ~10x. High-growth tech: 20-25x.
  let targetEVEBITDA = 12
  if      (growthRate >= 25) targetEVEBITDA = 25
  else if (growthRate >= 18) targetEVEBITDA = 20
  else if (growthRate >= 12) targetEVEBITDA = 16
  else if (growthRate >= 6)  targetEVEBITDA = 12
  else                       targetEVEBITDA = 9

  if (ebitda && marketCap && price) {
    const shares        = marketCap / price
    const impliedMktCap = (ebitda * targetEVEBITDA) - netDebt
    methods.push({
      name: 'EV/EBITDA Method',
      estimate: impliedMktCap / shares,
      inputs: `${evEbitda?.toFixed(1)}x current → ${targetEVEBITDA}x target (growth-adjusted)`,
      assumption: `Target EV/EBITDA of ${targetEVEBITDA}x based on revenue growth of ${growthRate?.toFixed(1)}%. Net debt of $${(Math.abs(netDebt)/1e9).toFixed(1)}B factored into enterprise value. Assumes stable capital structure.`,
      explanation: 'Values the whole business relative to operating profit. Target multiple scales with growth rate — fast-growing businesses trade at higher multiples.',
    })
  } else {
    methods.push({
      name: 'EV/EBITDA Method', estimate: null, inputs: null, assumption: null,
      explanation: 'Values the business relative to operating profit.',
    })
  }

  // ── 4. Analyst consensus ───────────────────────────────────────────────────
  methods.push({
    name: 'Analyst Target',
    estimate: priceTarget?.targetConsensus ?? null,
    inputs: priceTarget ? `${priceTarget.numAnalysts ? priceTarget.numAnalysts + ' analysts · ' : ''}High $${priceTarget.targetHigh?.toFixed(0)} / Low $${priceTarget.targetLow?.toFixed(0)}` : null,
    assumption: priceTarget ? `Wall Street consensus target from ${priceTarget.numAnalysts ?? 'multiple'} analysts. Range: $${priceTarget.targetLow?.toFixed(0)}–$${priceTarget.targetHigh?.toFixed(0)}. Note: analysts tend to be optimistic and slow to revise after bad news.` : null,
    explanation: 'The average 12-month price target from Wall Street analysts covering this stock.',
  })

  // ── Fair value = average of available estimates ────────────────────────────
  const available  = methods.map(m => m.estimate).filter(v => v != null && v > 0)
  const fairValue  = available.length ? available.reduce((a, b) => a + b, 0) / available.length : null
  const marginOfSafety = fairValue && price ? ((fairValue - price) / fairValue) * 100 : null

  return {
    pe, ps, evEbitda,
    fairValue,
    fairValueLow:  fairValue ? fairValue * 0.85 : null,
    fairValueHigh: fairValue ? fairValue * 1.15 : null,
    marginOfSafety,
    methods,
    analystTarget: priceTarget?.targetConsensus ?? null,
  }

}

// ── Health Check ──────────────────────────────────────────────────────────────

export function calcHealthCheck(data) {
  const { income, balance, cashflow, keyMetrics } = data
  const flags = []
  let score   = 10

  // Revenue growth
  const revGrowth = income?.revenueGrowth
  if (revGrowth != null) {
    if (revGrowth < 0) {
      flags.push({ type: 'critical', text: `Revenue declining ${revGrowth.toFixed(1)}% YoY` })
      score -= 3
    } else if (revGrowth < 3) {
      flags.push({ type: 'warning', text: `Revenue growth slow (${revGrowth.toFixed(1)}% YoY)` })
      score -= 1
    }
  }

  const ebitdaMargin = income?.ebitdaMargin
  const grossMargin  = income?.grossMargin
  // Use gross margin as fallback indicator when EBITDA margin not available
  const profitMargin = ebitdaMargin ?? grossMargin
  const profitLabel  = ebitdaMargin != null ? 'EBITDA' : 'Gross'

  if (profitMargin != null) {
    const threshold = ebitdaMargin != null ? 0 : 20 // gross margin < 20% is a concern
    if (profitMargin < threshold) {
      flags.push({ type: 'critical', text: `Negative ${profitLabel} margin (${profitMargin.toFixed(1)}%)` })
      score -= 2
    } else if (ebitdaMargin != null && profitMargin < 5) {
      flags.push({ type: 'warning', text: `Thin EBITDA margin (${profitMargin.toFixed(1)}%)` })
      score -= 1
    }
  }

  const debtToEbitda = keyMetrics?.debtToEbitda
  if (debtToEbitda != null) {
    if (debtToEbitda > 5) {
      flags.push({ type: 'critical', text: `High leverage: ${debtToEbitda.toFixed(1)}x Debt/EBITDA` })
      score -= 2
    } else if (debtToEbitda > 3) {
      flags.push({ type: 'warning', text: `Elevated debt: ${debtToEbitda.toFixed(1)}x Debt/EBITDA` })
      score -= 1
    }
  }

  if (income?.netMargin != null && income.netMargin < 0) {
    flags.push({ type: 'warning', text: `Net income negative (${income.netMargin.toFixed(1)}% margin)` })
    score -= 1
  }

  return { score: Math.max(0, Math.min(10, score)), flags }
}

// ── Decision ──────────────────────────────────────────────────────────────────

export function calcDecision(valuation, health, halalStatus) {
  const { marginOfSafety, fairValue } = valuation
  const { score, flags } = health
  const criticals = flags.filter(f => f.type === 'critical').length

  if (halalStatus === 'Non-Compliant')
    return { decision: 'NO', reason: 'Non-Sharia-compliant', color: 'red', confidence: 'high' }

  if (criticals >= 2)
    return { decision: 'NO', reason: 'Multiple critical business health issues', color: 'red', confidence: 'high' }

  if (score < 4)
    return { decision: 'NO', reason: 'Deteriorating business fundamentals', color: 'red', confidence: 'medium' }

  if (!fairValue || marginOfSafety == null)
    return { decision: 'HOLD', reason: 'Insufficient data to determine fair value', color: 'blue', confidence: 'low' }

  if (marginOfSafety >= 25 && score >= 7 && criticals === 0)
    return { decision: 'YES', reason: `${marginOfSafety.toFixed(0)}% below fair value with strong fundamentals`, color: 'green', confidence: 'high' }

  if (marginOfSafety >= 15 && score >= 5 && criticals <= 1)
    return { decision: 'YES', reason: `${marginOfSafety.toFixed(0)}% below fair value — monitor flagged risks`, color: 'green', confidence: 'medium' }

  if (marginOfSafety >= 5 && score >= 5)
    return { decision: 'CONDITIONAL', reason: 'Slight discount to fair value — wait for a better entry point', color: 'yellow', confidence: 'medium' }

  if (marginOfSafety < 0)
    return { decision: 'NO', reason: `Overvalued by ${Math.abs(marginOfSafety).toFixed(0)}% vs estimated fair value`, color: 'red', confidence: 'medium' }

  return { decision: 'HOLD', reason: 'Fairly valued — no significant margin of safety at current price', color: 'blue', confidence: 'medium' }
}

// ── Run all ───────────────────────────────────────────────────────────────────

export function runAnalysis(data, halalStatus) {
  const valuation = calcValuation(data)
  const health    = calcHealthCheck(data)
  const decision  = calcDecision(valuation, health, halalStatus)
  return { valuation, health, decision }
}
