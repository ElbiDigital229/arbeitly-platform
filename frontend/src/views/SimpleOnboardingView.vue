<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-6">
    <div class="w-full max-w-md animate-fade-in">
      <router-link to="/" class="flex items-center gap-2 mb-8">
        <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
      </router-link>

      <p class="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Step 2 of 2 — Quick Setup</p>
      <h1 class="font-display text-2xl font-bold text-foreground mb-1">Tell us a little about yourself</h1>
      <p class="text-sm text-muted-foreground mb-8">Three quick questions to personalise your experience.</p>

      <p v-if="error" class="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
        Please answer all three questions to continue.
      </p>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">What industry are you in?</label>
          <select v-model="form.industry" class="input-field">
            <option value="" disabled>Select your industry</option>
            <option v-for="i in INDUSTRIES" :key="i" :value="i">{{ i }}</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Which country are you looking to apply in?</label>
          <select v-model="form.targetCountry" class="input-field">
            <option value="" disabled>Select a country</option>
            <option v-for="c in COUNTRIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">How did you hear about us?</label>
          <select v-model="form.howHeard" class="input-field">
            <option value="" disabled>Select a source</option>
            <option v-for="s in SOURCES" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>

        <button type="submit" :disabled="submitting" class="w-full h-10 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50 mt-2">
          {{ submitting ? 'Saving...' : 'Go to My Dashboard' }}
        </button>
      </form>

      <p class="mt-4 text-center">
        <button @click="$router.push('/candidate/applications')" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Skip for now →
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const error = ref(false);
const submitting = ref(false);

const form = ref({ industry: '', targetCountry: '', howHeard: '' });

const INDUSTRIES = [
  'Technology / Software', 'Finance / Banking', 'Healthcare / Medical', 'Engineering',
  'Marketing / Sales', 'Education', 'Legal', 'Consulting',
  'Manufacturing', 'Retail / E-Commerce', 'Media / Creative', 'Other',
];

const COUNTRIES = [
  'Germany', 'Austria', 'Switzerland', 'Netherlands', 'United Kingdom',
  'France', 'Spain', 'United States', 'Canada', 'Australia', 'Other',
];

const SOURCES = [
  'Google / Search Engine', 'LinkedIn', 'Instagram', 'Facebook',
  'Friend or Colleague', 'Job Forum / Community', 'YouTube', 'ChatGPT',
  'Other AI', 'Other',
];

async function handleSubmit() {
  if (!form.value.industry || !form.value.targetCountry || !form.value.howHeard) {
    error.value = true;
    return;
  }
  error.value = false;
  submitting.value = true;
  try {
    await axios.put('/api/profile', {
      marketingData: {
        industry: form.value.industry,
        targetCountry: form.value.targetCountry,
        howHeard: form.value.howHeard,
      },
    });
  } catch { /* continue anyway */ }
  submitting.value = false;
  router.push('/candidate/applications');
}
</script>
