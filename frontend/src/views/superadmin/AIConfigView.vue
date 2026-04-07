<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">AI Configuration</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Manage Anthropic API key, models, and the prompts used for CV/CL enhancement and job matching.</p>
      </div>
      <button v-if="activeTab === 'prompts'" @click="openAdd" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Prompt
      </button>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'"
      >
        <span class="mdi mr-1.5" :class="tab.icon" />{{ tab.label }}
      </button>
    </div>

    <!-- ── Models & API Key tab ── -->
    <template v-if="activeTab === 'models'">
      <div v-if="loadingSettings" class="flex items-center justify-center py-16 text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-2xl" />
      </div>
      <template v-else>
        <!-- API Key card -->
        <div class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-key-variant" /> Anthropic API Key
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">Used for all CV parsing, CV/CL enhancement, and job matching calls.</p>
          </div>
          <div class="px-6 py-4 space-y-3">
            <div v-if="settings.apiKeySet" class="flex items-center gap-2 text-xs">
              <span class="mdi mdi-check-circle text-green-400" />
              <span class="text-muted-foreground">Current key:</span>
              <code class="font-mono text-foreground bg-secondary/60 px-2 py-0.5 rounded">{{ settings.apiKey }}</code>
            </div>
            <div v-else class="flex items-center gap-2 text-xs">
              <span class="mdi mdi-alert-circle text-yellow-400" />
              <span class="text-muted-foreground">No key configured. AI features will fail until a key is set.</span>
            </div>

            <div>
              <label class="text-xs font-medium text-muted-foreground block mb-1.5">{{ settings.apiKeySet ? 'Replace key' : 'Set key' }}</label>
              <input
                v-model="form.apiKey"
                type="password"
                placeholder="sk-ant-api03-..."
                autocomplete="off"
                class="w-full h-10 rounded-lg bg-secondary border-none px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              <p class="text-[10px] text-muted-foreground mt-1">Leave blank to keep the current key.</p>
            </div>
          </div>
        </div>

        <!-- Models card -->
        <div class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-brain" /> Models
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">Choose which Claude model handles each workload. Changes apply within 30 seconds — no restart required.</p>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="text-xs font-medium text-muted-foreground block mb-1.5">Default model</label>
              <p class="text-[11px] text-muted-foreground/80 mb-2">Used for CV enhancement, cover letter generation, job matching.</p>
              <select v-model="form.model" class="w-full h-10 rounded-lg bg-secondary border-none px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary">
                <option v-for="m in MODEL_OPTIONS" :key="m.id" :value="m.id">{{ m.label }}</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-muted-foreground block mb-1.5">CV parse model</label>
              <p class="text-[11px] text-muted-foreground/80 mb-2">Used when extracting structured data from uploaded CVs. Haiku is much faster; Sonnet is more accurate on dense academic CVs.</p>
              <select v-model="form.cvParseModel" class="w-full h-10 rounded-lg bg-secondary border-none px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary">
                <option v-for="m in MODEL_OPTIONS" :key="m.id" :value="m.id">{{ m.label }}</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-medium text-muted-foreground block mb-1.5">Max output tokens</label>
              <input
                v-model.number="form.maxTokens"
                type="number"
                min="1024"
                max="64000"
                step="1024"
                class="w-full h-10 rounded-lg bg-secondary border-none px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary tabular-nums"
              />
            </div>
          </div>
        </div>

        <p v-if="settingsError" class="text-sm text-destructive">{{ settingsError }}</p>
        <p v-if="settingsSaved" class="text-sm text-green-400 flex items-center gap-1.5"><span class="mdi mdi-check-circle" /> Settings saved.</p>

        <div class="flex justify-end">
          <button
            @click="saveSettings"
            :disabled="savingSettings"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <span v-if="savingSettings" class="mdi mdi-loading mdi-spin" />
            {{ savingSettings ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </template>
    </template>

    <!-- ── Prompts tab ── -->
    <template v-else>
      <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-2xl" />
      </div>

      <template v-else>
        <div v-for="group in groupedPrompts" :key="group.type" class="space-y-3">
          <h2 class="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">{{ group.label }}</h2>
          <div v-for="prompt in group.items" :key="prompt.id" class="rounded-xl border border-border bg-card">
            <div class="px-6 py-4 border-b border-border flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="font-display text-base font-semibold text-foreground">{{ prompt.name }}</h3>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">v{{ prompt.version }}</span>
                <span v-if="prompt.isActive" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/15 text-primary">Active</span>
                <span v-else class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">Inactive</span>
              </div>
              <div class="flex items-center gap-2">
                <button @click="editPrompt(prompt)" class="h-7 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">Edit</button>
                <button @click="removePrompt(prompt.id)" class="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <span class="mdi mdi-trash-can-outline text-sm" />
                </button>
              </div>
            </div>
            <div class="px-6 py-4">
              <pre class="text-xs text-muted-foreground whitespace-pre-wrap font-mono line-clamp-4">{{ prompt.prompt }}</pre>
            </div>
          </div>
        </div>

        <div v-if="prompts.length === 0" class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <span class="mdi mdi-brain text-4xl opacity-20" />
          <p class="text-sm">No prompts configured yet. Add your first AI prompt.</p>
        </div>
      </template>
    </template>

    <!-- Add/Edit dialog -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">{{ editingId ? 'Edit Prompt' : 'Add Prompt' }}</h3>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Name</label>
            <input v-model="form2.name" class="input-field" placeholder="e.g. Professional CV Enhancer" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Type</label>
            <select v-model="form2.type" class="input-field" :disabled="!!editingId">
              <option value="CV_ENHANCEMENT">CV Enhancement</option>
              <option value="CL_ENHANCEMENT">Cover Letter Enhancement</option>
              <option value="CL_GENERATION">Cover Letter Generation</option>
              <option value="JOB_MATCHING">Job Matching / Relevance</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Prompt</label>
            <textarea v-model="form2.prompt" rows="10" class="input-field w-full font-mono text-xs resize-none" placeholder="Enter the system prompt..." />
          </div>
          <div class="flex items-center gap-2">
            <button @click="form2.isActive = !form2.isActive" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="form2.isActive ? 'bg-primary' : 'bg-secondary'">
              <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form2.isActive ? 'translate-x-4' : 'translate-x-0.5'" />
            </button>
            <span class="text-sm text-foreground">Active</span>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="showDialog = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="savePrompt" :disabled="saving" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ saving ? 'Saving...' : editingId ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();

type TabId = 'models' | 'prompts';
const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'models', label: 'Models & API Key', icon: 'mdi-brain' },
  { id: 'prompts', label: 'Prompts', icon: 'mdi-text-box-multiple-outline' },
];
const activeTab = ref<TabId>('models');

