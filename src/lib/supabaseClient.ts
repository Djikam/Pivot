import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[PIVOT] Variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY manquantes dans .env')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'pivot-auth-token',
  },
  realtime: {
    params: { eventsPerSecond: 10 }
  },
  global: {
    headers: { 'x-app': 'pivot' }
  }
})

// Rafraîchir la session quand l'onglet redevient actif (évite les redirections après inactivité)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Force refresh si le token expire dans moins de 60s
        const expiresAt = session.expires_at ?? 0
        const now = Math.floor(Date.now() / 1000)
        if (expiresAt - now < 60) {
          await supabase.auth.refreshSession()
        }
      }
    }
  })
}

// Helper upload Cloudinary (remplace axios dans les vues admin)
export async function uploadToCloudinary(file: File, folder = 'pivot'): Promise<string> {
  const cloudName   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', uploadPreset)
  fd.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST', body: fd
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Cloudinary upload échoué')
  return data.public_id
}

// Helper : générer l'URL Cloudinary depuis le public_id
export function cloudinaryUrl(publicId: string, opts?: { w?: number; h?: number; q?: number }): string {
  if (!publicId) return '/placeholder-joueur.png'
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
  const transforms = [
    opts?.w ? `w_${opts.w}` : '',
    opts?.h ? `h_${opts.h}` : '',
    opts?.q ? `q_${opts.q}` : 'q_auto',
    'f_webp',
  ].filter(Boolean).join(',')
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}
