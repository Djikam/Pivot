<template>
  <div>
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap">
      <select v-model="filterStatut" class="p-input p-select" style="width:180px" @change="load">
        <option value="en_attente">En attente</option><option value="traite">Traitées</option><option value="rejete">Rejetées</option><option value="">Toutes</option>
      </select>
      <span class="p-badge p-badge-red" v-if="enAttente>0">{{ enAttente }} en attente</span>
    </div>
    <div v-if="loading" class="loading-state"><div class="spinner" /></div>
    <table v-else class="p-table">
      <thead><tr><th>Type</th><th>Contenu</th><th>Contact</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="d in demandes" :key="d.id">
          <td><span class="p-badge" :class="tc(d.type_demande)">{{ d.type_demande }}</span></td>
          <td style="max-width:300px;font-size:13px">{{ d.contenu }}</td>
          <td class="text-sub" style="font-size:12px">{{ d.telephone_contact||'—' }}</td>
          <td class="text-sub" style="font-size:11px">{{ fd(d.created_at) }}</td>
          <td><span class="p-badge" :class="sc(d.statut)">{{ d.statut }}</span></td>
          <td style="display:flex;gap:6px">
            <button v-if="d.statut==='en_attente'" class="p-btn-red p-btn-sm" @click="traiter(d,'traite')"><Check class="w-4 h-4" /></button>
            <button v-if="d.statut==='en_attente'" class="p-btn-ghost p-btn-sm" @click="traiter(d,'rejete')"><X class="w-4 h-4" /></button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loading&&demandes.length===0" class="empty-state"><CheckCircle class="w-5 h-5" /><p>Aucune demande.</p></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle, Check, X } from 'lucide-vue-next'
const demandes=ref<any[]>([]);const loading=ref(true);const filterStatut=ref('en_attente');const enAttente=ref(0)
const tc=(t:string)=>({correction:'p-badge-blue',suppression:'p-badge-red',ajout:'p-badge-green',reclamation:'p-badge-gold'}[t]??'p-badge-muted')
const sc=(s:string)=>({en_attente:'p-badge-gold',traite:'p-badge-green',rejete:'p-badge-red'}[s]??'p-badge-muted')
const fd=(d:string)=>new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
async function load(){loading.value=true;let q=supabase.from('crowdsourcing_queue').select('*').order('created_at',{ascending:false});if(filterStatut.value)q=q.eq('statut',filterStatut.value);const[{data},{count}]=await Promise.all([q,supabase.from('crowdsourcing_queue').select('id',{count:'exact',head:true}).eq('statut','en_attente')]);demandes.value=data??[];enAttente.value=count??0;loading.value=false}
async function traiter(d:any,statut:string){await supabase.from('crowdsourcing_queue').update({statut,traite_le:new Date().toISOString()}).eq('id',d.id);d.statut=statut;if(statut!==filterStatut.value)demandes.value=demandes.value.filter(x=>x.id!==d.id)}
onMounted(load)
</script>
<style scoped>
.loading-state,.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub)}
.spinner{width:32px;height:32px;border:3px solid var(--p-border);border-top-color:var(--p-red);border-radius:50%;animation:spin 700ms linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
</style>
