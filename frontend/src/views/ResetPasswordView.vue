<template>
  <div class="min-h-screen flex bg-background">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-hero-radial items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 bg-primary/10 border border-primary/20">
          <span class="mdi mdi-key-variant text-3xl text-primary" />
        </div>
        <h2 class="font-display text-4xl font-bold text-foreground">Set New Password</h2>
        <p class="mt-4 text-lg text-muted-foreground">
          Choose a strong password to secure your account.
        </p>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-6 bg-background">
      <div class="w-full max-w-sm">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2 mb-8">
          <img src="../assets/logo.png" alt="Arbeitly" class="h-8" />
        </router-link>

        <!-- Loading -->
        <p v-if="tokenState === 'loading'" class="text-sm text-muted-foreground">
          Verifying reset link...
        </p>

        <!-- Invalid / Expired -->
        <div v-else-if="tokenState === 'invalid' || tokenState === 'expired'" class="space-y-5 text-center">
          <div class="h-12 w-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
            <span class="mdi mdi-close-circle text-2xl text-destructive" />
          </div>
          <div>
            <h1 class="font-display text-xl font-bold text-foreground">
              {{ tokenState === 'expired' ? 'Link Expired' : 'Invalid Link' }}
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              {{ tokenState === 'expired'
                ? 'This reset link has expired. Reset links are valid for 30 minutes.'
                : 'This reset link is invalid or has already been used.' }}
            </p>
          </div>
          <router-link
            to="/candidate/forgot-password"
            class="block w-full h-10 rounded-full text-sm font-medium text-center leading-10 transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
          >
            Request New Link
          </router-link>
          <router-link to="/login" class="block text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to login
          </router-link>
        </div>

        <!-- Valid form -->
        <template v-else-if="tokenState === 'valid' && !success">
          <h1 class="font-display text-2xl font-bold text-foreground">Set New Password</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Setting password for <strong class="text-foreground">{{ tokenEmail }}</strong>
          </p>

          <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="password" class="text-sm font-medium text-foreground">New Password</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Min. 8 characters"
                required
                class="input-field mt-1.5"
              />
            </div>
            <div>
              <label for="confirm" class="text-sm font-medium text-foreground">Confirm Password</label>
              <input
                id="confirm"
                v-model="form.confirm"
                type="password"
                placeholder="Repeat password"
                required
                class="input-field mt-1.5"
              />
            </div>
            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
            <button
              type="submit"
              class="w-full h-10 rounded-full text-sm font-medium transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
            >
              Reset Password
            </button>
          </form>
        </template>

        <!-- Success -->
        <div v-else-if="success" class="space-y-5 text-center">
          <div class="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
            <span class="mdi mdi-check-circle text-2xl text-green-500" />
          </div>
          <div>
            <h1 class="font-display text-xl font-bold text-foreground">Password Updated!</h1>
            <p class="text-sm text-muted-foreground mt-1">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
          <router-link
            to="/login"
            class="block w-full h-10 rounded-full text-sm font-medium text-center leading-10 transition-opacity hover:opacity-90 bg-primary text-primary-foreground"
          >
            Go to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type TokenState = 'loading' | 'valid' | 'invalid' | 'expired';

const route = useRoute();
const router = useRouter();

const token = (route.query.token as string) ?? '';
const tokenState = ref<TokenState>('loading');
const tokenEmail = ref('');
const form = ref({ password: '', confirm: '' });
const error = ref('');
const success = ref(false);

onMounted(() => {
  if (!token) { tokenState.value = 'invalid'; return; }
  try {
    const raw = sessionStorage.getItem(`arbeitly_reset_${token}`);
    if (!raw) { tokenState.value = 'invalid'; return; }
    const { email, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { tokenState.value = 'expired'; return; }
    tokenEmail.value = email;
    tokenState.value = 'valid';
  } catch {
    tokenState.value = 'invalid';
  }
});

function handleSubmit() {
  error.value = '';
  if (form.value.password.length < 8) { error.value = 'Password must be at least 8 characters.'; return; }
  if (form.value.password !== form.value.confirm) { error.value = 'Passwords do not match.'; return; }
  sessionStorage.removeItem(`arbeitly_reset_${token}`);
  success.value = true;
  setTimeout(() => router.push('/login'), 3000);
}
</script>
