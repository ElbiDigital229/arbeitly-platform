<template>
  <div class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
    <span v-if="icon" class="mdi text-4xl opacity-20" :class="`mdi-${icon}`" />
    <p v-if="title" class="text-sm font-medium text-foreground">{{ title }}</p>
    <p v-if="message" class="text-sm text-center max-w-sm">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title?: string;
  message?: string;
}>();
</script>
