// Yahoo Finance proxy — bypasses CORS restrictions on analyst target data
// Deploy: supabase functions deploy yf-proxy --no-verify-jwt

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const url  = new URL(req.url)
    const path = url.searchParams.get('path')

    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing ?path= param' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Forward all query params except 'path'
    const params = new URLSearchParams()
    url.searchParams.forEach((val, key) => {
      if (key !== 'path') params.set(key, val)
    })

    const yfRes = await fetch(
      `https://query2.finance.yahoo.com${path}?${params}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-tool/1.0)' } }
    )
    const data = await yfRes.json()

    return new Response(JSON.stringify(data), {
      status: yfRes.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
