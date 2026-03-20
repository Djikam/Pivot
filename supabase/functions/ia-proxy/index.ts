import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS })

  try {
    const body = await req.json()
    if (!body.messages) return new Response(JSON.stringify({ error: 'messages required' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })

    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: Math.min(Number(body.max_tokens) || 500, 1500),
      messages: body.messages,
      ...(body.system ? { system: body.system } : {}),
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload),
    })
    const data = await resp.json()
    return new Response(JSON.stringify(data), {
      status: resp.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('ia-proxy:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
