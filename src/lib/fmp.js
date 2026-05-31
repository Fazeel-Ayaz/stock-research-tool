// Data layer — Finnhub
// Dev:  requests go through Vite proxy (/fh-api → finnhub.io, /yf-api → finance.yahoo.com)
// Prod: requests go through Supabase Edge Functions (API key stays server-side)

const API_KEY      = import.meta.env.VITE_FH_API_KEY      // only used in dev
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL     // e.g. https://xyz.supabase.co
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const IS_PROD      = import.meta.env.PROD
const wait         = ms => new Promise(r => setTimeout(r, ms))

async function fh(endpoint, params = {}) {
  let url
  let headers = {}

  if (IS_PROD) {
    // Production: call Supabase Edge Function — API key injected server-side
    const qs = new URLSearchParams({ ...params, endpoint }).toString()
    url = `${SUPABASE_URL}/functions/v1/finnhub-proxy?${qs}`
    headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  } else {
    // Development: Vite proxy forwards to Finnhub with API key
    const qs = new URLSearchParams({ ...params, token: API_KEY }).toString()
    url = `/fh-api/api/v1${endpoint}?${qs}`
  }

  const res = await fetch(url, IS_PROD ? { headers } : {})

  if (res.status === 429)
    throw new Error('RATE_LIMIT: Too many requests. Wait a moment and try again.')
  if (res.status === 401 || res.status === 403)
    throw new Error('AUTH_ERROR: Invalid API key. Check VITE_FH_API_KEY in your .env file.')
  if (!res.ok)
    throw new Error(`Finnhub error ${res.status}`)

  return res.json()
}

