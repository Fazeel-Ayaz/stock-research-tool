// Finnhub proxy — runs server-side so the API key never reaches the browser
// Deploy: supabase functions deploy finnhub-proxy --no-verify-jwt

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const url      = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint')

    if (!endpoint) {
      return new Response(JSON.stringify({ error: 'Missing ?endpoint= param' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Forward all query params (except 'endpoint') to Finnhub, inject API key server-side
    const params = new URLSearchParams()
    url.searchParams.forEach((val, key) => {
      if (key !== 'endpoint') params.set(key, val)
    })
    params.set('token', Deno.env.get('FINNHUB_API_KEY') ?? '')

    const finnhubRes = await fetch(`https://finnhub.io/api/v1${endpoint}?${params}`)
    const data       = await finnhubRes.json()

    return new Response(JSON.stringify(data), {
      status: finnhubRes.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
