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

      <div ref="gridRef" class="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div
          v-for="(plan, index) in plans"
          :key="plan.id"
          class="relative rounded-2xl border p-6 flex flex-col"
          :class="[
            plan.popular ? 'border-primary bg-card shadow-xl glow-accent scale-105' : 'border-border bg-card',
            gridVisible ? 'animate-fade-in' : ''
          ]"
          :style="gridVisible ? { animationDelay: `${index * 0.1}s`, animationFillMode: 'both' } : { opacity: 0 }"
        >
          <!-- Popular badge -->
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
                {{ plan.price }}
              </span>
            </div>
            <p v-if="plan.priceSuffix" class="text-xs font-semibold text-primary mt-0.5">
              {{ plan.priceSuffix }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">{{ plan.billing }}</p>
          </div>

          <router-link
            :to="`/register?plan=${plan.id}`"
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
import { ref, onMounted, onBeforeUnmount } from 'vue';

const gridRef = ref<HTMLElement | null>(null);
const gridVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (gridRef.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gridVisible.value = true;
          observer?.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(gridRef.value);
  }
});

onBeforeUnmount(() => observer?.disconnect());

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    priceSuffix: '',
    billing: 'forever free',
    popular: false,
    features: [
      { text: 'Job application tracker (list + kanban)', included: true },
      { text: 'Up to 20 applications', included: true },
      { text: 'Basic profile', included: true },
      { text: 'Human Assistant', included: false },
      { text: 'Resume / Cover Letter service', included: false },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '€299',
    priceSuffix: '',
    billing: 'one time payment',
    popular: false,
    features: [
      { text: '200 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review (1,2)', included: true },
      { text: 'Standard Resume*', included: true },
      { text: 'Standard Cover Letters*', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '€399',
    priceSuffix: '',
    billing: 'one time payment',
    popular: false,
    features: [
      { text: '300 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review (1,2)', included: true },
      { text: 'Standard Resume*', included: true },
      { text: 'Standard Cover Letters*', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€499',
    priceSuffix: '',
    billing: 'one time payment',
    popular: true,
    features: [
      { text: '400 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review (1,2)', included: true },
      { text: 'Standard Resume*', included: true },
      { text: 'Standard Cover Letters*', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '€499',
    priceSuffix: '+ 8.5% SUCCESS FEE',
    billing: 'one time payment',
    popular: false,
    features: [
      { text: 'Tailored Job Applications', included: true },
      { text: 'Expert Resume / Cover Letter Review (2)', included: true },
      { text: 'Custom Resume for every application', included: true },
      { text: 'Custom Cover Letters for every application', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover (2)', included: true },
    ],
  },
];
</script>