// ── Models & API Key ──
const MODEL_OPTIONS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — fastest, structured extraction sweet spot' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — balanced, more accurate on complex inputs' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 — slowest, highest reasoning quality' },
];

interface AiSettings {
  apiKey: string;
  apiKeySet: boolean;
  model: string;
  cvParseModel: string;
  maxTokens: number;
}

const settings = ref<AiSettings>({ apiKey: '', apiKeySet: false, model: '', cvParseModel: '', maxTokens: 16384 });
const form = ref({ apiKey: '', model: '', cvParseModel: '', maxTokens: 16384 });
const loadingSettings = ref(false);
const savingSettings = ref(false);
const settingsError = ref('');
const settingsSaved = ref(false);

async function fetchSettings() {
  loadingSettings.value = true;
  try {
    const { data } = await api.get('/admin/ai-settings', { headers: store.getAuthHeaders() });
    settings.value = data.data;
    form.value.apiKey = '';
    form.value.model = data.data.model;
    form.value.cvParseModel = data.data.cvParseModel;
    form.value.maxTokens = data.data.maxTokens;
  } catch (e: any) {
    settingsError.value = e?.response?.data?.error || 'Failed to load settings.';
  } finally { loadingSettings.value = false; }
}

async function saveSettings() {
  settingsError.value = '';
  settingsSaved.value = false;
  savingSettings.value = true;
  try {
    const payload: any = {
      model: form.value.model,
      cvParseModel: form.value.cvParseModel,
      maxTokens: form.value.maxTokens,
    };
    if (form.value.apiKey.trim()) payload.apiKey = form.value.apiKey.trim();
    const { data } = await api.put('/admin/ai-settings', payload, { headers: store.getAuthHeaders() });
    settings.value = data.data;
    form.value.apiKey = '';
    settingsSaved.value = true;
    setTimeout(() => { settingsSaved.value = false; }, 3000);
  } catch (e: any) {
    settingsError.value = e?.response?.data?.error || 'Failed to save settings.';
  } finally { savingSettings.value = false; }
}

watch(activeTab, (tab) => {
  if (tab === 'models' && !settings.value.model) fetchSettings();
  if (tab === 'prompts' && prompts.value.length === 0) fetchPrompts();
});

// ── Prompts ──
interface Prompt {
  id: string; type: string; name: string; prompt: string;
  isActive: boolean; version: number;
}

const prompts = ref<Prompt[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const editingId = ref<string | null>(null);
const formError = ref('');
const saving = ref(false);

const emptyForm = () => ({ name: '', type: 'CV_ENHANCEMENT', prompt: '', isActive: true });
const form2 = ref(emptyForm());

const typeLabels: Record<string, string> = {
  CV_ENHANCEMENT: 'CV Enhancement',
  CL_ENHANCEMENT: 'Cover Letter Enhancement',
  CL_GENERATION: 'Cover Letter Generation',
  JOB_MATCHING: 'Job Matching',
};

const groupedPrompts = computed(() => {
  const groups: { type: string; label: string; items: Prompt[] }[] = [];
  for (const type of Object.keys(typeLabels)) {
    const items = prompts.value.filter(p => p.type === type);
    if (items.length > 0) groups.push({ type, label: typeLabels[type], items });
  }
  return groups;
});

async function fetchPrompts() {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/prompts', { headers: store.getAuthHeaders() });
    prompts.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
}

onMounted(fetchSettings);

function openAdd() { editingId.value = null; form2.value = emptyForm(); formError.value = ''; showDialog.value = true; }

function editPrompt(p: Prompt) {
  editingId.value = p.id;
  form2.value = { name: p.name, type: p.type, prompt: p.prompt, isActive: p.isActive };
  formError.value = '';
  showDialog.value = true;
}

async function savePrompt() {
  formError.value = '';
  saving.value = true;
  try {
    if (editingId.value) {
      await api.patch(`/admin/prompts/${editingId.value}`, form2.value, { headers: store.getAuthHeaders() });
    } else {
      await api.post('/admin/prompts', form2.value, { headers: store.getAuthHeaders() });
    }
    showDialog.value = false;
    await fetchPrompts();
  } catch (e: any) {
    formError.value = e?.response?.data?.error || 'Failed to save prompt.';
  } finally { saving.value = false; }
}

async function removePrompt(id: string) {
  if (!confirm('Delete this prompt?')) return;
  try {
    await api.delete(`/admin/prompts/${id}`, { headers: store.getAuthHeaders() });
    await fetchPrompts();
  } catch (e: any) { alert(e?.response?.data?.error || 'Cannot delete prompt.'); }
}
</script>
