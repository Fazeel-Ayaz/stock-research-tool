const TOKEN = import.meta.env.VITE_NOTION_TOKEN
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID

// In dev, Vite proxies /notion-api → https://api.notion.com
// In production (Lovable), you'll move these calls to an Edge Function
const BASE = '/notion-api'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
}

export async function logAnalysis({ data, valuation, health, decision, halalStatus, notes }) {
  const { quote, income, profile } = data
  const today = new Date().toISOString().split('T')[0]
  const nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const body = {
    parent: { database_id: DATABASE_ID },
    properties: {
      // Title
      Ticker: {
        title: [{ text: { content: quote?.ticker ?? 'UNKNOWN' } }],
      },
      Company: {
        rich_text: [{ text: { content: quote?.companyName ?? '' } }],
      },
      'Analysis Date': {
        date: { start: today },
      },
      Decision: {
        select: { name: decision.decision },
      },
      'Halal Status': {
        select: { name: halalStatus ?? 'Unknown' },
      },
      'Current Price': {
        number: quote?.price ?? null,
      },
      'Fair Value': {
        number: valuation.fairValue ? Math.round(valuation.fairValue * 100) / 100 : null,
      },
      'Margin of Safety %': {
        number: valuation.marginOfSafety ? Math.round(valuation.marginOfSafety * 10) / 10 : null,
      },
      'P/E Ratio': {
        number: valuation.pe ? Math.round(valuation.pe * 10) / 10 : null,
      },
      'P/S Ratio': {
        number: valuation.ps ? Math.round(valuation.ps * 10) / 10 : null,
      },
      'FCF Yield %': {
        number: valuation.fcfYield ? Math.round(valuation.fcfYield * 10) / 10 : null,
      },
      'Revenue Growth %': {
        number: income?.revenueGrowth ? Math.round(income.revenueGrowth * 10) / 10 : null,
      },
      'Health Score': {
        number: health.score,
      },
      'Red Flags': {
        rich_text: [
          {
            text: {
              content: health.flags.length
                ? health.flags.map(f => `[${f.type.toUpperCase()}] ${f.text}`).join('\n')
                : 'None',
            },
          },
        ],
      },
      'Investment Thesis': {
        rich_text: [
          {
            text: {
              content: decision.reason,
            },
          },
        ],
      },
      'Next Review': {
        date: { start: nextReview },
      },
      Notes: {
        rich_text: [{ text: { content: notes ?? '' } }],
      },
    },
  }

  const res = await fetch(`${BASE}/v1/pages`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Notion error: ${err.message}`)
  }

  return res.json()
}
