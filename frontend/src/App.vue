<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();

onMounted(async () => {
  // Hydrate user data if token exists (page refresh, etc.)
  if (auth.token && !auth.user) {
    await auth.fetchMe();
  }
});
</script>
