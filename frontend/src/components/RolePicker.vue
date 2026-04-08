<template>
  <select
    :value="modelValue ?? ''"
    @change="onChange"
    class="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
  >
    <option value="">{{ placeholder }}</option>
    <optgroup v-for="(items, family) in grouped" :key="family" :label="familyLabel(String(family))">
      <option v-for="r in items" :key="r.id" :value="r.id">{{ r.name }}</option>
    </optgroup>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Role { id: string; name: string; family: string }
const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    roles: Role[];
    placeholder?: string;
  }>(),
  { placeholder: 'Select a role...' },
);
const emit = defineEmits<{ (e: 'update:modelValue', v: string | null): void }>();

const grouped = computed(() => {
  const out: Record<string, Role[]> = {};
  for (const r of props.roles) {
    (out[r.family] ??= []).push(r);
  }
  return out;
});

function familyLabel(family: string) {
  return family.charAt(0).toUpperCase() + family.slice(1);
}

function onChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  emit('update:modelValue', v || null);
}
</script>
