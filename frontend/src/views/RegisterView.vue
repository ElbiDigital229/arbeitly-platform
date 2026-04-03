<template>
  <div class="min-h-screen flex" style="background: var(--color-bg);">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6" style="background: hsl(188 100% 44% / 0.1); border: 1px solid hsl(188 100% 44% / 0.2);">
          <span class="mdi mdi-account-plus-outline text-3xl" style="color: var(--color-primary);" />
        </div>
        <h2 class="text-4xl font-bold" style="color: var(--color-foreground); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">
          Create Account
        </h2>
        <p class="mt-4 text-lg" style="color: var(--color-muted);">
          Join Arbeitly and start your job search journey.
        </p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6" style="background: var(--color-bg);">
      <div class="w-full max-w-sm">
        <!-- Logo + back row -->
        <div class="flex items-center justify-between mb-8">
          <router-link to="/" class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg flex items-center justify-center" style="background: var(--color-primary);">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <span class="font-bold text-sm" style="color: var(--color-foreground); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">Arbeitly</span>
          </router-link>
          <router-link to="/" class="flex items-center gap-1.5 text-xs transition-colors" style="color: var(--color-muted);">
            <span class="mdi mdi-arrow-left text-sm" />
            Back
          </router-link>
        </div>

        <h1 class="text-2xl font-bold" style="color: var(--color-foreground); font-family: 'Plus Jakarta Sans', system-ui, sans-serif;">Create Account</h1>
        <p class="mt-1 text-sm" style="color: var(--color-muted);">Start your job search journey today</p>

        <form class="mt-6 space-y-4" @submit.prevent="handleRegister">
          <div>
            <label for="email" class="text-sm font-medium" style="color: var(--color-foreground);">Email</label>
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
            <label for="password" class="text-sm font-medium" style="color: var(--color-foreground);">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minlength="8"
              class="input-field mt-1.5"
            />
          </div>
          <div>
            <label for="confirm" class="text-sm font-medium" style="color: var(--color-foreground);">Confirm Password</label>
            <input
              id="confirm"
              v-model="confirmPassword"
              type="password"
              placeholder="Repeat password"
              required
              class="input-field mt-1.5"
            />
          </div>
          <p v-if="apiError" class="text-sm" style="color: var(--color-destructive);">{{ apiError }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full h-10 rounded-full text-sm font-medium transition-opacity disabled:opacity-50"
            style="background: var(--color-primary); color: var(--color-primary-fg);"
          >
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <p class="mt-6 text-center text-xs" style="color: var(--color-muted);">
          Already have an account?
          <router-link to="/login" class="hover:underline" style="color: var(--color-primary);">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const apiError = ref('');

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

<style scoped>
.input-field {
  display: block;
  width: 100%;
  height: 2.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-input-bg);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-foreground);
  outline: none;
  transition: box-shadow 0.15s;
}
.input-field::placeholder {
  color: var(--color-muted);
}
.input-field:focus {
  box-shadow: 0 0 0 2px var(--color-primary);
}
</style>
