<template>
  <button :type="type" :disabled="disabled || loading" :class="['inline-flex items-center justify-center gap-1.5 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed', sizeClass, variantClass]">
    <span v-if="loading" class="mdi mdi-loading mdi-spin" />
    <span v-else-if="icon" class="mdi" :class="`mdi-${icon}`" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
);

const sizeClass = computed(
  () =>
    ({
      xs: 'h-7 px-2 rounded text-[10px]',
      sm: 'h-8 px-3 rounded-lg text-xs',
      md: 'h-9 px-4 rounded-full text-sm',
      lg: 'h-11 px-6 rounded-full text-base',
    })[props.size],
);

const variantClass = computed(
  () =>
    ({
      primary: 'bg-primary text-primary-foreground hover:opacity-90',
      secondary: 'bg-secondary text-foreground hover:bg-secondary/80',
      outline: 'border border-border text-foreground hover:bg-secondary/60',
      ghost: 'text-foreground hover:bg-secondary/60',
      destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    })[props.variant],
);
</script>
