<template>
  <!-- Already onboarded — read-only summary -->
  <div v-if="auth.user?.profile?.onboardingCompleted" class="max-w-2xl space-y-6 p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Onboarding Answers</h1>
        <p class="text-sm text-muted-foreground mt-0.5">Submitted and locked.</p>
      </div>
      <router-link
        to="/candidate/profile"
        class="h-9 px-4 rounded-full text-sm font-medium bg-secondary text-foreground flex items-center gap-1.5 hover:bg-secondary/80"
      >
        <span class="mdi mdi-arrow-left text-sm" /> Back
      </router-link>
    </div>
    <div class="rounded-xl border border-border bg-card px-6 py-5 text-sm text-muted-foreground">
      Onboarding completed. Edit your details from your profile page.
    </div>
  </div>

  <!-- Loading config -->
  <div v-else-if="loadingConfig" class="min-h-screen flex items-center justify-center">
    <span class="mdi mdi-loading mdi-spin text-2xl text-primary" />
  </div>

  <!-- Dynamic onboarding form rendered from backend config -->
  <div v-else-if="config" class="min-h-screen bg-background">
    <div class="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
      <div class="container mx-auto px-6 h-14 flex items-center justify-between">
        <img src="../../assets/logo.png" alt="Arbeitly" class="h-7" />
        <span class="text-xs text-muted-foreground">Step {{ step + 1 }} of {{ config.steps.length }}</span>
      </div>
    </div>

    <div class="container mx-auto px-6 py-10 max-w-2xl">
      <!-- Stepper -->
      <div class="mb-10 flex items-center">
        <template v-for="(s, i) in config.steps" :key="s.key">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
            :class="
              step > i
                ? 'bg-primary text-primary-foreground'
                : step === i
                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                : 'bg-muted text-muted-foreground'
            "
          >
            <span v-if="step > i" class="mdi mdi-check" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div
            v-if="i < config.steps.length - 1"
            class="flex-1 h-px mx-2"
            :class="step > i ? 'bg-primary' : 'bg-border'"
          />
        </template>
      </div>

      <div class="mb-8">
        <h1 class="font-display text-3xl font-bold text-foreground">{{ currentStep.title }}</h1>
        <p v-if="currentStep.subtitle" class="mt-1 text-muted-foreground">{{ currentStep.subtitle }}</p>
      </div>

      <div
        v-if="errors.length"
        class="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      >
        <p class="font-semibold mb-1">Please fill in all required fields:</p>
        <ul class="list-disc list-inside space-y-0.5">
          <li v-for="e in errors" :key="e">{{ e }}</li>
        </ul>
      </div>

      <!-- Render each visible question on this step -->
      <div class="space-y-5">
        <div v-for="q in visibleQuestions" :key="q.key">
          <label class="text-sm text-foreground mb-1.5 block">
            {{ q.label }}
            <span v-if="q.required" class="text-destructive">*</span>
          </label>

          <!-- text -->
          <input
            v-if="q.type === 'text'"
            v-model="answers[q.key]"
            type="text"
            class="input-field"
            :placeholder="q.placeholder"
          />

          <!-- textarea -->
          <textarea
            v-else-if="q.type === 'textarea'"
            v-model="answers[q.key]"
            rows="3"
            class="input-field resize-none"
            :placeholder="q.placeholder"
          />

          <!-- number -->
          <input
            v-else-if="q.type === 'number'"
            v-model.number="answers[q.key]"
            type="number"
            class="input-field"
            :placeholder="q.placeholder"
          />

          <!-- select -->
          <select v-else-if="q.type === 'select'" v-model="answers[q.key]" class="input-field">
            <option value="">Select…</option>
            <option v-for="opt in normalizedOptions(q)" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <!-- radio -->
          <div v-else-if="q.type === 'radio'" class="space-y-2">
            <label
              v-for="opt in normalizedOptions(q)"
              :key="opt.value"
              class="flex items-center gap-2 text-sm text-foreground"
            >
              <input type="radio" :value="opt.value" v-model="answers[q.key]" class="accent-primary" />
              {{ opt.label }}
            </label>
          </div>

          <!-- checkboxes -->
          <div v-else-if="q.type === 'checkboxes'" class="flex flex-wrap gap-2">
            <label
              v-for="opt in normalizedOptions(q)"
              :key="opt.value"
              class="flex items-center gap-2 text-sm text-foreground border border-border rounded-full px-3 py-1.5 cursor-pointer hover:bg-secondary/40"
              :class="(answers[q.key] || []).includes(opt.value) ? 'bg-primary/10 border-primary/40' : ''"
            >
              <input
                type="checkbox"
                :value="opt.value"
                :checked="(answers[q.key] || []).includes(opt.value)"
                @change="toggleCheckbox(q.key, opt.value)"
                class="accent-primary"
              />
              {{ opt.label }}
            </label>
          </div>

          <!-- boolean -->
          <label v-else-if="q.type === 'boolean'" class="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" v-model="answers[q.key]" class="accent-primary" />
            <span>{{ q.placeholder || 'Yes' }}</span>
          </label>

          <!-- phone-intl — country code dropdown + phone number -->
          <div v-else-if="q.type === 'phone-intl'" class="flex gap-2">
            <select
              v-model="getPhone(q.key).countryCode"
              class="input-field shrink-0"
              style="width: 11rem"
            >
              <option v-for="c in COUNTRIES" :key="c.value" :value="c.value">
                {{ c.dial }} {{ c.label }}
              </option>
            </select>
            <input
              v-model="getPhone(q.key).number"
              type="tel"
              class="input-field"
              style="flex: 1 1 0%; min-width: 0"
              :placeholder="q.placeholder || '151 234 5678'"
            />
          </div>

          <!-- years-select — single dropdown -->
          <select v-else-if="q.type === 'years-select'" v-model="answers[q.key]" class="input-field">
            <option value="">Select…</option>
            <option v-for="opt in normalizedOptions(q)" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <!-- role-picker (single role from taxonomy) -->
          <template v-else-if="q.type === 'role-picker'">
            <select v-model="answers[q.key]" class="input-field">
              <option value="">Select a role…</option>
              <optgroup v-for="(roles, family) in rolesByFamily" :key="family" :label="prettyFamily(family)">
                <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
              </optgroup>
            </select>
            <input
              v-if="q.allowOther"
              v-model="answers[`${q.key}Other`]"
              type="text"
              class="input-field mt-2"
              placeholder="Or type your role if not listed…"
            />
          </template>

          <!-- role-multi -->
          <template v-else-if="q.type === 'role-multi'">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="r in taxonomy.roles"
                :key="r.id"
                type="button"
                @click="toggleId(q.key, r.id)"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors"
                :class="
                  (answers[q.key] || []).includes(r.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                "
              >
                {{ r.name }}
              </button>
            </div>
            <input
              v-if="q.allowOther"
              v-model="answers[`${q.key}Other`]"
              type="text"
              class="input-field mt-2"
              placeholder="Other roles, comma-separated…"
            />
          </template>

          <!-- skill-multi -->
          <template v-else-if="q.type === 'skill-multi'">
            <input
              v-model="skillSearch"
              type="text"
              class="input-field mb-2"
              placeholder="Search skills… (finance, marketing, tech, languages, anything)"
            />
            <div class="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              <button
                v-for="s in filteredSkills"
                :key="s.id"
                type="button"
                @click="toggleId(q.key, s.id)"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors"
                :class="
                  (answers[q.key] || []).includes(s.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                "
              >
                {{ s.name }}
              </button>
            </div>
            <input
              v-if="q.allowOther"
              v-model="answers[`${q.key}Other`]"
              type="text"
              class="input-field mt-2"
              placeholder="Other skills not in the list, comma-separated…"
            />
          </template>

          <!-- industry-multi -->
          <template v-else-if="q.type === 'industry-multi'">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="ind in taxonomy.industries"
                :key="ind.id"
                type="button"
                @click="toggleId(q.key, ind.id)"
                class="text-xs px-3 py-1.5 rounded-full border transition-colors"
                :class="
                  (answers[q.key] || []).includes(ind.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                "
              >
                {{ ind.name }}
              </button>
            </div>
            <input
              v-if="q.allowOther"
              v-model="answers[`${q.key}Other`]"
              type="text"
              class="input-field mt-2"
              placeholder="Other industries, comma-separated…"
            />
          </template>

          <!-- salary-range -->
          <div v-else-if="q.type === 'salary-range'" class="grid grid-cols-3 gap-3">
            <input
              v-model.number="getSalary(q.key).min"
              type="number"
              class="input-field"
              placeholder="Min"
            />
            <input
              v-model.number="getSalary(q.key).max"
              type="number"
              class="input-field"
              placeholder="Max"
            />
            <select v-model="getSalary(q.key).currency" class="input-field">
              <option value="EUR">EUR €</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP £</option>
              <option value="CHF">CHF</option>
              <option value="AED">AED</option>
            </select>
          </div>

          <!-- languages -->
          <div v-else-if="q.type === 'languages'" class="space-y-2">
            <div
              v-for="(lang, idx) in getLangs(q.key)"
              :key="idx"
              class="flex gap-2 items-center"
            >
              <input
                v-model="lang.language"
                type="text"
                class="input-field"
                style="flex: 3 1 0%; min-width: 0"
                placeholder="Language (e.g. German)"
              />
              <select v-model="lang.level" class="input-field shrink-0" style="width: 7rem">
                <option value="">Level</option>
                <option v-for="l in ['A1','A2','B1','B2','C1','C2','Native']" :key="l" :value="l">{{ l }}</option>
              </select>
              <button
                type="button"
                @click="removeLang(q.key, idx)"
                class="text-muted-foreground hover:text-destructive shrink-0"
              >
                <span class="mdi mdi-close" />
              </button>
            </div>
            <button
              type="button"
              @click="addLang(q.key)"
              class="text-xs text-primary hover:underline"
            >
              + Add language
            </button>
          </div>

          <!-- country-city (country dropdown + city text) -->
          <div v-else-if="q.type === 'country-city'" class="grid grid-cols-2 gap-3">
            <select v-model="getLoc(q.key).country" class="input-field">
              <option value="">Country…</option>
              <option v-for="c in COUNTRIES" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
            <input
              v-model="getLoc(q.key).city"
              type="text"
              class="input-field"
              placeholder="City"
            />
          </div>

          <!-- city-country (legacy: text + text) -->
          <div v-else-if="q.type === 'city-country'" class="grid grid-cols-2 gap-3">
            <input
              v-model="getLoc(q.key).city"
              type="text"
              class="input-field"
              placeholder="City"
            />
            <input
              v-model="getLoc(q.key).country"
              type="text"
              class="input-field"
              placeholder="Country"
            />
          </div>

          <!-- tags — chip input, press Enter to add -->
          <div v-else-if="q.type === 'tags'">
            <div class="flex flex-wrap gap-2 mb-2" v-if="(answers[q.key] || []).length">
              <span
                v-for="(tag, idx) in answers[q.key]"
                :key="idx"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/30"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(q.key, idx)"
                  class="hover:text-destructive"
                >
                  <span class="mdi mdi-close text-xs" />
                </button>
              </span>
            </div>
            <input
              type="text"
              class="input-field"
              :placeholder="q.placeholder || 'Type and press Enter to add'"
              :value="tagDraft[q.key] || ''"
              @input="tagDraft[q.key] = ($event.target as HTMLInputElement).value"
              @keydown.enter.prevent="addTag(q.key)"
              @blur="addTag(q.key)"
            />
          </div>

          <!-- unknown type fallback -->
          <div v-else class="text-xs text-destructive">Unknown question type: {{ q.type }}</div>

          <p v-if="q.help" class="text-xs text-muted-foreground mt-1">{{ q.help }}</p>
        </div>
      </div>

      <!-- Nav -->
      <div class="flex justify-between mt-10">
        <button
          v-if="step > 0"
          @click="back"
          class="h-10 px-5 rounded-full text-sm font-medium bg-secondary text-foreground flex items-center gap-1.5 hover:bg-secondary/80"
        >
          <span class="mdi mdi-chevron-left" /> Back
        </button>
        <div v-else />
        <button
          v-if="step < config.steps.length - 1"
          @click="next"
          class="h-10 px-6 rounded-full text-sm font-medium bg-primary text-primary-foreground flex items-center gap-1.5 hover:opacity-90"
        >
          Continue <span class="mdi mdi-chevron-right" />
        </button>
        <button
          v-else
          @click="submit"
          :disabled="saving"
          class="h-10 px-6 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {{ saving ? 'Saving…' : 'Complete onboarding' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';

interface Question {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: any;
  allowOther?: boolean;
  visibleIf?: { key: string; equals?: any; notEquals?: any; in?: any[] };
}

// ── Static lists used by phone-intl and country-city ──────────────────
const COUNTRIES: { value: string; label: string; dial: string }[] = [
  { value: 'DE', label: 'Germany', dial: '+49' },
  { value: 'AT', label: 'Austria', dial: '+43' },
  { value: 'CH', label: 'Switzerland', dial: '+41' },
  { value: 'FR', label: 'France', dial: '+33' },
  { value: 'NL', label: 'Netherlands', dial: '+31' },
  { value: 'BE', label: 'Belgium', dial: '+32' },
  { value: 'LU', label: 'Luxembourg', dial: '+352' },
  { value: 'IT', label: 'Italy', dial: '+39' },
  { value: 'ES', label: 'Spain', dial: '+34' },
  { value: 'PT', label: 'Portugal', dial: '+351' },
  { value: 'IE', label: 'Ireland', dial: '+353' },
  { value: 'GB', label: 'United Kingdom', dial: '+44' },
  { value: 'DK', label: 'Denmark', dial: '+45' },
  { value: 'SE', label: 'Sweden', dial: '+46' },
  { value: 'NO', label: 'Norway', dial: '+47' },
  { value: 'FI', label: 'Finland', dial: '+358' },
  { value: 'PL', label: 'Poland', dial: '+48' },
  { value: 'CZ', label: 'Czechia', dial: '+420' },
  { value: 'SK', label: 'Slovakia', dial: '+421' },
  { value: 'HU', label: 'Hungary', dial: '+36' },
  { value: 'RO', label: 'Romania', dial: '+40' },
  { value: 'BG', label: 'Bulgaria', dial: '+359' },
  { value: 'GR', label: 'Greece', dial: '+30' },
  { value: 'HR', label: 'Croatia', dial: '+385' },
  { value: 'SI', label: 'Slovenia', dial: '+386' },
  { value: 'EE', label: 'Estonia', dial: '+372' },
  { value: 'LV', label: 'Latvia', dial: '+371' },
  { value: 'LT', label: 'Lithuania', dial: '+370' },
  { value: 'US', label: 'United States', dial: '+1' },
  { value: 'CA', label: 'Canada', dial: '+1' },
  { value: 'MX', label: 'Mexico', dial: '+52' },
  { value: 'BR', label: 'Brazil', dial: '+55' },
  { value: 'AR', label: 'Argentina', dial: '+54' },
  { value: 'CL', label: 'Chile', dial: '+56' },
  { value: 'CO', label: 'Colombia', dial: '+57' },
  { value: 'AU', label: 'Australia', dial: '+61' },
  { value: 'NZ', label: 'New Zealand', dial: '+64' },
  { value: 'JP', label: 'Japan', dial: '+81' },
  { value: 'KR', label: 'South Korea', dial: '+82' },
  { value: 'CN', label: 'China', dial: '+86' },
  { value: 'HK', label: 'Hong Kong', dial: '+852' },
  { value: 'SG', label: 'Singapore', dial: '+65' },
  { value: 'MY', label: 'Malaysia', dial: '+60' },
  { value: 'TH', label: 'Thailand', dial: '+66' },
  { value: 'PH', label: 'Philippines', dial: '+63' },
  { value: 'ID', label: 'Indonesia', dial: '+62' },
  { value: 'VN', label: 'Vietnam', dial: '+84' },
  { value: 'IN', label: 'India', dial: '+91' },
  { value: 'PK', label: 'Pakistan', dial: '+92' },
  { value: 'BD', label: 'Bangladesh', dial: '+880' },
  { value: 'AE', label: 'United Arab Emirates', dial: '+971' },
  { value: 'SA', label: 'Saudi Arabia', dial: '+966' },
  { value: 'QA', label: 'Qatar', dial: '+974' },
  { value: 'KW', label: 'Kuwait', dial: '+965' },
  { value: 'BH', label: 'Bahrain', dial: '+973' },
  { value: 'OM', label: 'Oman', dial: '+968' },
  { value: 'IL', label: 'Israel', dial: '+972' },
  { value: 'TR', label: 'Turkey', dial: '+90' },
  { value: 'EG', label: 'Egypt', dial: '+20' },
  { value: 'MA', label: 'Morocco', dial: '+212' },
  { value: 'TN', label: 'Tunisia', dial: '+216' },
  { value: 'DZ', label: 'Algeria', dial: '+213' },
  { value: 'NG', label: 'Nigeria', dial: '+234' },
  { value: 'KE', label: 'Kenya', dial: '+254' },
  { value: 'ZA', label: 'South Africa', dial: '+27' },
  { value: 'UA', label: 'Ukraine', dial: '+380' },
  { value: 'RU', label: 'Russia', dial: '+7' },
  { value: 'OTHER', label: 'Other', dial: '+' },
];
interface Step { key: string; title: string; subtitle?: string; questions: Question[] }
interface Config { steps: Step[] }
interface TaxonomyItem { id: string; name: string; family?: string }

const auth = useAuthStore();
const router = useRouter();

const loadingConfig = ref(true);
const config = ref<Config | null>(null);
const taxonomy = reactive<{ roles: TaxonomyItem[]; industries: TaxonomyItem[]; skills: TaxonomyItem[] }>({
  roles: [],
  industries: [],
  skills: [],
});

const step = ref(0);
const errors = ref<string[]>([]);
const saving = ref(false);
const answers = reactive<Record<string, any>>({});
const skillSearch = ref('');

const currentStep = computed(() => config.value!.steps[step.value]);

const visibleQuestions = computed(() => {
  return currentStep.value.questions.filter((q) => {
    if (!q.visibleIf) return true;
    const cur = answers[q.visibleIf.key];
    if ('equals' in q.visibleIf && q.visibleIf.equals !== undefined) return cur === q.visibleIf.equals;
    if ('notEquals' in q.visibleIf && q.visibleIf.notEquals !== undefined) return cur !== q.visibleIf.notEquals;
    if (Array.isArray(q.visibleIf.in)) return q.visibleIf.in.includes(cur);
    return true;
  });
});

const rolesByFamily = computed(() => {
  const out: Record<string, TaxonomyItem[]> = {};
  for (const r of taxonomy.roles) {
    const fam = r.family || 'other';
    if (!out[fam]) out[fam] = [];
    out[fam].push(r);
  }
  return out;
});

const filteredSkills = computed(() => {
  const sorted = [...taxonomy.skills].sort((a, b) => a.name.localeCompare(b.name));
  const q = skillSearch.value.trim().toLowerCase();
  if (!q) return sorted.slice(0, 80);
  return sorted.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 80);
});

function prettyFamily(f: string) {
  return f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, ' ');
}

function normalizedOptions(q: Question): { value: string; label: string }[] {
  if (!Array.isArray(q.options)) return [];
  return q.options.map((o: any) =>
    typeof o === 'string' ? { value: o, label: o } : { value: o.value, label: o.label },
  );
}

function toggleCheckbox(key: string, value: string) {
  const arr = (answers[key] || []) as string[];
  const i = arr.indexOf(value);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(value);
  answers[key] = [...arr];
}

function toggleId(key: string, id: string) {
  const arr = (answers[key] || []) as string[];
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(id);
  answers[key] = [...arr];
}

function getSalary(key: string) {
  if (!answers[key]) answers[key] = { min: null, max: null, currency: 'EUR' };
  return answers[key];
}
function getLangs(key: string) {
  if (!Array.isArray(answers[key])) answers[key] = [];
  return answers[key];
}
function addLang(key: string) {
  getLangs(key).push({ language: '', level: '' });
}
function removeLang(key: string, idx: number) {
  getLangs(key).splice(idx, 1);
}
function getLoc(key: string) {
  if (!answers[key]) answers[key] = { city: '', country: '' };
  return answers[key];
}
function getPhone(key: string) {
  if (!answers[key] || typeof answers[key] !== 'object') {
    answers[key] = { countryCode: 'DE', number: '' };
  }
  return answers[key];
}

const tagDraft = reactive<Record<string, string>>({});
function addTag(key: string) {
  const v = (tagDraft[key] || '').trim();
  if (!v) return;
  if (!Array.isArray(answers[key])) answers[key] = [];
  if (!answers[key].includes(v)) answers[key].push(v);
  tagDraft[key] = '';
}
function removeTag(key: string, idx: number) {
  if (Array.isArray(answers[key])) answers[key].splice(idx, 1);
}

function initAnswers() {
  if (!config.value) return;
  for (const s of config.value.steps) {
    for (const q of s.questions) {
      if (answers[q.key] !== undefined) continue;
      switch (q.type) {
        case 'checkboxes':
        case 'role-multi':
        case 'skill-multi':
        case 'industry-multi':
          answers[q.key] = [];
          break;
        case 'boolean':
          answers[q.key] = false;
          break;
        case 'salary-range':
          answers[q.key] = { min: null, max: null, currency: 'EUR' };
          break;
        case 'languages':
          answers[q.key] = [];
          break;
        case 'city-country':
        case 'country-city':
          answers[q.key] = { city: '', country: '' };
          break;
        case 'phone-intl':
          answers[q.key] = { countryCode: 'DE', number: '' };
          break;
        case 'tags':
          answers[q.key] = [];
          break;
        case 'years-select':
          answers[q.key] = '';
          break;
        case 'number':
          answers[q.key] = null;
          break;
        default:
          answers[q.key] = '';
      }
      // `allowOther` companion field lives in onboardingData as `<key>Other`
      if (q.allowOther && answers[`${q.key}Other`] === undefined) {
        answers[`${q.key}Other`] = '';
      }
    }
  }
}

function validateStep(): boolean {
  const missing: string[] = [];
  for (const q of visibleQuestions.value) {
    if (!q.required) continue;
    const v = answers[q.key];
    let empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (q.type === 'country-city' || q.type === 'city-country') {
      empty = !v || !v.country || !v.city;
    } else if (q.type === 'phone-intl') {
      empty = !v || !v.number;
    }
    if (empty) missing.push(q.label);
  }
  errors.value = missing;
  return missing.length === 0;
}

function next() {
  if (!validateStep()) return;
  errors.value = [];
  step.value++;
  window.scrollTo(0, 0);
}
function back() {
  errors.value = [];
  step.value--;
  window.scrollTo(0, 0);
}

async function submit() {
  if (!validateStep()) return;
  saving.value = true;
  try {
    await api.post('/onboarding', { ...answers });
    await auth.fetchMe();
    router.push('/candidate/applications');
  } catch (e: any) {
    errors.value = [e?.response?.data?.error || 'Failed to save'];
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    const [cfgRes, rolesRes, indRes, skillsRes] = await Promise.all([
      api.get('/taxonomy/onboarding-config'),
      api.get('/taxonomy/roles'),
      api.get('/taxonomy/industries'),
      api.get('/taxonomy/skills'),
    ]);
    config.value = cfgRes.data.data;
    taxonomy.roles = rolesRes.data.data;
    taxonomy.industries = indRes.data.data;
    taxonomy.skills = skillsRes.data.data;
    initAnswers();
  } catch (e) {
    console.error('Failed to load onboarding config', e);
  } finally {
    loadingConfig.value = false;
  }
});
</script>
