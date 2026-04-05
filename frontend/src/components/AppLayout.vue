<template>
  <div>
    <AppNavbar />
    <v-main>
      <slot />
    </v-main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from './AppNavbar.vue';
</script>
