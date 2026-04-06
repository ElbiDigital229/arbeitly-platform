<template>
  <div class="h-32 rounded-t-lg overflow-hidden p-3 space-y-1.5" style="background: #fff;">
    <div class="h-2.5 rounded-sm bg-slate-800" style="width: 60%;" />
    <div class="h-1.5 rounded-sm bg-slate-400/50" style="width: 45%;" />
    <div class="mt-2 h-0.5 rounded" :style="`background: ${accent}; width: 100%;`" />
    <div class="h-1.5 rounded-sm" :style="`background: ${accent}99; width: 30%; margin-top: 4px;`" />
    <div class="h-1 rounded-sm bg-slate-200" />
    <div class="h-1 rounded-sm bg-slate-200" style="width: 85%;" />
    <div class="h-1 rounded-sm bg-slate-200" style="width: 90%;" />
    <div class="mt-1 h-0.5 rounded" :style="`background: ${accent}; width: 100%;`" />
    <div class="h-1.5 rounded-sm" :style="`background: ${accent}99; width: 30%; margin-top: 4px;`" />
    <div class="h-1 rounded-sm bg-slate-200" />
    <div class="h-1 rounded-sm bg-slate-200" style="width: 75%;" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ style: 'modern' | 'classic' | 'minimal' }>();

const accent = computed(() => {
  if (props.style === 'modern') return '#0ea5e9';
  if (props.style === 'classic') return '#1a1a1a';
  return '#aaa';
});
</script>
