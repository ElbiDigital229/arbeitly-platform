<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="closeOnBackdrop && close()">
      <div
        class="rounded-2xl border border-border bg-card p-6 w-full max-h-[85vh] overflow-y-auto space-y-4"
        :class="sizeClass"
        role="dialog"
        aria-modal="true"
      >
        <div v-if="title || $slots.header" class="flex items-start justify-between gap-3">
          <div>
            <slot name="header">
              <h3 class="font-display text-lg font-bold text-foreground">{{ title }}</h3>
              <p v-if="subtitle" class="text-sm text-muted-foreground mt-0.5">{{ subtitle }}</p>
            </slot>
          </div>
          <button
            v-if="showClose"
            @click="close"
            class="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <span class="mdi mdi-close text-xl" />
          </button>
        </div>

        <slot />

        <div v-if="$slots.footer" class="flex gap-2 justify-end pt-2">
          <slot name="footer" :close="close" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    showClose?: boolean;
  }>(),
  {
    size: 'md',
    closeOnBackdrop: true,
    closeOnEscape: true,
    showClose: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const sizeClass = computed(
  () =>
    ({
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    })[props.size],
);

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && props.closeOnEscape) close();
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

// Lock body scroll while open
watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
  },
);
</script>
