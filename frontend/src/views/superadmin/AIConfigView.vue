<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">AI Configuration</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Manage LLM provider, language rules, and AI prompts.</p>
    </div>

    <!-- Provider -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 class="font-display text-base font-semibold text-foreground">LLM Provider</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Provider</label>
          <select v-model="provider" class="input-field">
            <option value="claude">Claude (Anthropic)</option>
            <option value="gemini">Gemini (Google)</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">API Key</label>
          <div class="relative">
            <input v-model="apiKey" :type="showKey ? 'text' : 'password'" class="input-field pr-10" placeholder="sk-ant-..." />
            <button @click="showKey = !showKey" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <span class="mdi text-sm" :class="showKey ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Language rules -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 class="font-display text-base font-semibold text-foreground">Language Routing Rules</h3>
      <div v-for="rule in languageRules" :key="rule.label" class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-foreground">{{ rule.label }}</p>
          <p class="text-xs text-muted-foreground">{{ rule.description }}</p>
        </div>
        <select v-model="rule.value" class="input-field w-40">
          <option value="en">English only</option>
          <option value="de">German only</option>
          <option value="de-preferred">German preferred</option>
        </select>
      </div>
    </div>

    <!-- Prompts -->
    <div v-for="prompt in prompts" :key="prompt.id" class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 class="font-display text-base font-semibold text-foreground">{{ prompt.title }}</h3>
          <p class="text-xs text-muted-foreground">{{ prompt.description }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">v{{ prompt.version }}</span>
          <button @click="prompt.editing = !prompt.editing" class="h-7 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">
            {{ prompt.editing ? 'Cancel' : 'Edit' }}
          </button>
        </div>
      </div>
      <div class="px-6 py-4">
        <textarea v-if="prompt.editing" v-model="prompt.text" rows="8" class="input-field w-full font-mono text-xs resize-none" />
        <pre v-else class="text-xs text-muted-foreground whitespace-pre-wrap font-mono line-clamp-4">{{ prompt.text }}</pre>
        <div v-if="prompt.editing" class="flex justify-end mt-3">
          <button @click="savePrompt(prompt)" class="h-8 px-4 rounded-lg text-xs font-medium bg-primary text-primary-foreground">Save Prompt</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const provider = ref('claude');
const apiKey = ref('');
const showKey = ref(false);

const languageRules = ref([
  { label: 'English-only CVs', description: 'When candidate CV is English only', value: 'en' },
  { label: 'German-only CVs', description: 'When candidate CV is German only', value: 'de' },
  { label: 'Both languages', description: 'When CV has both languages', value: 'de-preferred' },
]);

const prompts = ref([
  { id: 'cv', title: 'CV Enhancement Prompt', description: 'Used when optimizing candidate CVs', version: 1, text: 'You are a professional CV writer...', editing: false },
  { id: 'job', title: 'Job Tailoring Prompt', description: 'Used when tailoring CV to a specific job', version: 1, text: 'Tailor this CV for the following job posting...', editing: false },
  { id: 'cl', title: 'Cover Letter Prompt', description: 'Used when generating cover letters', version: 1, text: 'Write a professional cover letter...', editing: false },
  { id: 'match', title: 'Job Matching Prompt', description: 'Used to score job-candidate fit', version: 1, text: 'Rate how well this candidate matches the job...', editing: false },
]);

function savePrompt(p: any) { p.version++; p.editing = false; }
</script>
