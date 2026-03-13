/**
 * PIVOT — AI Client
 * Groq (Llama 3 70B) en primaire
 * Google Gemini Flash en fallback automatique si quota épuisé
 */

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIOptions {
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

interface AIResponse {
  text: string
  provider: 'groq' | 'gemini'
  tokensUsed?: number
}

// ─── Groq ─────────────────────────────────────────────────────────────────────
async function callGroq(prompt: string, opts: AIOptions = {}): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY manquante')

  const messages = []
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0.7,
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const error = new Error(`Groq error ${res.status}`) as any
    error.status = res.status
    error.code = err.error?.code
    throw error
  }

  const data = await res.json()
  return {
    text: data.choices[0]?.message?.content ?? '',
    provider: 'groq',
    tokensUsed: data.usage?.total_tokens,
  }
}

// ─── Gemini Fallback ──────────────────────────────────────────────────────────
async function callGemini(prompt: string, opts: AIOptions = {}): Promise<AIResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY manquante — fallback impossible')

  const fullPrompt = opts.systemPrompt ? `${opts.systemPrompt}\n\n${prompt}` : prompt

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 1024,
          temperature: opts.temperature ?? 0.7,
        }
      })
    }
  )

  if (!res.ok) throw new Error(`Gemini error ${res.status}`)

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return { text, provider: 'gemini' }
}

// ─── Client principal avec bascule automatique ────────────────────────────────
export async function callAI(prompt: string, opts: AIOptions = {}): Promise<AIResponse> {
  try {
    return await callGroq(prompt, opts)
  } catch (err: any) {
    // Bascule si quota épuisé (429) ou rate limit
    const shouldFallback = err.status === 429 || err.code === 'rate_limit_exceeded' || err.status === 503
    if (shouldFallback) {
      console.warn('[PIVOT AI] Groq quota épuisé — bascule sur Gemini Flash')
      return await callGemini(prompt, opts)
    }
    throw err
  }
}

// ─── Fonctions métier PIVOT ───────────────────────────────────────────────────

const SYSTEM_HANDBALL = `Tu es l'assistant data de PIVOT, plateforme officieuse du handball camerounais.
Tu réponds en français, de manière concise et professionnelle.
Tu utilises le vocabulaire handball camerounais (suspensions, carton bleu, 7 mètres, buteur, gardien).
Tu ne dois jamais inventer de statistiques — si tu n'as pas la donnée, dis-le clairement.`

/**
 * Calcule le Score Performance IA d'un joueur (0–100)
 */
export async function calculerScoreIA(joueur: {
  nom: string
  poste: string
  buts_saison: number
  matchs_joues: number
  suspensions: number
  cartons_rouge: number
  cartons_bleu: number
  age: number
  saisons_en_base: number
  distinctions: number
}): Promise<number> {
  const prompt = `
Calcule un Score Performance pour ce joueur de handball camerounais.
Donne UNIQUEMENT un nombre entier entre 0 et 100. Rien d'autre.

Données joueur :
- Nom : ${joueur.nom}
- Poste : ${joueur.poste}
- Buts cette saison : ${joueur.buts_saison} en ${joueur.matchs_joues} matchs
- Suspensions (2min) : ${joueur.suspensions}
- Cartons rouges : ${joueur.cartons_rouge}
- Cartons bleus : ${joueur.cartons_bleu}
- Âge : ${joueur.age} ans
- Saisons en base PIVOT : ${joueur.saisons_en_base}
- Distinctions obtenues : ${joueur.distinctions}

Critères de notation :
- Efficacité offensive (buts/match selon le poste) : 40%
- Discipline (-1pt suspension, -5pt rouge, -8pt bleu) : 25%
- Régularité (matchs joués) : 20%
- Palmarès (distinctions) : 15%

Réponds avec un seul entier.
`
  const res = await callAI(prompt, { maxTokens: 10, temperature: 0.1, systemPrompt: SYSTEM_HANDBALL })
  const score = parseInt(res.text.trim(), 10)
  return isNaN(score) ? 50 : Math.max(0, Math.min(100, score))
}

/**
 * Génère le résumé d'un match pour le module FEED
 */
export async function resumeMatch(match: {
  club_dom: string
  club_ext: string
  score_dom: number
  score_ext: number
  mi_temps_dom: number
  mi_temps_ext: number
  competition: string
  journee: number
  buteurs: { nom: string; club: string; buts: number }[]
  discipline: { nom: string; type: string }[]
}): Promise<string> {
  const buteursText = match.buteurs.map(b => `${b.nom} (${b.club}) ${b.buts} but(s)`).join(', ')
  const disciplineText = match.discipline.map(d => `${d.nom} — ${d.type}`).join(', ')

  const prompt = `
Rédige un résumé de match de handball en 3 paragraphes courts (max 80 mots total).
Style : journalistique, dynamique, précis. Commence directement par les faits.

Match : ${match.club_dom} ${match.score_dom}-${match.score_ext} ${match.club_ext}
Mi-temps : ${match.mi_temps_dom}-${match.mi_temps_ext}
Compétition : ${match.competition} — Journée ${match.journee}
Buteurs : ${buteursText || 'Non disponible'}
Discipline : ${disciplineText || 'Aucun incident'}
`
  const res = await callAI(prompt, { maxTokens: 200, temperature: 0.8, systemPrompt: SYSTEM_HANDBALL })
  return res.text.trim()
}

/**
 * Génère un article sur un transfert pour le module FEED
 */
export async function resumeTransfert(transfert: {
  joueur: string
  poste: string
  club_depart: string
  club_arrivee: string
  fiabilite: number
  motif?: string
}): Promise<string> {
  const niveaux = ['', 'Suspicion détectée', 'Rumeur', 'Source officieuse', 'Transfert confirmé']
  const prompt = `
Rédige une brève sur ce transfert/mouvement de joueur de handball camerounais (max 60 mots).
Niveau de fiabilité : ${niveaux[transfert.fiabilite]} (${transfert.fiabilite}/4)
Adapte le ton à la fiabilité : affirmatif si 4, conditionnel si 1-2.

${transfert.joueur} (${transfert.poste}) — ${transfert.club_depart} → ${transfert.club_arrivee}
${transfert.motif ? `Contexte : ${transfert.motif}` : ''}
`
  const res = await callAI(prompt, { maxTokens: 120, temperature: 0.75, systemPrompt: SYSTEM_HANDBALL })
  return res.text.trim()
}
