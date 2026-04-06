<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">AI Configuration</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Manage AI prompts used for CV/CL enhancement and job matching.</p>
      </div>
      <button @click="openAdd" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Prompt
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <!-- Prompt cards grouped by type -->
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

    <!-- Add/Edit dialog -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">{{ editingId ? 'Edit Prompt' : 'Add Prompt' }}</h3>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Name</label>
            <input v-model="form.name" class="input-field" placeholder="e.g. Professional CV Enhancer" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Type</label>
            <select v-model="form.type" class="input-field" :disabled="!!editingId">
              <option value="CV_ENHANCEMENT">CV Enhancement</option>
              <option value="CL_ENHANCEMENT">Cover Letter Enhancement</option>
              <option value="CL_GENERATION">Cover Letter Generation</option>
              <option value="JOB_MATCHING">Job Matching / Relevance</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Prompt</label>
            <textarea v-model="form.prompt" rows="10" class="input-field w-full font-mono text-xs resize-none" placeholder="Enter the system prompt..." />
          </div>
          <div class="flex items-center gap-2">
            <button @click="form.isActive = !form.isActive" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="form.isActive ? 'bg-primary' : 'bg-secondary'">
              <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.isActive ? 'translate-x-4' : 'translate-x-0.5'" />
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
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();

interface Prompt {
  id: string; type: string; name: string; prompt: string;
  isActive: boolean; version: number;
}

const prompts = ref<Prompt[]>([]);
const loading = ref(true);
const showDialog = ref(false);
const editingId = ref<string | null>(null);
const formError = ref('');
const saving = ref(false);

const emptyForm = () => ({ name: '', type: 'CV_ENHANCEMENT', prompt: '', isActive: true });
const form = ref(emptyForm());

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

onMounted(fetchPrompts);

function openAdd() { editingId.value = null; form.value = emptyForm(); formError.value = ''; showDialog.value = true; }

function editPrompt(p: Prompt) {
  editingId.value = p.id;
  form.value = { name: p.name, type: p.type, prompt: p.prompt, isActive: p.isActive };
  formError.value = '';
  showDialog.value = true;
}

async function savePrompt() {
  formError.value = '';
  saving.value = true;
  try {
    if (editingId.value) {
      await api.patch(`/admin/prompts/${editingId.value}`, form.value, { headers: store.getAuthHeaders() });
    } else {
      await api.post('/admin/prompts', form.value, { headers: store.getAuthHeaders() });
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
