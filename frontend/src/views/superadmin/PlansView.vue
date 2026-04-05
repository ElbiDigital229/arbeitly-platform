<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Pricing Plans</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Manage subscription plans and features.</p>
      </div>
      <button @click="openAdd" :disabled="activePlanCount >= 5" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
        <span class="mdi mdi-plus" /> Add Plan
      </button>
    </div>

    <p v-if="activePlanCount >= 5" class="text-xs text-yellow-500">Maximum 5 active plans reached.</p>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="plan in plans" :key="plan.id" class="rounded-2xl border p-6 flex flex-col" :class="[plan.isPopular ? 'border-primary shadow-xl glow-accent' : 'border-border', !plan.isActive ? 'opacity-50' : '']">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display text-lg font-bold text-foreground uppercase tracking-wide">{{ plan.name }}</h3>
          <span v-if="plan.isPopular" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">Popular</span>
          <span v-if="!plan.isActive" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">Inactive</span>
        </div>
        <div class="mb-4">
          <span class="font-display text-3xl font-bold text-foreground">&euro;{{ plan.price }}</span>
          <p class="text-xs text-muted-foreground mt-1">one time payment</p>
          <p class="text-xs text-muted-foreground">{{ plan.applicationLimit }} applications</p>
          <p v-if="plan._count?.candidates" class="text-xs text-primary mt-1">{{ plan._count.candidates }} candidate{{ plan._count.candidates !== 1 ? 's' : '' }}</p>
        </div>
        <ul class="space-y-2 flex-1 mb-4">
          <li v-for="(f, i) in plan.features" :key="i" class="flex items-start gap-2 text-sm">
            <span class="mdi mt-0.5 shrink-0" :class="f.included ? 'mdi-check text-primary' : 'mdi-close text-muted-foreground/50'" />
            <span :class="f.included ? 'text-muted-foreground' : 'text-muted-foreground/50'">{{ f.text }}</span>
          </li>
        </ul>
        <div class="flex items-center gap-2 pt-3 border-t border-border">
          <button @click="editPlan(plan)" class="flex-1 h-8 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">Edit</button>
          <button @click="toggleActive(plan)" class="h-8 px-3 rounded-lg text-xs font-medium" :class="plan.isActive ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground'">
            {{ plan.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click="removePlan(plan.id)" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <span class="mdi mdi-trash-can-outline text-sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit dialog -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">{{ editingId ? 'Edit Plan' : 'Add Plan' }}</h3>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Name</label><input v-model="form.name" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Price (&euro;)</label><input v-model.number="form.price" type="number" min="0" step="1" class="input-field" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Application Limit</label><input v-model.number="form.applicationLimit" type="number" min="0" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Sort Order</label><input v-model.number="form.sortOrder" type="number" class="input-field" /></div>
          </div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Description</label><input v-model="form.description" class="input-field" /></div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <button @click="form.isPopular = !form.isPopular" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="form.isPopular ? 'bg-primary' : 'bg-secondary'">
                <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.isPopular ? 'translate-x-4' : 'translate-x-0.5'" />
              </button>
              <span class="text-sm text-foreground">Popular</span>
            </div>
            <div class="flex items-center gap-2">
              <button @click="form.isActive = !form.isActive" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="form.isActive ? 'bg-primary' : 'bg-secondary'">
                <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.isActive ? 'translate-x-4' : 'translate-x-0.5'" />
              </button>
              <span class="text-sm text-foreground">Active</span>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Features</label>
            <div v-for="(f, i) in form.features" :key="i" class="flex items-center gap-2 mb-1.5">
              <button @click="f.included = !f.included" class="h-5 w-5 rounded flex items-center justify-center shrink-0" :class="f.included ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'">
                <span class="mdi text-xs" :class="f.included ? 'mdi-check' : 'mdi-close'" />
              </button>
              <input v-model="f.text" class="input-field flex-1" placeholder="Feature description" />
              <button @click="form.features.splice(i, 1)" class="text-muted-foreground hover:text-destructive"><span class="mdi mdi-close text-xs" /></button>
            </div>
            <button @click="form.features.push({ text: '', included: true })" class="text-xs text-primary hover:underline mt-1">+ Add feature</button>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="showDialog = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="savePlan" :disabled="saving" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">{{ saving ? 'Saving...' : editingId ? 'Update' : 'Create' }}</button>
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

interface Feature { text: string; included: boolean; }
interface Plan {
  id: string; name: string; description: string | null; price: number; currency: string;
  applicationLimit: number; features: Feature[]; isActive: boolean; isPopular: boolean;
  sortOrder: number; _count?: { candidates: number };
}

const plans = ref<Plan[]>([]);
const loading = ref(true);
const showDialog = ref(false);
const editingId = ref<string | null>(null);
const formError = ref('');
const saving = ref(false);

const activePlanCount = computed(() => plans.value.filter(p => p.isActive).length);

const emptyForm = () => ({
  name: '', description: '', price: 0, applicationLimit: 0, sortOrder: 0,
  isPopular: false, isActive: true, features: [{ text: '', included: true }] as Feature[],
});
const form = ref(emptyForm());

async function fetchPlans() {
  loading.value = true;
  try {
    const { data } = await api.get('/admin/plans', { headers: store.getAuthHeaders() });
    plans.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
}

onMounted(fetchPlans);

function openAdd() { editingId.value = null; form.value = emptyForm(); formError.value = ''; showDialog.value = true; }

function editPlan(p: Plan) {
  editingId.value = p.id;
  form.value = {
    name: p.name, description: p.description || '', price: p.price,
    applicationLimit: p.applicationLimit, sortOrder: p.sortOrder,
    isPopular: p.isPopular, isActive: p.isActive,
    features: (p.features || []).map(f => ({ ...f })),
  };
  formError.value = '';
  showDialog.value = true;
}

async function savePlan() {
  formError.value = '';
  saving.value = true;
  try {
    const payload = {
      ...form.value,
      features: form.value.features.filter(f => f.text.trim()),
    };
    if (editingId.value) {
      await api.patch(`/admin/plans/${editingId.value}`, payload, { headers: store.getAuthHeaders() });
    } else {
      await api.post('/admin/plans', payload, { headers: store.getAuthHeaders() });
    }
    showDialog.value = false;
    await fetchPlans();
  } catch (e: any) {
    formError.value = e?.response?.data?.error || 'Failed to save plan.';
  } finally { saving.value = false; }
}

async function toggleActive(plan: Plan) {
  try {
    await api.patch(`/admin/plans/${plan.id}`, { isActive: !plan.isActive }, { headers: store.getAuthHeaders() });
    await fetchPlans();
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to update plan.'); }
}

async function removePlan(id: string) {
  if (!confirm('Delete this plan?')) return;
  try {
    await api.delete(`/admin/plans/${id}`, { headers: store.getAuthHeaders() });
    await fetchPlans();
  } catch (e: any) { alert(e?.response?.data?.error || 'Cannot delete plan.'); }
}
</script>
