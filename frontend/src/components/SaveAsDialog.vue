<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="cancel">
    <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-md space-y-5 shadow-xl">
      <div>
        <h3 class="font-display text-base font-semibold text-foreground">Save {{ kindLabel }}</h3>
        <p class="text-xs text-muted-foreground mt-0.5">Choose how to organise this {{ kindLabel.toLowerCase() }}.</p>
      </div>

      <!-- Mode picker -->
      <div class="space-y-2">
        <button
          type="button"
          class="w-full text-left rounded-xl border-2 p-3 transition-colors"
          :class="mode === 'version' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'"
          @click="mode = 'version'"
        >
          <div class="flex items-start gap-2">
            <span class="mdi mdi-folder-plus-outline text-base mt-0.5" :class="mode === 'version' ? 'text-primary' : 'text-muted-foreground'" />
            <div class="flex-1">
              <p class="text-sm font-semibold text-foreground">New Version</p>
              <p class="text-[11px] text-muted-foreground mt-0.5">Top-level entry. Use for a new industry, role family, or theme.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          class="w-full text-left rounded-xl border-2 p-3 transition-colors"
          :class="mode === 'variant' ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80'"
          :disabled="versions.length === 0"
          @click="versions.length > 0 && (mode = 'variant')"
        >
          <div class="flex items-start gap-2">
            <span class="mdi mdi-file-tree-outline text-base mt-0.5" :class="mode === 'variant' ? 'text-primary' : 'text-muted-foreground'" />
            <div class="flex-1">
              <p class="text-sm font-semibold" :class="versions.length === 0 ? 'text-muted-foreground/50' : 'text-foreground'">
                Variant of an existing version
              </p>
              <p class="text-[11px] text-muted-foreground mt-0.5">
                {{ versions.length === 0 ? 'No versions yet — create one first.' : 'Tailored sub-version, e.g. "Fintech SaaS" under "SaaS Industry".' }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- Parent picker (only when variant) -->
      <div v-if="mode === 'variant'">
        <label class="text-xs block mb-1.5 text-muted-foreground">Parent version</label>
        <select v-model="parentId" class="input-field w-full">
          <option v-for="v in versions" :key="v.id" :value="v.id">{{ v.title }}</option>
        </select>
      </div>

      <!-- Name input -->
      <div>
        <label class="text-xs block mb-1.5 text-muted-foreground">Name</label>
        <input
          v-model="name"
          :placeholder="mode === 'variant' ? 'e.g. Fintech SaaS' : 'e.g. SaaS Industry'"
          class="input-field w-full"
          @keydown.enter="confirm"
        />
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80" @click="cancel">
          Cancel
        </button>
        <button
          class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          :disabled="!canSave"
          @click="confirm"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface VersionOption {
  id: string;
  title: string;
}

const props = defineProps<{
  modelValue: boolean;
  kind: 'cv' | 'cl';
  versions: VersionOption[];
  initialName?: string;
  initialMode?: 'version' | 'variant';
  initialParentId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'save', payload: { name: string; mode: 'version' | 'variant'; parentId: string | null }): void;
}>();

const kindLabel = computed(() => (props.kind === 'cv' ? 'CV' : 'Cover Letter'));
const mode = ref<'version' | 'variant'>('version');
const name = ref('');
const parentId = ref<string | null>(null);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      mode.value = props.initialMode ?? 'version';
      name.value = props.initialName ?? '';
      parentId.value = props.initialParentId ?? props.versions[0]?.id ?? null;
      if (mode.value === 'variant' && props.versions.length === 0) {
        mode.value = 'version';
      }
    }
  },
  { immediate: true },
);

const canSave = computed(() => {
  if (!name.value.trim()) return false;
  if (mode.value === 'variant' && !parentId.value) return false;
  return true;
});

function cancel() {
  emit('update:modelValue', false);
}

function confirm() {
  if (!canSave.value) return;
  emit('save', {
    name: name.value.trim(),
    mode: mode.value,
    parentId: mode.value === 'variant' ? parentId.value : null,
  });
  emit('update:modelValue', false);
}
</script>
