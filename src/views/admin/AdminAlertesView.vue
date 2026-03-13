<template>
  <div>
    <h3 class="font-display" style="font-size:1.2rem;font-weight:700;margin-bottom:20px">Alertes système</h3>
    <div class="alertes-sections">
      <!-- Cartons bleus non traités -->
      <div class="p-card alerte-block" v-if="cartonsBleu.length">
        <h4 style="font-weight:700;margin-bottom:12px;color:#8A7AFF"><Circle class="inline w-4 h-4 mr-1" /> Cartons bleus — Rapports disciplinaires en attente ({{ cartonsBleu.length }})</h4>
        <table class="p-table">
          <thead><tr><th>Joueur</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="d in cartonsBleu" :key="d.id">
              <td style="font-weight:600">{{ d.joueur?.prenom }} {{ d.joueur?.nom }}</td>
              <td class="text-sub" style="font-size:12px">{{ fd(d.created_at) }}</td>
              <td><button class="p-btn-ghost p-btn-sm" @click="marquer(d.id)">Marquer envoyé</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Suspicions RADAR -->
      <div class="p-card alerte-block" v-if="suspicions.length">
        <h4 style="font-weight:700;margin-bottom:12px;color:var(--p-red)"><Target class="inline w-4 h-4 mr-1" /> Suspicions RADAR auto-détectées ({{ suspicions.length }})</h4>
        <table class="p-table">
          <thead><tr><th>Joueur</th><th>Origine</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="t in suspicions" :key="t.id">
              <td style="font-weight:600">{{ t.joueur?.prenom }} {{ t.joueur?.nom }}</td>
              <td class="text-sub">{{ t.club_origine?.nom??'—' }}</td>
              <td class="text-sub" style="font-size:12px">{{ fd(t.created_at) }}</td>
              <td style="display:flex;gap:6px">
                <button class="p-btn-red p-btn-sm" @click="upgradeTransfert(t.id,2)">→ Rumeur</button>
                <button class="p-btn-ghost p-btn-sm" @click="deleteTransfert(t.id)">Suppr.</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading && !cartonsBleu.length && !suspicions.length" class="empty-state"><CheckCircle class="inline w-5 h-5" /><p>Aucune alerte active.</p></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { Circle, Target, CheckCircle } from 'lucide-vue-next'
const cartonsBleu=ref<any[]>([]);const suspicions=ref<any[]>([]);const loading=ref(true)
const fd=(d:string)=>new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})
async function marquer(id:string){await supabase.from('discipline').update({rapport_envoye:true}).eq('id',id);cartonsBleu.value=cartonsBleu.value.filter(x=>x.id!==id)}
async function upgradeTransfert(id:string,f:number){await supabase.from('transferts').update({fiabilite:f}).eq('id',id);suspicions.value=suspicions.value.filter(x=>x.id!==id)}
async function deleteTransfert(id:string){if(!confirm('Supprimer ce mouvement ?'))return;await supabase.from('transferts').delete().eq('id',id);suspicions.value=suspicions.value.filter(x=>x.id!==id)}
onMounted(async()=>{const[{data:b},{data:s}]=await Promise.all([supabase.from('discipline').select('*,joueur:joueurs(prenom,nom)').eq('type','carton_bleu').eq('rapport_envoye',false).limit(20),supabase.from('transferts').select('*,joueur:joueurs(prenom,nom),club_origine:clubs!transferts_club_origine_id_fkey(nom)').eq('fiabilite',1).limit(20)]);cartonsBleu.value=b??[];suspicions.value=s??[];loading.value=false})
</script>
<style scoped>
.alerte-block{padding:20px;margin-bottom:16px;}
.empty-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 0;color:var(--p-sub)}
</style>
