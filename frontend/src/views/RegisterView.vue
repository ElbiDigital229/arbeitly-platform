<template>
  <div class="min-h-screen flex">
    <!-- Left panel — plan summary -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md w-full animate-fade-in">
        <p class="text-xs font-semibold text-primary uppercase tracking-widest mb-6">
          {{ isFree ? 'Step 1 of 2 — Create Account' : 'Step 1 of 3 — Create Account' }}
        </p>
        <h2 class="font-display text-4xl font-bold text-foreground">
          You've chosen the
          <span class="text-gradient">{{ selectedPlan.name }}</span> plan
        </h2>
        <p class="mt-4 text-muted-foreground text-lg">
          {{ isFree
            ? 'Create your account and start tracking your job search for free.'
            : 'Create your account to continue. Payment details come next.' }}
        </p>

        <!-- Plan card -->
        <div class="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur p-6">
          <div class="flex items-baseline justify-between mb-4">
            <span class="font-display text-lg font-bold text-card-foreground">{{ selectedPlan.name }}</span>
            <span class="font-display text-sm font-bold text-primary">
              {{ selectedPlan.price }}
              <template v-if="selectedPlan.priceSuffix"> {{ selectedPlan.priceSuffix }}</template>
            </span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="f in selectedPlan.features.filter(f => f.included)"
              :key="f.text"
              class="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span class="mdi mdi-check text-base text-primary shrink-0" />
              {{ f.text }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Right panel — form -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm animate-fade-in" style="animation-delay: 0.15s; animation-fill-mode: both;">
        <div class="flex items-center justify-between mb-8">
          <router-link to="/pricing" class="flex items-center gap-2">
            <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
          </router-link>
          <router-link to="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" /> Back
          </router-link>
        </div>

        <h1 class="font-display text-2xl font-bold text-foreground">Create your account</h1>
        <p class="mt-1 text-sm text-muted-foreground">Fill in your details to get started</p>
        <p v-if="apiError" class="mt-3 text-sm text-destructive">{{ apiError }}</p>

        <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="fullName" class="text-sm font-medium text-foreground">Full Name</label>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              placeholder="Max Müller"
              required
              class="input-field mt-1.5"
            />
          </div>
          <div>
            <label for="email" class="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              class="input-field mt-1.5"
            />
          </div>
          <div>
            <label for="password" class="text-sm font-medium text-foreground">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              minlength="8"
              class="input-field mt-1.5"
            />
          </div>
          <div>
            <label for="confirm" class="text-sm font-medium text-foreground">Confirm Password</label>
            <input
              id="confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              class="input-field mt-1.5"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full h-10 rounded-full text-sm font-medium transition-opacity disabled:opacity-50 bg-primary text-primary-foreground mt-2"
          >
            {{ loading ? 'Please wait...' : isFree ? 'Create Free Account' : 'Continue to Payment' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary hover:underline">Sign in</router-link>
        </p>
        <p class="mt-3 text-center text-sm text-muted-foreground">
          Want a different plan?
          <router-link to="/pricing" class="font-medium text-primary hover:underline">Go back</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const apiError = ref('');

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    priceSuffix: '',
    free: true,
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
    free: false,
    features: [
      { text: '200 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review', included: true },
      { text: 'Standard Resume', included: true },
      { text: 'Standard Cover Letters', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '€399',
    priceSuffix: '',
    free: false,
    features: [
      { text: '300 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review', included: true },
      { text: 'Standard Resume', included: true },
      { text: 'Standard Cover Letters', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€499',
    priceSuffix: '',
    free: false,
    features: [
      { text: '400 Job applications', included: true },
      { text: 'Expert Resume / Cover Letter Review', included: true },
      { text: 'Standard Resume', included: true },
      { text: 'Standard Cover Letters', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: false },
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '€499',
    priceSuffix: '+ 8.5% SUCCESS FEE',
    free: false,
    features: [
      { text: 'Tailored Job Applications', included: true },
      { text: 'Expert Resume / Cover Letter Review', included: true },
      { text: 'Custom Resume for every application', included: true },
      { text: 'Custom Cover Letters for every application', included: true },
      { text: '1 Human Assistant', included: true },
      { text: 'LinkedIn Makeover', included: true },
    ],
  },
];

const selectedPlan = computed(() => {
  const planParam = (route.query.plan as string) || 'premium';
  return plans.find(p => p.id === planParam) ?? plans[0];
});

const isFree = computed(() => selectedPlan.value.free);

async function handleRegister() {
  apiError.value = '';
  if (password.value !== confirmPassword.value) {
    apiError.value = 'Passwords do not match.';
    return;
  }
  loading.value = true;
  try {
    await auth.register(email.value, password.value, confirmPassword.value);
    router.push('/candidate/applications');
  } catch (e: any) {
    apiError.value = e?.response?.data?.error || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>
