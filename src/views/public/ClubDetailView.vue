<template>
  <div v-if="club">
    <section class="club-hero adinkra-watermark">
      <div class="p-container hero-inner">
        <div class="club-logo-lg">
          <img v-if="club.logo_cloudinary_id" :src="cloudinaryUrl(club.logo_cloudinary_id,{w:80,h:80})" :alt="club.nom" />
          <span v-else class="logo-initials font-display">{{ club.acronyme || club.nom.slice(0,3) }}</span>
        </div>
        <div>
          <h1 class="font-display" style="font-size:2rem;font-weight:700;margin-bottom:6px">{{ club.nom }}</h1>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <span class="text-sub"><svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {{ club.ville }}, {{ club.region }}</span>
            <span v-if="club.gymnase" class="text-sub">🏟️ {{ club.gymnase }}</span>
            <span v-if="club.universitaire" class="p-badge p-badge-blue"><svg class="inline w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg> Universitaire</span>
          </div>
        </div>
      </div>
    </section>

    <div class="p-container" style="padding-top:32px;padding-bottom:60px">
      <div class="detail-layout">
        <div>
          <!-- Effectif -->
          <h2 class="font-display" style="font-size:1.3rem;font-weight:700;margin-bottom:16px">Effectif — Saison 2025-2026</h2>
          <div v-if="loading" class="loading-state"><div class="spinner" /></div>
          <div v-else class="roster-grid">
            <RouterLink v-for="l in licences" :key="l.id" :to="'/joueurs/'+l.joueur_id" class="roster-row p-card">
              <div class="roster-num text-sub">{{ l.numero_maillot ? '#'+l.numero_maillot : '—' }}</div>
              <div class="roster-info">
                <span class="roster-name">{{ l.joueur?.prenom }} {{ l.joueur?.nom }}</span>
                <span class="roster-poste text-sub">{{ posteLabel(l.joueur?.poste_principal) }}</span>
              </div>
              <span class="font-display" style="font-weight:700;font-size:1rem" :style="{color:scoreColor(l.joueur?.score_ia??50)}">{{ l.joueur?.score_ia }}</span>
            </RouterLink>
          </div>
        </div>
        <!-- Infos -->
        <div class="p-card" style="padding:16px;height:fit-content">
          <h4 class="font-display" style="font-weight:700;margin-bottom:12px">Informations</h4>
          <div class="info-row"><span class="text-sub">Région</span><span>{{ club.region }}</span></div>
          <div class="info-row"><span class="text-sub">Ville</span><span>{{ club.ville }}</span></div>
          <div class="info-row" v-if="club.gymnase"><span class="text-sub">Gymnase</span><span>{{ club.gymnase }}</span></div>
          <div class="info-row"><span class="text-sub">Universitaire</span><span>{{ club.universitaire ? 'Oui' : 'Non' }}</span></div>
          <div class="info-row"><span class="text-sub">Joueurs</span><span>{{ licences.length }}</span></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading-state p-container" style="padding:80px 0"><div class="spinner" /></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase, cloudinaryUrl } from '@/lib/supabaseClient'
const route = useRoute()
const club = ref<any>(null)
const licences = ref<any[]>([])
const loading = ref(true)
const postes: Record<string,string> = { gardien:'Gardien',ailier_g:'Ailier G',ailier_d:'Ailier D',arriere_g:'Arrière G',arriere_d:'Arrière D',demi_centre:'Demi-Centre',pivot:'Pivot' }
const posteLabel = (p: string) => postes[p] ?? p
const scoreColor = (s: number) => s >= 80 ? '#3BAA6A' : s >= 60 ? '#C4922A' : '#3A80BE'

onMounted(async () => {
  const id = route.params.id as string
  const [{ data: c }, { data: lic }] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', id).single(),
    supabase.from('licences_saison').select('*, joueur:joueurs(id,prenom,nom,poste_principal,score_ia)').eq('club_id', id).eq('saison','2025-2026').eq('actif', true).order('numero_maillot'),
  ])
  club.value = c; licences.value = lic ?? []; loading.value = false
})
</script>

<style scoped>
.club-hero { background:var(--p-card);border-bottom:1px solid var(--p-border);padding:36px 0; }
.hero-inner { display:flex;align-items:center;gap:20px; }
.club-logo-lg { width:72px;height:72px;border-radius:12px;overflow:hidden;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid var(--p-border); }
.club-logo-lg img { width:100%;height:100%;object-fit:cover; }
.logo-initials { font-size:1.4rem;font-weight:700;color:var(--p-red); }
.detail-layout { display:grid;grid-template-columns:1fr 240px;gap:24px;align-items:flex-start; }
.roster-grid { display:flex;flex-direction:column;gap:6px; }
.roster-row { display:flex;align-items:center;gap:12px;padding:10px 14px; }
.roster-num { font-family:var(--font-display);font-size:1rem;font-weight:700;min-width:32px;text-align:center; }
.roster-info { flex:1; }
.roster-name { font-weight:600;font-size:14px;display:block; }
.roster-poste { font-size:12px; }
.info-row { display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--p-border);font-size:13px; }
.info-row:last-child { border:none; }
.loading-state { display:flex;justify-content:center;align-items:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
@media (max-width:900px) { .detail-layout{grid-template-columns:1fr;} }
</style>
