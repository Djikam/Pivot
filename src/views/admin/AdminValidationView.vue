<template>
  <div class="admin-validation">
    <div class="admin-toolbar">
      <select v-model="filterStatut" class="p-input p-select" @change="load">
        <option value="A_TRAITER">À traiter</option>
        <option value="VALIDE">Validés</option>
        <option value="REJETE">Rejetés</option>
        <option value="">Tous</option>
      </select>
      <select v-model="filterType" class="p-input p-select" @change="load">
        <option value="">Tous profils</option>
        <option value="JOUEUR">Joueurs</option>
        <option value="COACH">Coaches</option>
        <option value="PRESIDENT">Présidents</option>
      </select>
      <span class="text-sub" style="font-size:13px;margin-left:auto">{{ total }} demande(s)</span>
    </div>

    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <div v-else-if="items.length === 0" class="empty-state">
      <span>✓</span><p>Aucune demande {{ filterStatut === 'A_TRAITER' ? 'en attente' : '' }}.</p>
    </div>

    <div v-else class="items-list">
      <div v-for="item in items" :key="item.id" class="item-card p-card">
        <div class="item-header">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="p-badge" :class="typeBadge(item.type_profil)">{{ item.type_profil }}</span>
            <span class="p-badge" :class="statutBadge(item.statut)">{{ item.statut }}</span>
            <span class="text-sub" style="font-size:11px">{{ formatDate(item.created_at) }}</span>
          </div>
          <div v-if="item.statut === 'A_TRAITER'" class="item-actions">
            <button class="p-btn-ghost p-btn-sm" style="color:var(--p-green)" @click="valider(item)">✓ Valider</button>
            <button class="p-btn-ghost p-btn-sm btn-danger" @click="rejeter(item)">✕ Rejeter</button>
          </div>
        </div>
        <div class="item-body">
          <div class="item-name font-display">{{ item.prenom }} {{ item.nom }}</div>
          <div class="item-contacts text-sub">
            <span v-if="item.email">✉ {{ item.email }}</span>
            <span v-if="item.telephone">📱 {{ item.telephone }}</span>
          </div>
          <div class="item-details" v-if="item.details_techniques">
            <div v-if="item.details_techniques.poste_principal" class="detail-chip">
              Poste: {{ item.details_techniques.poste_principal }}
            </div>
            <div v-if="item.details_techniques.bras_fort" class="detail-chip">
              Bras: {{ item.details_techniques.bras_fort }}
            </div>
            <div v-if="item.details_techniques.taille" class="detail-chip">
              {{ item.details_techniques.taille }} cm
            </div>
            <div v-if="item.details_techniques.role" class="detail-chip">
              {{ item.details_techniques.role }}
            </div>
          </div>
          <div v-if="item.details_techniques?.message" class="item-message text-sub">
            "{{ item.details_techniques.message }}"
          </div>
          <div class="item-docs" v-if="item.cv_url || item.photo_url">
            <a v-if="item.cv_url" :href="item.cv_url" target="_blank" class="p-btn-ghost p-btn-sm">📄 CV</a>
            <a v-if="item.photo_url" :href="item.photo_url" target="_blank" class="p-btn-ghost p-btn-sm">📸 Photo</a>
          </div>
          <!-- Créer le joueur directement -->
          <div v-if="item.statut === 'VALIDE' && item.type_profil === 'JOUEUR' && !item.joueur_cree" class="create-action">
            <button class="p-btn-red p-btn-sm" @click="creerJoueur(item)">+ Créer fiche joueur PIVOT</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const items       = ref<any[]>([])
const total       = ref(0)
const loading     = ref(true)
const filterStatut = ref('A_TRAITER')
const filterType   = ref('')

const typeBadge   = (t: string) => ({ JOUEUR:'p-badge-blue', COACH:'p-badge-gold', PRESIDENT:'p-badge-muted' }[t] ?? 'p-badge-muted')
const statutBadge = (s: string) => ({ A_TRAITER:'p-badge-live', VALIDE:'p-badge-green', REJETE:'p-badge-red' }[s] ?? 'p-badge-muted')
const formatDate  = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' })

async function load() {
  loading.value = true
  let q = supabase.from('collecte_profils').select('*', { count:'exact' }).order('created_at', { ascending: false })
  if (filterStatut.value) q = q.eq('statut', filterStatut.value)
  if (filterType.value)   q = q.eq('type_profil', filterType.value)
  const { data, count } = await q
  items.value = data ?? []; total.value = count ?? 0
  loading.value = false
}

async function valider(item: any) {
  await supabase.from('collecte_profils').update({ statut: 'VALIDE' }).eq('id', item.id)
  load()
}

async function rejeter(item: any) {
  if (!confirm(`Rejeter la demande de ${item.prenom} ${item.nom} ?`)) return
  await supabase.from('collecte_profils').update({ statut: 'REJETE' }).eq('id', item.id)
  load()
}

async function creerJoueur(item: any) {
  const d = item.details_techniques ?? {}
  const { data: j, error } = await supabase.from('joueurs').insert({
    prenom: item.prenom, nom: item.nom,
    poste_principal: d.poste_principal ?? null,
    bras_fort: d.bras_fort ?? 'droitier',
    taille_estimee: d.taille ?? null,
    poids: d.poids ?? null,
    date_naissance_approx: d.date_naissance ?? null,
    genre: 'masculin', nationalite: 'Camerounais', score_ia: 50,
    verifie: true
  }).select('id').single()
  if (!error && j) {
    await supabase.from('collecte_profils').update({ joueur_cree: true }).eq('id', item.id)
    alert(`Joueur créé ! ID: ${j.id}`)
    load()
  }
}

onMounted(load)
</script>

<style scoped>
.admin-toolbar { display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center }
.items-list { display:flex;flex-direction:column;gap:12px }
.item-card { padding:16px 20px }
.item-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px }
.item-actions { display:flex;gap:8px }
.item-name { font-size:1.2rem;font-weight:700;margin-bottom:4px }
.item-contacts { display:flex;gap:12px;font-size:13px;margin-bottom:10px;flex-wrap:wrap }
.item-details { display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px }
.detail-chip { padding:2px 8px;border-radius:99px;background:var(--p-bg3);font-size:12px }
.item-message { font-size:13px;font-style:italic;margin-bottom:10px;padding:8px;border-radius:6px;background:var(--p-bg2) }
.item-docs { display:flex;gap:8px;margin-bottom:10px }
.create-action { margin-top:10px;padding-top:10px;border-top:1px solid var(--p-border) }
.btn-danger { color:var(--p-red) }
.loading-state { display:flex;justify-content:center;padding:60px 0 }
.spinner { width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin .7s linear infinite }
@keyframes spin { to{transform:rotate(360deg)} }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub) }
.empty-state span { font-size:2rem }
</style>
