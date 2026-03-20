/**
 * PIVOT IA Client
 * 
 * Appelle l'Edge Function Supabase comme proxy sécurisé vers l'API Anthropic.
 * La clé API Anthropic est stockée uniquement côté serveur (variable d'env Supabase).
 * 
 * Pour configurer: Supabase Dashboard → Edge Functions → ia-proxy → Secrets
 * Ajouter: ANTHROPIC_API_KEY = sk-ant-...
 */

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-proxy`

// Fallback direct si Edge Function pas encore déployée (dev only)
const DIRECT_URL = 'https://api.anthropic.com/v1/messages'

interface IAMessage {
  role: 'user' | 'assistant'
  content: string
}

interface IAOptions {
  max_tokens?: number
  system?: string
}

/**
 * Appel principal IA via Edge Function proxy
 */
export async function callIA(messages: IAMessage[], options: IAOptions = {}): Promise<string> {
  const payload = {
    messages,
    max_tokens: options.max_tokens ?? 600,
    ...(options.system ? { system: options.system } : {}),
  }

  try {
    // Essayer d'abord l'Edge Function (sécurisé)
    const resp = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
      },
      body: JSON.stringify(payload),
    })

    if (resp.ok) {
      const data = await resp.json()
      return data.content?.[0]?.text?.trim() ?? ''
    }

    // Si Edge Function non disponible → log warning, retourner vide
    console.warn('[PIVOT IA] Edge Function non disponible:', resp.status)
    return ''
  } catch (err) {
    console.error('[PIVOT IA] Erreur:', err)
    return ''
  }
}

/**
 * Helper: appel IA avec réponse JSON parsée
 */
export async function callIAJson<T = any>(messages: IAMessage[], options: IAOptions = {}): Promise<T | null> {
  const text = await callIA(messages, options)
  if (!text) return null
  try {
    return JSON.parse(text.replace(/```json?|```/g, '').trim()) as T
  } catch {
    console.warn('[PIVOT IA] JSON parse failed:', text.slice(0, 100))
    return null
  }
}
