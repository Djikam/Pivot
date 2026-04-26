<template>
  <div>
    <section class="p-hero" style="padding:40px 0 32px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">ARENA — Compétitions</h1>
        <p class="text-sub">Toutes les compétitions handball Cameroun — Régionales, Nationales, Universitaires, CAN</p>
      </div>
    </section>
    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <div class="type-tabs">
        <button v-for="t in types" :key="t.value" class="type-tab" :class="{active:filterType===t.value}" @click="filterType=t.value"><component :is="t.icon" width="16" height="16" /> {{ t.label }}</button>
      </div>
      <div class="genre-tabs" style="margin-top:10px">
        <button class="genre-tab" :class="{active:filterGenre===''}" @click="filterGenre=''">Tous</button>
        <button class="genre-tab" :class="{active:filterGenre==='masculin'}" @click="filterGenre='masculin'"> Masculin</button>
        <button class="genre-tab" :class="{active:filterGenre==='feminin'}" @click="filterGenre='feminin'"> Féminin</button>
      </div>
      <KenteDivider :my="20" />
      <div v-if="loading" class="loading-state"><div class="spinner" /></div>
      <div v-else class="comps-grid">
        <RouterLink v-for="c in filteredComps" :key="c.id" :to="'/competitions/'+c.slug" class="comp-card p-card">
          <div class="comp-header">
            <span class="p-badge" :class="statutBadge(c.statut)">{{ statutLabel(c.statut) }}</span>
            <span class="p-badge p-badge-muted">{{ c.saison }}</span>
          </div>
          <div class="comp-type-icon"><component :is="typeIcon(c.type)" width="16" height="16" /></div>
          <h3 class="comp-nom">{{ c.nom }}</h3>
          <div class="comp-meta text-sub">
            <span v-if="c.region"><MapPin class="inline w-3 h-3 mr-1" /> {{ c.region }}</span>
            <span><User class="inline w-3 h-3 mr-1" /> {{ c.genre === 'feminin' ? 'Féminin' : 'Masculin' }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import KenteDivider from '@/components/KenteDivider.vue'
import { Trophy, MapPin, Flag, GraduationCap, CheckCircle, Globe } from 'lucide-vue-next'
const competitions = ref<any[]>([])
const loading = ref(true)
const filterType  = ref('all')
const filterGenre = ref('')
const types = [
  { value:'all',          label:'Toutes',        icon: Trophy },
  { value:'regional',     label:'Régionales',    icon: MapPin },
  { value:'national',     label:'Nationales',    icon: Flag },
  { value:'universitaire',label:'Universitaires',icon: GraduationCap },
  { value:'coupe',        label:'Coupe',         icon: CheckCircle },
  { value:'international',label:'International', icon: Globe },
]
const filteredComps = computed(() => {
  let r = filterType.value === 'all' ? competitions.value : competitions.value.filter(c => c.type === filterType.value)
  if (filterGenre.value) r = r.filter(c => c.genre === filterGenre.value)
  return r
})
const statutBadge = (s: string) => ({ en_cours:'p-badge-green', termine:'p-badge-muted', a_venir:'p-badge-gold' }[s] ?? 'p-badge-muted')
const statutLabel = (s: string) => ({ en_cours:'En cours', termine:'Terminé', a_venir:'À venir' }[s] ?? s)
const typeIcon = (t: string) => ({ regional: MapPin, national: Flag, universitaire: GraduationCap, coupe: CheckCircle, international: Globe }[t] ?? Trophy)

onMounted(async () => {
  const { data } = await supabase.from('competitions').select('*').order('saison', { ascending: false }).order('nom')
  competitions.value = data ?? []; loading.value = false
})
</script>

<style scoped>
.type-tabs { display:flex;gap:8px;flex-wrap:wrap; }
.type-tab { padding:8px 14px;border-radius:8px;border:1px solid var(--p-border);font-size:13px;cursor:pointer;background:transparent;color:var(--p-sub);transition:all 150ms; }
.type-tab.active { border-color:var(--p-red);background:rgba(140,21,37,.1);color:var(--p-red); }
.genre-tabs { display:flex;gap:8px;flex-wrap:wrap; }
.genre-tab { padding:5px 12px;border-radius:99px;border:1px solid var(--p-border);font-size:12px;cursor:pointer;background:transparent;color:var(--p-sub);transition:all 150ms; }
.genre-tab.active { border-color:var(--p-gold);background:rgba(196,146,42,.1);color:var(--p-gold); }
.comps-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
.comp-card { padding:20px;display:flex;flex-direction:column;gap:10px; }
.comp-header { display:flex;gap:6px;flex-wrap:wrap; }
.comp-type-icon { font-size:1.8rem; }
.comp-nom { font-weight:700;font-size:15px; }
.comp-meta { display:flex;gap:10px;font-size:12px; }
.loading-state { display:flex;justify-content:center;padding:60px 0; }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
