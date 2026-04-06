<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
      <p class="text-muted">Completing sign in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

onMounted(async () => {
  // After Auth0 redirect, the token is available via Auth0 SDK
  // The auth middleware on the backend will handle Auth0 JWT verification
  // For now, redirect to the portal — the backend will auto-provision the user
  try {
    await auth.fetchMe();
    router.replace('/candidate/applications');
  } catch {
    router.replace('/login');
  }
});
</script>
