<template>
  <div class="flex items-center gap-3">
    <template v-for="(stepLabel, i) in steps" :key="i">
      <div class="flex items-center gap-2">
        <div
          class="h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
          :style="stepStyle(i)"
        >
          <span v-if="completed.includes(i)" class="mdi mdi-check text-xs" />
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span
          class="text-sm"
          :class="i === current ? 'text-foreground font-medium' : 'text-muted-foreground'"
        >{{ stepLabel }}</span>
      </div>
      <div v-if="i < steps.length - 1" class="flex-1 h-px bg-border" />
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  steps: string[];
  current: number;
  completed?: number[];
}>(), { completed: () => [] });

function stepStyle(i: number) {
  if (props.completed.includes(i)) {
    return 'background: rgba(14,165,233,0.2); color: hsl(var(--primary));';
  }
  if (i === props.current) {
    return 'background: hsl(var(--primary)); color: #fff;';
  }
  return 'background: transparent; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border));';
}
</script>
