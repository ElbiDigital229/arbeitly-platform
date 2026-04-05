<template>
  <div class="min-h-screen flex">
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-purple-500/10 border border-purple-500/20">
          <span class="mdi mdi-shield-account-outline text-3xl text-purple-400" />
        </div>
        <h2 class="font-display text-4xl font-bold text-foreground">Super Admin</h2>
        <p class="mt-4 text-lg text-muted-foreground">Platform management and configuration.</p>
      </div>
    </div>
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <div class="flex items-center justify-between mb-8">
          <router-link to="/" class="flex items-center gap-2">
            <img src="../../assets/logo.png" alt="Arbeitly" class="h-8" />
          </router-link>
          <router-link to="/" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" /> Back
          </router-link>
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground">Admin Sign In</h1>
        <p class="mt-1 text-sm text-muted-foreground">Access the management dashboard</p>
        <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="text-sm font-medium text-foreground">Email</label>
            <input v-model="email" type="email" placeholder="admin@arbeitly.de" required class="input-field mt-1.5" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground">Password</label>
            <input v-model="password" type="password" placeholder="••••••••" required class="input-field mt-1.5" />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <button type="submit" :disabled="loading" class="w-full h-10 rounded-full text-sm font-medium disabled:opacity-50 bg-primary text-primary-foreground">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <p class="mt-6 text-center text-xs text-muted-foreground">
          <router-link to="/" class="text-primary hover:underline">← Back to home</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await store.signin(email.value, password.value);
    router.push('/superadmin/overview');
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>
