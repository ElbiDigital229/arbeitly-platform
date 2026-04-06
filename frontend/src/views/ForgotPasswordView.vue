<template>
  <div class="min-h-screen flex bg-background">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-primary/10 border border-primary/20">
          <span class="mdi mdi-key-variant text-3xl text-primary" />
        </div>
        <h2 class="font-display text-4xl font-bold text-foreground">Reset Password</h2>
        <p class="mt-4 text-lg text-muted-foreground">
          We'll send you a link to reset your password. Tokens expire in 30 minutes.
        </p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <div class="flex items-center justify-between mb-8">
          <router-link to="/" class="flex items-center gap-2">
            <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
          </router-link>
          <router-link to="/login" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" /> Back
          </router-link>
        </div>

        <!-- Submitted state -->
        <div v-if="submitted" class="space-y-6">
          <div class="flex flex-col items-center text-center gap-3">
            <div class="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <span class="mdi mdi-check-circle text-2xl text-green-500" />
            </div>
            <div>
              <h1 class="font-display text-xl font-bold text-foreground">Check your email</h1>
              <p class="text-sm text-muted-foreground mt-1">
                A reset link was sent to <strong class="text-foreground">{{ email }}</strong>. It expires in 30 minutes.
              </p>
            </div>
          </div>

          <!-- Demo mode box -->
          <div class="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo Mode</p>
            <p class="text-xs text-muted-foreground">
              In production, an email would be sent. For demo purposes, use the button below:
            </p>
            <router-link
              :to="resetLink"
              class="block w-full h-9 rounded-full text-sm font-medium text-center leading-9 transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
            >
              Open Reset Link
            </router-link>
          </div>

          <router-link to="/login" class="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" />
            Back to login
          </router-link>
        </div>

        <!-- Pre-submit state -->
        <template v-else>
          <h1 class="font-display text-2xl font-bold text-foreground">Forgot Password?</h1>
          <p class="mt-1 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>

          <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
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
            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
            <button
              type="submit"
              class="w-full h-10 rounded-full text-sm font-medium transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
            >
              Send Reset Link
            </button>
          </form>

          <router-link to="/login" class="mt-5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span class="mdi mdi-arrow-left text-sm" />
            Back to login
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const email = ref('');
const submitted = ref(false);
const resetLink = ref('');
const error = ref('');

function handleSubmit() {
  error.value = '';
  const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  const expiry = Date.now() + 30 * 60 * 1000;
  sessionStorage.setItem(`arbeitly_reset_${token}`, JSON.stringify({ email: email.value.toLowerCase().trim(), expiry }));
  resetLink.value = `/candidate/reset-password?token=${token}`;
  submitted.value = true;
}
</script>
