<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Pricing Plans</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Manage subscription plans and features.</p>
      </div>
      <button @click="openAdd" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Plan
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="plan in plans" :key="plan.id" class="rounded-2xl border p-6 flex flex-col" :class="[plan.popular ? 'border-primary shadow-xl glow-accent' : 'border-border', !plan.active ? 'opacity-50' : '']">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display text-lg font-bold text-foreground uppercase tracking-wide">{{ plan.name }}</h3>
          <span v-if="plan.popular" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">Popular</span>
          <span v-if="!plan.active" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-muted-foreground">Inactive</span>
        </div>
        <div class="mb-4">
          <span class="font-display text-3xl font-bold text-foreground">{{ plan.price }}</span>
          <span v-if="plan.priceSuffix" class="text-xs font-semibold text-primary ml-1">{{ plan.priceSuffix }}</span>
          <p class="text-xs text-muted-foreground mt-1">{{ plan.billing }}</p>
          <p v-if="plan.applicationLimit" class="text-xs text-muted-foreground">{{ plan.applicationLimit }} applications</p>
        </div>
        <ul class="space-y-2 flex-1 mb-4">
          <li v-for="(f, i) in plan.features" :key="i" class="flex items-start gap-2 text-sm">
            <span class="mdi mt-0.5 shrink-0" :class="f.included ? 'mdi-check text-primary' : 'mdi-close text-muted-foreground/50'" />
            <span :class="f.included ? 'text-muted-foreground' : 'text-muted-foreground/50'">{{ f.text }}</span>
          </li>
        </ul>
        <div class="flex items-center gap-2 pt-3 border-t border-border">
          <button @click="editPlan(plan)" class="flex-1 h-8 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">Edit</button>
          <button @click="plan.active = !plan.active" class="h-8 px-3 rounded-lg text-xs font-medium" :class="plan.active ? 'bg-secondary text-muted-foreground' : 'bg-primary text-primary-foreground'">
            {{ plan.active ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click="deletePlan(plan.id)" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <span class="mdi mdi-trash-can-outline text-sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit dialog -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">{{ editingId ? 'Edit Plan' : 'Add Plan' }}</h3>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Name</label><input v-model="form.name" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Price</label><input v-model="form.price" class="input-field" placeholder="€299" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Price Suffix</label><input v-model="form.priceSuffix" class="input-field" placeholder="+ 8.5% SUCCESS FEE" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Billing</label><input v-model="form.billing" class="input-field" placeholder="one time payment" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Application Limit</label><input v-model.number="form.applicationLimit" type="number" class="input-field" /></div>
            <div class="flex items-center gap-2 pt-6">
              <button @click="form.popular = !form.popular" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="form.popular ? 'bg-primary' : 'bg-secondary'">
                <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="form.popular ? 'translate-x-4' : 'translate-x-0.5'" />
              </button>
              <span class="text-sm text-foreground">Popular</span>
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
          <button @click="savePlan" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">{{ editingId ? 'Update' : 'Create' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Feature { text: string; included: boolean; }
interface Plan { id: string; name: string; price: string; priceSuffix: string; billing: string; applicationLimit: number; popular: boolean; active: boolean; features: Feature[]; }

const plans = ref<Plan[]>([
  { id: '1', name: 'Free', price: '€0', priceSuffix: '', billing: 'forever free', applicationLimit: 20, popular: false, active: true, features: [{ text: 'Job application tracker', included: true }, { text: 'Up to 20 applications', included: true }, { text: 'Basic profile', included: true }, { text: 'Human Assistant', included: false }] },
  { id: '2', name: 'Basic', price: '€299', priceSuffix: '', billing: 'one time payment', applicationLimit: 200, popular: false, active: true, features: [{ text: '200 Job applications', included: true }, { text: 'Expert Resume Review', included: true }, { text: '1 Human Assistant', included: true }, { text: 'LinkedIn Makeover', included: false }] },
  { id: '3', name: 'Premium', price: '€499', priceSuffix: '', billing: 'one time payment', applicationLimit: 400, popular: true, active: true, features: [{ text: '400 Job applications', included: true }, { text: 'Expert Resume Review', included: true }, { text: '1 Human Assistant', included: true }, { text: 'LinkedIn Makeover', included: false }] },
  { id: '4', name: 'Ultimate', price: '€499', priceSuffix: '+ 8.5% SUCCESS FEE', billing: 'one time payment', applicationLimit: 0, popular: false, active: true, features: [{ text: 'Tailored Job Applications', included: true }, { text: 'Custom Resume per application', included: true }, { text: '1 Human Assistant', included: true }, { text: 'LinkedIn Makeover', included: true }] },
]);

const showDialog = ref(false);
const editingId = ref<string | null>(null);
const emptyForm = () => ({ name: '', price: '', priceSuffix: '', billing: 'one time payment', applicationLimit: 0, popular: false, features: [{ text: '', included: true }] as Feature[] });
const form = ref(emptyForm());

function openAdd() { editingId.value = null; form.value = emptyForm(); showDialog.value = true; }
function editPlan(p: Plan) { editingId.value = p.id; form.value = { name: p.name, price: p.price, priceSuffix: p.priceSuffix, billing: p.billing, applicationLimit: p.applicationLimit, popular: p.popular, features: p.features.map(f => ({ ...f })) }; showDialog.value = true; }

function savePlan() {
  if (editingId.value) {
    const p = plans.value.find(p => p.id === editingId.value);
    if (p) Object.assign(p, form.value);
  } else {
    plans.value.push({ ...form.value, id: crypto.randomUUID(), active: true });
  }
  showDialog.value = false;
}

function deletePlan(id: string) { plans.value = plans.value.filter(p => p.id !== id); }
</script>
