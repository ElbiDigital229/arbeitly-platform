<template>
  <v-app-bar color="primary" elevation="2">
    <v-app-bar-title>
      <router-link to="/dashboard" class="text-white text-decoration-none font-weight-bold">
        Arbeitly
      </router-link>
    </v-app-bar-title>

    <template #append>
      <v-btn to="/dashboard" variant="text" color="white" prepend-icon="mdi-view-dashboard">
        Dashboard
      </v-btn>
      <v-btn to="/applications" variant="text" color="white" prepend-icon="mdi-briefcase">
        Applications
      </v-btn>
      <v-btn to="/cvs" variant="text" color="white" prepend-icon="mdi-file-document">
        CVs
      </v-btn>
      <v-btn to="/profile" variant="text" color="white" prepend-icon="mdi-account">
        Profile
      </v-btn>
      <v-btn variant="text" color="white" prepend-icon="mdi-logout" @click="handleLogout">
        Logout
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
