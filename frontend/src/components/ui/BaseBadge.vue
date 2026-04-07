<template>
  <span :class="['inline-flex items-center gap-1 rounded-full font-medium', sizeClass, variantClass]">
    <span v-if="icon" class="mdi" :class="`mdi-${icon}`" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
    size?: 'sm' | 'md';
    icon?: string;
  }>(),
  { variant: 'default', size: 'sm' },
);

const sizeClass = computed(
  () => ({ sm: 'px-2 py-0.5 text-[10px]', md: 'px-2.5 py-1 text-xs' })[props.size],
);

const variantClass = computed(
  () =>
    ({
      default: 'bg-secondary text-foreground',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-green-500/10 text-green-600 dark:text-green-400',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      destructive: 'bg-destructive/10 text-destructive',
      info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    })[props.variant],
);
</script>
