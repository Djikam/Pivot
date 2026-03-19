<template>
  <div>
    <section class="p-hero" style="padding:36px 0 28px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Classements</h1>
        <p class="text-sub">Classements de toutes les phases de compétitions</p>
      </div>
    </section>

    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <!-- Sélecteur compétition -->
      <div class="filters-bar" style="margin-bottom:24px">
        <select v-model="selectedCompId" class="p-input p-select" style="min-width:280px" @change="loadClassement">
          <option value="">Sélectionner une compétition</option>
          <option v-for="c in competitions" :key="c.id" :value="c.id">{{ c.nom }} — {{ c.saison }}</option>
        </select>
        <select v-if="phases.length > 1" v-model="selectedPhaseId" class="p-input p-select" @change="loadClassement">
          <option v-for="p in phases" :key="p.id" :value="p.id">{{ p.nom }}</option>
        </select>
      </div>

      <div v-if="loading" class="loading-state"><div class="spinner" /></div>

      <div v-else-if="!selectedCompId" class="empty-state">
        <span>🏆</span>
        <p>Sélectionne une compétition pour voir le classement.</p>
      </div>

      <div v-else-if="classement.length === 0" class="empty-state">
        <span>📊</span>
        <p>Aucun classement disponible pour cette phase.</p>
        <RouterLink :to="'/competitions/'+selectedComp?.slug" class="p-btn-ghost p-btn-sm">Voir la compétition →</RouterLink>
      </div>

      <div v-else>
        <div class="classement-header">
          <h2 class="font-display" style="font-size:1.2rem;font-weight:700">{{ selectedComp?.nom }}</h2>
          <RouterLink :to="'/competitions/'+selectedComp?.slug" class="p-btn-ghost p-btn-sm">Voir les matchs →</RouterLink>
        </div>
        <div style="overflow-x:auto">
          <table class="p-table classement-table">
            <thead>
              <tr>
                <th style="width:40px">#</th>
                <th>Club</th>
                <th title="Matchs joués">MJ</th>
                <th title="Victoires">V</th>
                <th title="Nuls">N</th>
                <th title="Défaites">D</th>
                <th title="Buts pour">BP</th>
                <th title="Buts contre">BC</th>
                <th title="Différence de buts">DB</th>
                <th title="Points" style="color:var(--p-red)">PTS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in classement" :key="c.id"
                :class="{ 'rank-top': i < 2, 'rank-releg': i >= classement.length - 2 }">
                <td class="font-display" style="font-weight:700;font-size:1.1rem;color:var(--p-sub)">{{ i+1 }}</td>
                <td>
                  <RouterLink :to="'/clubs/'+c.club_id" style="font-weight:700">{{ c.club?.nom ?? '—' }}</RouterLink>
                </td>
                <td class="text-sub">{{ (c.victoires||0)+(c.nuls||0)+(c.defaites||0) }}</td>
                <td style="color:var(--p-green);font-weight:600">{{ c.victoires ?? 0 }}</td>
                <td class="text-sub">{{ c.nuls ?? 0 }}</td>
                <td style="color:var(--p-red)">{{ c.defaites ?? 0 }}</td>
                <td class="text-sub">{{ c.buts_pour ?? 0 }}</td>
                <td class="text-sub">{{ c.buts_contre ?? 0 }}</td>
                <td class="text-sub" :style="{color: (c.buts_pour??0)-(c.buts_contre??0) >= 0 ? 'var(--p-green)' : 'var(--p-red)'}">
                  {{ ((c.buts_pour??0)-(c.buts_contre??0)) > 0 ? '+' : '' }}{{ (c.buts_pour??0)-(c.buts_contre??0) }}
                </td>
                <td class="font-display" style="font-weight:700;font-size:1.2rem;color:var(--p-red)">{{ c.points ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const competitions  = ref<any[]>([])
const phases        = ref<any[]>([])
const classement    = ref<any[]>([])
const loading       = ref(false)
const selectedCompId  = ref('')
const selectedPhaseId = ref('')

const selectedComp = computed(() => competitions.value.find(c => c.id === selectedCompId.value))

async function loadClassement() {
  if (!selectedCompId.value) return
  loading.value = true

  // Charger les phases de la compétition
  const { data: ph } = await supabase.from('phases').select('id,nom,ordre').eq('competition_id', selectedCompId.value).order('ordre')
  phases.value = ph ?? []
  if (!selectedPhaseId.value && ph?.length) selectedPhaseId.value = ph[0].id

  if (!selectedPhaseId.value) { classement.value = []; loading.value = false; return }

  // Charger le classement
  const { data } = await supabase.from('classements')
    .select('*, club:clubs(id,nom)')
    .eq('phase_id', selectedPhaseId.value)
    .order('points', { ascending: false })
    .order('buts_pour', { ascending: false })

  classement.value = data ?? []
  loading.value = false
}

onMounted(async () => {
  const { data } = await supabase.from('competitions')
    .select('id,nom,slug,saison,statut')
    .in('statut', ['en_cours','termine'])
    .order('saison', { ascending: false })
  competitions.value = data ?? []
})
</script>

<style scoped>
.filters-bar { display:flex;gap:10px;flex-wrap:wrap }
.classement-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:16px }
.classement-table tr.rank-top td:first-child { color:var(--p-gold) }
.classement-table tr.rank-releg { opacity:.7 }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin .7s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub) }
.empty-state span { font-size:2.5rem }
</style>
