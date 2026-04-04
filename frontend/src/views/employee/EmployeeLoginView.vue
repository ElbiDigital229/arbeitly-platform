<template>
  <div class="min-h-screen flex">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-primary/10 border border-primary/20">
          <span class="mdi mdi-view-dashboard-outline text-3xl text-primary" />
        </div>
        <h2 class="font-display text-4xl font-bold text-foreground">Employee Portal</h2>
        <p class="mt-4 text-lg text-muted-foreground">Manage candidates, track applications, and drive results.</p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <router-link to="/" class="flex items-center gap-2 mb-8">
          <img src="../../assets/logo.png" alt="Arbeitly" class="h-8" />
        </router-link>

        <h1 class="font-display text-2xl font-bold text-foreground">Employee Sign In</h1>
        <p class="mt-1 text-sm text-muted-foreground">Access the internal portal</p>

        <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="text-sm font-medium text-foreground">Email</label>
            <input id="email" v-model="email" type="email" placeholder="you@arbeitly.com" required class="input-field mt-1.5" />
          </div>
          <div>
            <label for="password" class="text-sm font-medium text-foreground">Password</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" required class="input-field mt-1.5" />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <button type="submit" :disabled="loading" class="w-full h-10 rounded-full text-sm font-medium transition-opacity disabled:opacity-50 bg-primary text-primary-foreground">
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
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
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
    router.push('/employee/dashboard');
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>
