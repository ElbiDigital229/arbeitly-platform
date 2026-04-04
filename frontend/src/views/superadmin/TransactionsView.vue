<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Transactions</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Payment history and revenue tracking.</p>
      </div>
      <button @click="showAdd = true" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Transaction
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="rounded-xl border border-border bg-card p-5">
        <p class="text-2xl font-bold font-display text-foreground">€{{ totalRevenue.toLocaleString() }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">Total Revenue</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <p class="text-2xl font-bold font-display text-green-400">{{ completedCount }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">Completed</p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <p class="text-2xl font-bold font-display text-destructive">{{ refundedCount }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">Refunded</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-xs">
        <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
        <input v-model="search" placeholder="Search..." class="h-9 w-full rounded-lg bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
      </div>
      <select v-model="statusFilter" class="h-9 rounded-lg bg-secondary border-none text-xs text-foreground px-3 outline-none">
        <option value="all">All Statuses</option>
        <option value="paid">Paid</option>
        <option value="pending">Pending</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-xs text-muted-foreground">
            <th class="text-left px-4 py-3 font-medium">Date</th>
            <th class="text-left px-4 py-3 font-medium">Candidate</th>
            <th class="text-left px-4 py-3 font-medium">Plan</th>
            <th class="text-right px-4 py-3 font-medium">Amount</th>
            <th class="text-left px-4 py-3 font-medium">Method</th>
            <th class="text-left px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id" class="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ formatDate(t.date) }}</td>
            <td class="px-4 py-3 font-medium text-foreground">{{ t.candidateName }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ t.plan }}</td>
            <td class="px-4 py-3 text-right font-semibold tabular-nums text-foreground">€{{ t.amount }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs capitalize">{{ t.method }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="statusClass(t.status)">{{ t.status }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button @click="deleteTransaction(t.id)" class="text-muted-foreground hover:text-destructive"><span class="mdi mdi-trash-can-outline text-sm" /></button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-4 py-12 text-center text-muted-foreground text-sm">No transactions found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add dialog -->
    <div v-if="showAdd" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-md space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">Add Transaction</h3>
        <div class="space-y-3">
          <div><label class="text-sm font-medium text-foreground block mb-1">Candidate Name</label><input v-model="form.candidateName" class="input-field" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Plan</label><input v-model="form.plan" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Amount (€)</label><input v-model="form.amount" type="number" class="input-field" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Method</label>
              <select v-model="form.method" class="input-field"><option value="stripe">Stripe</option><option value="manual">Manual</option></select>
            </div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Status</label>
              <select v-model="form.status" class="input-field"><option value="paid">Paid</option><option value="pending">Pending</option><option value="refunded">Refunded</option></select>
            </div>
          </div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Date</label><input v-model="form.date" type="date" class="input-field" /></div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Notes</label><input v-model="form.notes" class="input-field" /></div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="showAdd = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="addTransaction" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Transaction { id: string; date: string; candidateName: string; plan: string; amount: number; method: string; status: string; notes?: string; }

const transactions = ref<Transaction[]>([]);
const search = ref('');
const statusFilter = ref('all');
const showAdd = ref(false);
const form = ref({ candidateName: '', plan: '', amount: 0, method: 'stripe', status: 'paid', date: new Date().toISOString().split('T')[0], notes: '' });

const filtered = computed(() => transactions.value.filter(t => {
  if (statusFilter.value !== 'all' && t.status !== statusFilter.value) return false;
  if (search.value && !t.candidateName.toLowerCase().includes(search.value.toLowerCase())) return false;
  return true;
}));

const totalRevenue = computed(() => transactions.value.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0));
const completedCount = computed(() => transactions.value.filter(t => t.status === 'paid').length);
const refundedCount = computed(() => transactions.value.filter(t => t.status === 'refunded').length);

function statusClass(s: string) {
  return { paid: 'bg-green-500/10 text-green-400', pending: 'bg-yellow-500/10 text-yellow-400', refunded: 'bg-destructive/10 text-destructive' }[s] || 'bg-secondary text-muted-foreground';
}

function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

function addTransaction() {
  transactions.value.unshift({ ...form.value, id: crypto.randomUUID() });
  showAdd.value = false;
  form.value = { candidateName: '', plan: '', amount: 0, method: 'stripe', status: 'paid', date: new Date().toISOString().split('T')[0], notes: '' };
}

function deleteTransaction(id: string) { transactions.value = transactions.value.filter(t => t.id !== id); }
</script>