function num(val) {
  if (val == null || val === 'N/A') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

// ── News (best-effort, won't block the report) ─────────────────────────────

async function fetchNews(sym) {
  try {
    const today = new Date()
    const from  = new Date(today)
    from.setDate(from.getDate() - 7)
    const toStr   = today.toISOString().split('T')[0]
    const fromStr = from.toISOString().split('T')[0]

    const articles = await fh('/company-news', { symbol: sym, from: fromStr, to: toStr })
    if (!Array.isArray(articles)) return []

    return articles.slice(0, 6).map(a => ({
      title:          a.headline,
      url:            a.url,
      summary:        a.summary?.length > 200 ? a.summary.slice(0, 200) + '...' : (a.summary ?? ''),
      source:         a.source,
      publishedAt:    a.datetime, // unix timestamp
      sentiment:      null,
      sentimentScore: null,
    }))
  } catch {
    return []
  }
}

// ── Main export ────────────────────────────────────────────────────────────
// Calls per analysis:
//   1. /stock/profile2   — name, market cap, shares, exchange, industry
//   2. /stock/metric     — all fundamentals (PE, PS, margins, growth, 52-wk, EPS, FCF)
//   3. /quote            — live price + daily change
//   4. /stock/price-target — analyst consensus (best-effort)
//   5. /company-news     — headlines (best-effort)
// Total: 3 guaranteed + 2 best-effort = well within 60/min free tier

export async function fetchAllStockData(ticker) {
  const sym   = ticker.trim().toUpperCase()
  const DELAY = 120 // ms between calls — 60/min limit = very relaxed

  let profileRaw, metricsRaw, quoteRaw

  try {
    profileRaw  = await fh('/stock/profile2', { symbol: sym })             ; await wait(DELAY)
    metricsRaw  = await fh('/stock/metric',   { symbol: sym, metric: 'all' }) ; await wait(DELAY)
    quoteRaw    = await fh('/quote',          { symbol: sym })
  } catch (err) {
    if (err.message.startsWith('RATE_LIMIT')) throw new Error(err.message.replace('RATE_LIMIT: ', ''))
    if (err.message.startsWith('AUTH_ERROR')) throw new Error(err.message.replace('AUTH_ERROR: ', ''))
    throw err
  }

  // Analyst target — Yahoo Finance (free, no key needed)
  await wait(DELAY)
  let targetRaw = null
  try {
    let yfRes
    if (IS_PROD) {
      const qs = new URLSearchParams({
        path: `/v10/finance/quoteSummary/${sym}`, modules: 'financialData',
      }).toString()
      yfRes = await fetch(`${SUPABASE_URL}/functions/v1/yf-proxy?${qs}`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      })
    } else {
      const qs = new URLSearchParams({ modules: 'financialData' }).toString()
      yfRes = await fetch(`/yf-api/v10/finance/quoteSummary/${sym}?${qs}`)
    }
    if (yfRes.ok) {
      const yf = await yfRes.json()
      const fd = yf?.quoteSummary?.result?.[0]?.financialData
      if (fd?.targetMeanPrice?.raw) {
        targetRaw = {
          targetMean:   fd.targetMeanPrice?.raw   ?? null,
          targetHigh:   fd.targetHighPrice?.raw   ?? null,
          targetLow:    fd.targetLowPrice?.raw    ?? null,
          targetMedian: fd.targetMedianPrice?.raw ?? null,
          numAnalysts:  fd.numberOfAnalystOpinions?.raw ?? null,
        }
      }
    }
  } catch { /* best-effort */ }

  // Validate — profile must have a name
  if (!profileRaw?.name) {
    throw new Error(
      `No data found for "${sym}". ` +
      'Double-check the ticker (e.g. AAPL, MSFT, UBER) and try again.'
    )
  }

  const m = metricsRaw?.metric ?? {}

  // Market cap comes in millions from Finnhub; shares outstanding also in millions
  const marketCapM = num(profileRaw.marketCapitalization)
  const sharesM    = num(profileRaw.shareOutstanding)
  const marketCap  = marketCapM ? marketCapM * 1_000_000  : null
  const shares     = sharesM    ? sharesM    * 1_000_000  : null

  // Live price & daily change
  const price   = num(quoteRaw?.c)
  const prevClose = num(quoteRaw?.pc)
  const change1d  = price && prevClose ? ((price - prevClose) / prevClose) * 100 : null

  // ── Quote ──────────────────────────────────────────────────────────────
  const quote = {
    ticker:      sym,
    companyName: profileRaw.name,
    price,
    marketCap,
    pe:          num(m.peBasicExclExtraTTM),
    eps:         num(m.epsBasicExclExtraTTM),
    change1d,
    high52:      num(m['52WeekHigh']),
    low52:       num(m['52WeekLow']),
    avgVolume:   null,
  }

  // ── Profile ─────────────────────────────────────────────────────────────
  const profile = {
    sector:      profileRaw.finnhubIndustry ?? null,
    industry:    profileRaw.finnhubIndustry ?? null,
    description: null, // not in profile2; would need a separate call
    exchange:    profileRaw.exchange ?? null,
    country:     profileRaw.country  ?? null,
    employees:   null,
    website:     profileRaw.weburl   ?? null,
  }

  // ── Income ──────────────────────────────────────────────────────────────
  // Confirmed available on Finnhub free tier:
  //   revenuePerShareTTM, grossMarginTTM/Annual, revenueGrowthTTMYoy,
  //   epsGrowthTTMYoy, roeTTM, psTTM
  // NOT available: ebitdaMarginTTM, netMarginTTM (require paid plan)

  const ps = num(m.psTTM) ?? num(m.psAnnual)

  const revenuePerShare = num(m.revenuePerShareTTM) ?? num(m.revenuePerShareAnnual)
  const revenue = (revenuePerShare && shares) ? revenuePerShare * shares
                : (marketCap && ps)            ? marketCap / ps
                : null

  const grossMarginPct = num(m.grossMarginTTM) ?? num(m.grossMarginAnnual) ?? null
  // Use operating margin as EBITDA proxy if EBITDA margin unavailable
  const ebitdaMarginPct = num(m.ebitdaMarginTTM) ?? num(m.ebitdaMarginAnnual)
                        ?? num(m.operatingMarginTTM) ?? num(m.operatingMarginAnnual) ?? null
  const netMarginPct    = num(m.netMarginTTM) ?? num(m.netMarginAnnual)
                        ?? num(m.netProfitMarginTTM) ?? null

  const ebitdaPerShare = num(m.ebitdaPerShareTTM) ?? num(m.ebitdaPerShareAnnual)
  const fcfPerShare    = num(m.freeCashFlowPerShareTTM) ?? num(m.freeCashFlowPerShareAnnual)

  const grossProfit = (revenue && grossMarginPct)  ? revenue * (grossMarginPct  / 100) : null
  const ebitda      = (ebitdaPerShare && shares)   ? ebitdaPerShare * shares
                    : (revenue && ebitdaMarginPct) ? revenue * (ebitdaMarginPct / 100) : null
  const netIncome   = (revenue && netMarginPct)    ? revenue * (netMarginPct    / 100) : null
  const fcf         = (fcfPerShare && shares)      ? fcfPerShare * shares : null

  // Growth rates: Finnhub returns as % already (17.87 = 17.87%)
  const income = {
    revenue,
    grossProfit,
    grossMargin:   grossMarginPct,
    ebitda,
    ebitdaMargin:  ebitdaMarginPct,
    netMargin:     netMarginPct,
    netIncome,
    revenueGrowth: num(m.revenueGrowthTTMYoy) ?? null,
    ebitdaGrowth:  num(m.epsGrowthTTMYoy)     ?? null,
  }

  // ── Balance sheet ────────────────────────────────────────────────────────
  // Finnhub provides net debt in millions via netDebtAnnual
  const netDebtM = num(m.netDebtAnnual)
  const netDebt  = netDebtM != null ? netDebtM * 1_000_000 : null

  const balance = {
    cash:        null,
    totalDebt:   null,
    netDebt,
    totalAssets: null,
    totalEquity: null,
  }

  // ── Cash flow ────────────────────────────────────────────────────────────
  const cashflow = {
    operatingCashFlow: null,
    capex:             null,
    freeCashFlow:      fcf,
  }

  // ── Key metrics ──────────────────────────────────────────────────────────
  // EV/EBITDA: derive from market cap + net debt, then divide by EBITDA
  const ev      = marketCap != null && netDebt != null ? marketCap + netDebt : marketCap
  const evEbitda = ev && ebitda ? ev / ebitda : null

  const keyMetrics = {
    evEbitda,
    priceToBook:  num(m.pbQuarterly) ?? num(m.pbAnnual),
    roe:          num(m.roeTTM) ?? null, // Finnhub returns as % (30.5 = 30.5%)
    debtToEbitda: ebitda && netDebt ? Math.abs(netDebt) / ebitda : null,
  }

  // ── Analyst target (Yahoo Finance) ──────────────────────────────────────
  const priceTarget = targetRaw?.targetMean ? {
    targetConsensus: targetRaw.targetMean,
    targetHigh:      targetRaw.targetHigh,
    targetLow:       targetRaw.targetLow,
    targetMedian:    targetRaw.targetMedian,
    numAnalysts:     targetRaw.numAnalysts,
  } : null

  // ── Macro (May 2026) ─────────────────────────────────────────────────────
  const macro = {
    fedFundsRate: 3.625,
    treasury10y:  4.52,
    treasury2y:   4.21,
    cpi:          3.8,
    unemployment: 4.3,
    lastUpdated:  'May 2026',
  }

  // ── News (non-blocking) ──────────────────────────────────────────────────
  await wait(DELAY)
  const news = await fetchNews(sym)

  return {
    quote, profile, income, balance, cashflow,
    keyMetrics, priceTarget, analystTargets: null,
    macro, news,
    fetchedAt: new Date().toISOString(),
  }
}
