<template>
  <div :class="['rounded-xl border border-border bg-card', paddingClass]">
    <div v-if="title || $slots.header" class="flex items-start justify-between gap-3" :class="{ 'mb-4': !$slots.header }">
      <slot name="header">
        <div>
          <h3 class="font-display text-base font-semibold text-foreground">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
        </div>
      </slot>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }>(),
  { padding: 'md' },
);

const paddingClass = computed(
  () => ({ none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' })[props.padding],
);
</script>
