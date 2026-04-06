<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-6">
    <div class="w-full max-w-md text-center animate-fade-in">
      <div v-if="verifying" class="space-y-4">
        <div class="flex justify-center">
          <div class="h-16 w-16 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20">
            <span class="mdi mdi-loading mdi-spin text-3xl text-primary" />
          </div>
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground">Verifying payment...</h1>
        <p class="text-sm text-muted-foreground">Please wait while we confirm your purchase.</p>
      </div>
      <div v-else-if="success" class="space-y-4">
        <div class="flex justify-center">
          <div class="h-16 w-16 rounded-2xl flex items-center justify-center bg-green-500/10 border border-green-500/20">
            <span class="mdi mdi-check-circle text-3xl text-green-500" />
          </div>
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground">Payment successful!</h1>
        <p class="text-sm text-muted-foreground">Your plan has been activated. Redirecting...</p>
      </div>
      <div v-else class="space-y-4">
        <div class="flex justify-center">
          <div class="h-16 w-16 rounded-2xl flex items-center justify-center bg-destructive/10 border border-destructive/20">
            <span class="mdi mdi-alert-circle-outline text-3xl text-destructive" />
          </div>
        </div>
        <h1 class="font-display text-2xl font-bold text-foreground">Payment verification failed</h1>
        <p class="text-sm text-destructive">{{ error }}</p>
        <router-link to="/pricing" class="inline-block mt-4 text-sm text-primary hover:underline">Try again</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const verifying = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  const sessionId = route.query.session_id as string;
  if (!sessionId) { verifying.value = false; error.value = 'No payment session found.'; return; }
  try {
    await api.post('/payment/verify', { sessionId });
    await auth.fetchMe();
    success.value = true;
    setTimeout(() => {
      if (!auth.user?.profile?.onboardingCompleted) router.push('/candidate/onboarding');
      else router.push('/candidate/applications');
    }, 2000);
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Could not verify payment.';
  } finally { verifying.value = false; }
});
</script>
