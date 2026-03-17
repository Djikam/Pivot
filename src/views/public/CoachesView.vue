<template>
  <div>
    <section class="p-hero" style="padding:40px 0 32px">
      <div class="p-container">
        <h1 class="font-display" style="font-size:2.2rem;font-weight:700;margin-bottom:6px">Coaches & Staff</h1>
        <p class="text-sub">Corps technique du handball camerounais — clubs et équipes nationales</p>
      </div>
    </section>

    <div class="p-container" style="padding-top:24px;padding-bottom:60px">
      <!-- Filtres -->
      <div class="filters-bar">
        <input v-model="search" class="p-input" placeholder="🔍 Rechercher un coach…"
          style="flex:1;max-width:300px" @input="debouncedLoad" />
        <select v-model="filterType" class="p-input p-select" @change="load">
          <option value="">Tous rôles</option>
          <option value="COACH">Coach</option>
          <option value="PRESIDENT">Président</option>
        </select>
        <select v-model="filterScope" class="p-input p-select" @change="load">
          <option value="">Tous niveaux</option>
          <option value="national">Équipes nationales</option>
          <option value="club">Clubs</option>
        </select>
      </div>

      <div v-if="loading" class="loading-state"><div class="spinner" /></div>

      <!-- Section Équipes Nationales -->
      <div v-else>
        <div v-if="staffNational.length && (filterScope === '' || filterScope === 'national')" class="section-block">
          <h2 class="section-title font-display">🇨🇲 Staff Équipes Nationales</h2>
          <div class="staff-grid">
            <div v-for="s in staffNational" :key="s.id" class="staff-card p-card p-card-cam">
              <div class="staff-avatar">
                <img v-if="s.photo_url" :src="s.photo_url" :alt="s.nom" />
                <span v-else class="avatar-initials font-display">{{ s.prenom[0] }}{{ s.nom[0] }}</span>
              </div>
              <div class="staff-info">
                <div class="staff-badge-row">
                  <span class="p-badge" :class="s.type_staff==='COACH'?'p-badge-blue':'p-badge-gold'">
                    {{ s.type_staff === 'COACH' ? 'Coach' : 'Président' }}
                  </span>
                  <span v-if="s.saison" class="p-badge p-badge-muted" style="font-size:10px">{{ s.saison }}</span>
                </div>
                <div class="staff-name">{{ s.prenom }} {{ s.nom }}</div>
                <div class="staff-entity text-sub">
                  {{ s.equipe_nationale?.nom ?? '—' }}
                </div>
                <div v-if="s.details_techniques?.role" class="staff-role text-sub" style="font-size:11px">
                  {{ s.details_techniques.role }}
                </div>
                <div v-if="s.details_techniques?.certif" class="staff-certif" style="font-size:11px;color:var(--p-gold);margin-top:4px">
                  🏅 {{ s.details_techniques.certif }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Clubs -->
        <div v-if="staffClubs.length && (filterScope === '' || filterScope === 'club')" class="section-block">
          <h2 class="section-title font-display">🏟️ Staff Clubs</h2>
          <div class="staff-grid">
            <div v-for="s in staffClubs" :key="s.id" class="staff-card p-card">
              <div class="staff-avatar">
                <img v-if="s.photo_url" :src="s.photo_url" :alt="s.nom" />
                <span v-else class="avatar-initials font-display">{{ s.prenom[0] }}{{ s.nom[0] }}</span>
              </div>
              <div class="staff-info">
                <div class="staff-badge-row">
                  <span class="p-badge" :class="s.type_staff==='COACH'?'p-badge-blue':'p-badge-gold'">
                    {{ s.type_staff === 'COACH' ? 'Coach' : 'Président' }}
                  </span>
                </div>
                <div class="staff-name">{{ s.prenom }} {{ s.nom }}</div>
                <RouterLink v-if="s.club_id" :to="'/clubs/'+s.club_id" class="staff-entity">
                  {{ s.club?.nom }}
                </RouterLink>
                <span v-else class="staff-entity text-sub">—</span>
                <div v-if="s.details_techniques?.certif || s.details_techniques?.diplome" class="staff-certif" style="font-size:11px;color:var(--p-gold);margin-top:4px">
                  🏅 {{ s.details_techniques?.certif ?? s.details_techniques?.diplome }}
                </div>
                <div v-if="s.details_techniques?.experience" class="text-sub" style="font-size:11px;margin-top:2px">
                  {{ s.details_techniques.experience }}
                </div>
                <div v-if="s.cv_url" style="margin-top:8px">
                  <a :href="s.cv_url" target="_blank" class="p-btn-ghost p-btn-sm" style="font-size:11px">
                    📄 Voir CV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!staffNational.length && !staffClubs.length" class="empty-state">
          <span>👨‍💼</span>
          <p>Aucun coach enregistré pour ces critères.</p>
          <RouterLink to="/self-report?type=COACH" class="p-btn-ghost p-btn-sm">
            + Enregistrer un coach
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const allStaff  = ref<any[]>([])
const loading   = ref(true)
const search    = ref('')
const filterType  = ref('')
const filterScope = ref('')

const staffNational = computed(() =>
  allStaff.value.filter(s => s.equipe_nationale_id && (!filterType.value || s.type_staff === filterType.value))
)
const staffClubs = computed(() =>
  allStaff.value.filter(s => s.club_id && !s.equipe_nationale_id && (!filterType.value || s.type_staff === filterType.value))
)

async function load() {
  loading.value = true
  let q = supabase.from('staff_club')
    .select('*, club:clubs(id,nom), equipe_nationale:equipes_nationales(id,nom,categorie,genre)')
    .order('nom')
  if (search.value) q = q.or(`nom.ilike.%${search.value}%,prenom.ilike.%${search.value}%`)
  if (filterType.value) q = q.eq('type_staff', filterType.value)
  if (filterScope.value === 'national') q = q.not('equipe_nationale_id', 'is', null)
  if (filterScope.value === 'club')     q = q.not('club_id', 'is', null).is('equipe_nationale_id', null)
  const { data } = await q
  allStaff.value = data ?? []
  loading.value = false
}

let t: ReturnType<typeof setTimeout>
function debouncedLoad() { clearTimeout(t); t = setTimeout(load, 350) }

onMounted(load)
</script>

<style scoped>
.filters-bar { display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap;align-items:center }
.section-block { margin-bottom:36px }
.section-title { font-size:1.3rem;font-weight:700;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--p-border) }
.staff-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px }
.staff-card { display:flex;align-items:flex-start;gap:14px;padding:16px }
.staff-avatar { width:52px;height:52px;border-radius:50%;overflow:hidden;background:var(--p-bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0 }
.staff-avatar img { width:100%;height:100%;object-fit:cover }
.avatar-initials { font-size:1.1rem;font-weight:700;color:var(--p-red) }
.staff-info { flex:1;min-width:0 }
.staff-badge-row { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px }
.staff-name { font-weight:700;font-size:14px;margin-bottom:2px }
.staff-entity { font-size:12px;color:var(--p-sub) }
.staff-role { color:var(--p-sub) }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub) }
.empty-state span { font-size:2.5rem }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
