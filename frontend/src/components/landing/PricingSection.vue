<template>
  <section id="pricing" class="py-24 bg-background">
    <div class="container mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="font-display text-4xl font-bold text-foreground">
          Simple, Transparent Pricing
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          One-time payment. No hidden fees. No monthly charges.
        </p>
      </div>

      <div v-if="loadingPlans" class="flex items-center justify-center py-16 text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-2xl" />
      </div>

      <div v-else ref="gridRef" class="grid gap-6 max-w-6xl mx-auto" :class="gridColsClass">
        <div
          v-for="(plan, index) in allPlans"
          :key="plan.id"
          class="relative rounded-2xl border p-6 flex flex-col"
          :class="[
            plan.popular ? 'border-primary bg-card shadow-xl glow-accent scale-105' : 'border-border bg-card',
            gridVisible ? 'animate-fade-in' : ''
          ]"
          :style="gridVisible ? { animationDelay: `${index * 0.1}s`, animationFillMode: 'both' } : { opacity: 0 }"
        >
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground whitespace-nowrap"
          >
            Most Popular
          </div>

          <h3 class="font-display text-lg font-bold text-card-foreground uppercase tracking-wide">
            {{ plan.name }}
          </h3>

          <div class="mt-4">
            <div class="flex items-baseline gap-1 flex-wrap">
              <span class="font-display text-4xl font-bold text-card-foreground">
                &euro;{{ plan.price }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ plan.free ? 'forever free' : 'one time payment' }}</p>
            <p v-if="plan.applicationLimit" class="text-xs text-muted-foreground">{{ plan.applicationLimit }} applications</p>
          </div>

          <router-link
            :to="plan.free ? '/register?plan=free' : `/register?plan=${plan.id}`"
            class="mt-5 w-full h-10 rounded-full text-sm font-semibold text-center flex items-center justify-center transition-colors"
            :class="plan.popular
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'border border-border text-foreground hover:bg-secondary'"
          >
            Get Started
          </router-link>

          <ul class="mt-6 space-y-2.5 flex-1">
            <li
              v-for="(feature, fIdx) in plan.features"
              :key="`${plan.id}-f-${fIdx}`"
              class="flex items-start gap-2.5 text-sm"
            >
              <span
                v-if="feature.included"
                class="mdi mdi-check text-base text-primary shrink-0 mt-0.5"
              />
              <span
                v-else
                class="mdi mdi-close text-base text-muted-foreground/50 shrink-0 mt-0.5"
              />
              <span :class="feature.included ? 'text-muted-foreground' : 'text-muted-foreground/50'">
                {{ feature.text }}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 text-center max-w-xl mx-auto space-y-1 text-xs text-muted-foreground">
        <p>1. Expert Resume / Cover Letter Review can be excluded</p>
        <p>2. Pro-rata refunds are NOT applicable on Resume Review and LinkedIn Makeover as they are a one-time effort from Experts.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import axios from 'axios';

interface Feature { text: string; included: boolean; }
interface PlanDisplay {
  id: string; name: string; price: number; applicationLimit: number;
  popular: boolean; free: boolean; features: Feature[];
}

const gridRef = ref<HTMLElement | null>(null);
const gridVisible = ref(false);
const loadingPlans = ref(true);
const dynamicPlans = ref<PlanDisplay[]>([]);
let observer: IntersectionObserver | null = null;

const freePlan: PlanDisplay = {
  id: 'free', name: 'Free', price: 0, applicationLimit: 20, popular: false, free: true,
  features: [
    { text: 'Job application tracker (list + kanban)', included: true },
    { text: 'Up to 20 applications', included: true },
    { text: 'Basic profile', included: true },
    { text: 'Human Assistant', included: false },
    { text: 'Resume / Cover Letter service', included: false },
    { text: 'LinkedIn Makeover', included: false },
  ],
};

const allPlans = computed(() => [freePlan, ...dynamicPlans.value]);
const gridColsClass = computed(() => {
  const count = allPlans.value.length;
  if (count <= 2) return 'md:grid-cols-2';
  if (count <= 3) return 'md:grid-cols-3';
  if (count <= 4) return 'md:grid-cols-4';
  return 'md:grid-cols-3 lg:grid-cols-5';
});

function setupObserver() {
  if (gridRef.value && !observer) {
    observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { gridVisible.value = true; observer?.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(gridRef.value);
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/plans');
    dynamicPlans.value = (data.data || []).map((p: any) => ({
      id: p.id, name: p.name, price: p.price,
      applicationLimit: p.applicationLimit,
      popular: p.isPopular, free: false,
      features: p.features || [],
    }));
  } catch { /* show free plan only */ }
  finally { loadingPlans.value = false; }

  await nextTick();
  setupObserver();
});

watch(gridRef, () => setupObserver());

onBeforeUnmount(() => observer?.disconnect());
</script>
