<template>
  <div class="p-container" style="padding-top:40px;padding-bottom:60px;max-width:620px">
    <h1 class="font-display" style="font-size:2rem;font-weight:700;margin-bottom:8px">Modifier mes données</h1>
    <p class="text-sub" style="margin-bottom:24px">Tu es joueur et tu souhaites corriger ou supprimer tes informations sur PIVOT. Conformément à la loi camerounaise n°2010/012, tu peux envoyer une demande à notre équipe.</p>
    <div class="p-card" style="padding:24px" v-if="!sent">
      <div class="field">
        <label class="p-label">Type de demande</label>
        <select v-model="form.type_demande" class="p-input p-select">
          <option value="correction">Correction d'informations</option>
          <option value="suppression">Suppression de mon profil</option>
          <option value="ajout">Ajout d'informations</option>
          <option value="reclamation">Réclamation</option>
        </select>
      </div>
      <div class="field">
        <label class="p-label">Ton numéro de contact (WhatsApp ou téléphone)</label>
        <input v-model="form.telephone_contact" class="p-input" placeholder="+237 6XX XXX XXX" type="tel" />
      </div>
      <div class="field">
        <label class="p-label">Décris ta demande</label>
        <textarea v-model="form.contenu" class="p-input" rows="5" placeholder="Ex : Mon nom est mal orthographié, je souhaite corriger ma taille, supprimer ma photo…" />
      </div>
      <div style="font-size:12px;color:var(--p-sub);margin-bottom:16px;padding:10px;border-radius:6px;background:var(--p-bg2)">
        Tes informations seront traitées par l'équipe PIVOT sous 7 jours ouvrables. Conforme loi n°2010/012.
      </div>
      <button class="p-btn-red" style="width:100%;justify-content:center" :disabled="!form.contenu || saving" @click="submit">
        <span v-if="saving" class="spinner-sm" />
        {{ saving ? 'Envoi…' : 'Envoyer la demande' }}
      </button>
    </div>
    <div v-else class="p-card" style="padding:32px;text-align:center">
      <span style="font-size:3rem">✅</span>
      <h2 class="font-display" style="font-size:1.4rem;font-weight:700;margin:12px 0 8px">Demande envoyée</h2>
      <p class="text-sub">Notre équipe te contactera sous 7 jours ouvrables.</p>
      <RouterLink to="/" class="p-btn-ghost p-btn-sm" style="margin-top:16px;display:inline-flex">Retour à l'accueil</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const route = useRoute()
const sent = ref(false)
const saving = ref(false)
const form = ref({ type_demande:'correction', telephone_contact:'', contenu:'' })
const joueur_id = route.query.joueur_id as string | undefined

async function submit() {
  if (!form.value.contenu.trim()) return
  saving.value = true
  await supabase.from('crowdsourcing_queue').insert({ ...form.value, joueur_id: joueur_id ?? null })
  sent.value = true; saving.value = false
}
</script>

<style scoped>
.field { display:flex;flex-direction:column;gap:6px;margin-bottom:16px; }
textarea.p-input { resize:vertical;min-height:100px; }
.spinner-sm { display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin 600ms linear infinite;margin-right:6px; }
@keyframes spin { to{transform:rotate(360deg)} }
</style>
