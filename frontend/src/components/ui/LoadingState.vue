<template>
  <div :class="['flex flex-col items-center justify-center gap-2 text-muted-foreground', paddingClass]">
    <span class="mdi mdi-loading mdi-spin" :class="iconClass" />
    <p v-if="label" class="text-sm">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  { size: 'md' },
);

const iconClass = computed(() => ({ sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }[props.size]));
const paddingClass = computed(() => ({ sm: 'py-6', md: 'py-16', lg: 'py-24' }[props.size]));
</script>
