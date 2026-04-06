<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-6">
    <div class="w-full max-w-md animate-fade-in">
      <div class="flex items-center justify-between mb-8">
        <router-link to="/" class="flex items-center gap-2">
          <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
        </router-link>
        <router-link to="/pricing" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <span class="mdi mdi-arrow-left text-sm" /> Back
        </router-link>
      </div>

      <div v-if="loadingPlan" class="flex items-center justify-center py-16 text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-2xl" />
      </div>

      <template v-else-if="plan">
        <h1 class="font-display text-2xl font-bold text-foreground">Complete your purchase</h1>
        <p class="mt-1 text-sm text-muted-foreground">Review your plan and confirm payment.</p>

        <!-- Plan summary -->
        <div class="mt-6 rounded-2xl border border-border bg-card p-6 space-y-4">
          <div class="flex items-baseline justify-between">
            <h2 class="font-display text-lg font-bold text-foreground">{{ plan.name }}</h2>
            <span v-if="plan.isPopular" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">Popular</span>
          </div>
          <p v-if="plan.description" class="text-sm text-muted-foreground">{{ plan.description }}</p>
          <ul class="space-y-2">
            <li v-for="f in (plan.features || []).filter((f: any) => f.included)" :key="f.text" class="flex items-center gap-2 text-sm text-muted-foreground">
              <span class="mdi mdi-check text-base text-primary shrink-0" />
              {{ f.text }}
            </li>
          </ul>
          <div class="pt-4 border-t border-border flex items-baseline justify-between">
            <span class="text-sm text-muted-foreground">{{ plan.applicationLimit }} employee-assisted applications</span>
            <span class="font-display text-2xl font-bold text-foreground">&euro;{{ plan.price }}</span>
          </div>
        </div>

        <p v-if="error" class="mt-4 text-sm text-destructive">{{ error }}</p>

        <button
          @click="handlePurchase"
          :disabled="purchasing"
          class="mt-6 w-full h-11 rounded-full text-sm font-semibold transition-opacity disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90"
        >
          {{ purchasing ? 'Redirecting to payment...' : `Pay €${plan.price} Now` }}
        </button>

        <div class="mt-4 flex items-center justify-center gap-3 text-muted-foreground">
          <span class="mdi mdi-lock-outline text-sm" />
          <span class="text-xs">Secure payment via Stripe</span>
          <span class="mdi mdi-credit-card-outline text-sm" />
        </div>
      </template>

      <div v-else class="text-center py-16">
        <span class="mdi mdi-alert-circle-outline text-4xl text-muted-foreground/30" />
        <p class="mt-2 text-sm text-muted-foreground">Plan not found.</p>
        <router-link to="/pricing" class="mt-3 inline-block text-sm text-primary hover:underline">View plans</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

interface PlanData {
  id: string; name: string; description: string | null; price: number;
  applicationLimit: number; features: { text: string; included: boolean }[];
  isPopular: boolean;
}

const plan = ref<PlanData | null>(null);
const loadingPlan = ref(true);
const purchasing = ref(false);
const error = ref('');

onMounted(async () => {
  const planId = route.query.plan as string;
  if (!planId) { loadingPlan.value = false; return; }
  try {
    const { data } = await api.get('/plans');
    plan.value = (data.data || []).find((p: any) => p.id === planId) ?? null;
  } catch { /* plan not found */ }
  finally { loadingPlan.value = false; }
});

async function handlePurchase() {
  if (!plan.value) return;
  purchasing.value = true;
  error.value = '';
  try {
    // Try Stripe Checkout first
    const { data } = await api.post('/payment/create-checkout', { planId: plan.value.id });
    if (data.data?.url) {
      window.location.href = data.data.url;
      return;
    }
    // Fallback to mock purchase if Stripe not configured
    await api.post('/payment/purchase', { planId: plan.value.id });
    await auth.fetchMe();
    if (!auth.user?.profile?.onboardingCompleted) {
      router.push('/candidate/onboarding');
    } else {
      router.push('/candidate/applications');
    }
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Purchase failed. Please try again.';
  } finally {
    purchasing.value = false;
  }
}
</script>
