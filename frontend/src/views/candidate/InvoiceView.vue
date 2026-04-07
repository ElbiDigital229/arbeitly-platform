<template>
  <div class="min-h-screen bg-background">
    <!-- Top toolbar (hidden in print) -->
    <div class="print:hidden border-b border-border bg-card">
      <div class="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
        <router-link to="/candidate/profile" class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <span class="mdi mdi-arrow-left text-base" /> Back to profile
        </router-link>
        <button
          @click="handlePrint"
          class="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <span class="mdi mdi-printer-outline text-base" /> Print / Save PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-32 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <div v-else-if="!tx" class="text-center py-32">
      <span class="mdi mdi-alert-circle-outline text-5xl text-muted-foreground/30" />
      <p class="mt-3 text-sm text-muted-foreground">Invoice not found.</p>
    </div>

    <!-- Invoice document -->
    <div v-else class="max-w-3xl mx-auto px-6 py-10 print:py-0 print:px-0">
      <div class="rounded-2xl border border-border bg-card p-10 print:border-0 print:rounded-none print:shadow-none">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-border pb-6">
          <div>
            <img src="../../assets/logo.png" alt="Arbeitly" class="h-8 mb-3" />
            <p class="text-xs text-muted-foreground">Arbeitly · Climb the ladder</p>
          </div>
          <div class="text-right">
            <h1 class="font-display text-3xl font-bold text-foreground">INVOICE</h1>
            <p class="text-xs text-muted-foreground mt-1">#{{ tx.id.slice(-12).toUpperCase() }}</p>
            <span
              class="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              :class="tx.status === 'paid' ? 'bg-green-500/15 text-green-500 border border-green-500/30' : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30'"
            >{{ tx.status }}</span>
          </div>
        </div>

        <!-- Bill to + dates -->
        <div class="grid grid-cols-2 gap-6 py-6 border-b border-border">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Bill to</p>
            <p class="mt-2 text-sm font-semibold text-foreground">{{ billToName }}</p>
            <p class="text-xs text-muted-foreground">{{ tx.user?.email }}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Issued</p>
            <p class="mt-2 text-sm font-semibold text-foreground">{{ formatDate(tx.createdAt) }}</p>
            <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-3">Method</p>
            <p class="text-xs text-foreground">{{ formatMethod(tx.method) }}</p>
          </div>
        </div>

        <!-- Line items -->
        <div class="py-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                <th class="text-left font-semibold pb-3">Description</th>
                <th class="text-right font-semibold pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-border/50">
                <td class="py-4">
                  <p class="font-semibold text-foreground">{{ tx.plan?.name || 'Plan' }}</p>
                  <p v-if="tx.plan?.description" class="text-xs text-muted-foreground mt-0.5">{{ tx.plan.description }}</p>
                </td>
                <td class="py-4 text-right tabular-nums font-semibold text-foreground">{{ tx.currency || '€' }}{{ tx.amount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Total -->
          <div class="flex items-center justify-between mt-6 pt-4 border-t-2 border-border">
            <span class="font-display text-base font-bold text-foreground">Total</span>
            <span class="font-display text-2xl font-bold text-foreground tabular-nums">{{ tx.currency || '€' }}{{ tx.amount.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Notes / footer -->
        <div v-if="tx.notes" class="border-t border-border pt-4">
          <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Payment details</p>
          <p class="text-xs text-foreground mt-1">{{ tx.notes }}</p>
        </div>

        <div class="border-t border-border mt-6 pt-4 text-center">
          <p class="text-[10px] text-muted-foreground">Thank you for your purchase. This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';

interface InvoiceTx {
  id: string;
  amount: number;
  currency: string | null;
  method: string;
  status: string;
  notes: string | null;
  createdAt: string;
  plan?: { id: string; name: string; price: number; currency: string; description: string | null } | null;
  user?: { email: string; profile?: { firstName: string | null; lastName: string | null } | null };
}

const route = useRoute();
const tx = ref<InvoiceTx | null>(null);
const loading = ref(true);

const billToName = computed(() => {
  const p = tx.value?.user?.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return tx.value?.user?.email?.split('@')[0] || '—';
});

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const formatMethod = (m: string) => {
  if (m === 'mock_card') return 'Test card (mock)';
  if (m === 'stripe') return 'Stripe';
  if (m === 'platform') return 'Platform credit';
  return m;
};

function handlePrint() {
  window.print();
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/payment/transactions/${route.params.id}`);
    tx.value = data.data;
  } catch { /* ignore */ }
  finally { loading.value = false; }
});
</script>
