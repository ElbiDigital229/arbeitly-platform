<template>
  <div class="min-h-screen flex bg-background">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-primary/10 border border-primary/20">
          <span class="mdi mdi-account-circle-outline text-3xl text-primary" />
        </div>
        <h2 class="font-display text-4xl font-bold text-foreground">
          Candidate Portal
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          Track your applications, manage documents, and monitor your job search progress.
        </p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <!-- Logo + back row -->
        <div class="flex items-center justify-between mb-8">
          <router-link to="/" class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg flex items-center justify-center bg-primary">
              <span class="text-white font-bold text-sm">A</span>
            </div>
            <span class="font-display font-bold text-sm text-foreground">Arbeitly</span>
          </router-link>
          <router-link to="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" />
            Back
          </router-link>
        </div>

        <h1 class="font-display text-2xl font-bold text-foreground">Candidate Sign In</h1>
        <p class="mt-1 text-sm text-muted-foreground">Access your application portal</p>

        <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
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
              class="input-field mt-1.5"
            />
          </div>
          <p v-if="apiError" class="text-sm text-destructive">{{ apiError }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full h-10 rounded-full text-sm font-medium transition-opacity disabled:opacity-50 bg-primary text-primary-foreground"
          >
            {{ loading ? 'Signing in...' : 'Sign In to Portal' }}
          </button>
        </form>

        <!-- Separator -->
        <div class="my-5 flex items-center gap-3">
          <div class="flex-1 h-px bg-border" />
          <span class="text-xs text-muted-foreground">or</span>
          <div class="flex-1 h-px bg-border" />
        </div>

        <!-- Social login buttons (shown when Auth0 is configured) -->
        <div v-if="auth0Available" class="space-y-2.5 mb-4">
          <button
            type="button"
            @click="loginWithGoogle"
            class="w-full h-10 rounded-full border border-border text-foreground text-sm font-medium transition-colors hover:bg-secondary/60 bg-transparent flex items-center justify-center gap-2"
          >
            <span class="mdi mdi-google text-lg" />
            Continue with Google
          </button>
          <button
            type="button"
            @click="loginWithLinkedIn"
            class="w-full h-10 rounded-full border border-border text-foreground text-sm font-medium transition-colors hover:bg-secondary/60 bg-transparent flex items-center justify-center gap-2"
          >
            <span class="mdi mdi-linkedin text-lg" />
            Continue with LinkedIn
          </button>
        </div>

        <p class="text-right -mt-2">
          <router-link to="/candidate/forgot-password" class="text-xs text-primary hover:underline">
            Forgot password?
          </router-link>
        </p>

        <button
          type="button"
          @click="$router.push('/candidate/applications')"
          class="w-full h-10 rounded-full border border-border text-foreground text-sm font-medium transition-colors hover:bg-secondary/60 bg-transparent"
        >
          Continue as Guest
        </button>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          New customer?
          <router-link to="/pricing" class="text-primary hover:underline">Choose a plan</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { isAuth0Configured } from '../plugins/auth0';
import { useAuth0 } from '@auth0/auth0-vue';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const apiError = ref('');
const auth0Available = isAuth0Configured;

function loginWithGoogle() {
  if (!isAuth0Configured) return;
  const { loginWithRedirect } = useAuth0();
  loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } });
}

function loginWithLinkedIn() {
  if (!isAuth0Configured) return;
  const { loginWithRedirect } = useAuth0();
  loginWithRedirect({ authorizationParams: { connection: 'linkedin' } });
}

async function handleLogin() {
  apiError.value = '';
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push('/candidate/applications');
  } catch (e: any) {
    apiError.value = e?.response?.data?.error || 'Invalid email or password. Please try again.';
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
.input-field::placeholder { color: var(--color-muted); }
.input-field:focus { box-shadow: 0 0 0 2px var(--color-primary); }
</style>
