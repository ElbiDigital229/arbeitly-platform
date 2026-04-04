<template>
  <div class="min-h-screen flex">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <h2 class="font-display text-4xl font-bold text-foreground">
          Welcome Back
        </h2>
        <p class="mt-4 text-muted-foreground text-lg">
          Continue optimizing your job applications with AI-powered tools.
        </p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <router-link to="/" class="flex items-center gap-2 mb-8">
          <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
        </router-link>

        <h1 class="font-display text-2xl font-bold text-foreground">Sign in</h1>
        <p class="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>

        <!-- Google OAuth -->
        <button
          type="button"
          class="mt-6 w-full h-10 rounded-md border border-border text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-colors hover:bg-secondary/60"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <!-- Separator -->
        <div class="my-6 flex items-center gap-3">
          <div class="flex-1 h-px bg-border" />
          <span class="text-xs text-muted-foreground">or</span>
          <div class="flex-1 h-px bg-border" />
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
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
            <div class="flex items-center justify-between">
              <label for="password" class="text-sm font-medium text-foreground">Password</label>
              <router-link to="/candidate/forgot-password" class="text-xs text-primary hover:underline">
                Forgot password?
              </router-link>
            </div>
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
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?
          <router-link to="/register" class="font-medium text-primary hover:underline">Create one</router-link>
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
const loading = ref(false);
const apiError = ref('');

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
