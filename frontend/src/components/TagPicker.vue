<template>
  <div class="relative" v-click-outside="close">
    <div
      class="min-h-10 w-full rounded-lg border border-border bg-background px-2 py-1.5 flex flex-wrap gap-1 cursor-text"
      @click="focusInput"
    >
      <span
        v-for="id in modelValue"
        :key="id"
        class="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5"
      >
        {{ nameFor(id) }}
        <button
          type="button"
          class="mdi mdi-close text-[12px] hover:text-destructive"
          @click.stop="remove(id)"
        />
      </span>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        :placeholder="modelValue.length ? '' : placeholder"
        class="flex-1 min-w-[60px] bg-transparent outline-none text-sm"
        @focus="open = true"
        @keydown.enter.prevent="selectFirst"
        @keydown.backspace="onBackspace"
      />
    </div>
    <div
      v-if="open && filtered.length"
      class="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
    >
      <button
        v-for="opt in filtered"
        :key="opt.id"
        type="button"
        class="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary/60"
        @click="add(opt.id)"
      >
        {{ opt.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Option { id: string; name: string }
const props = withDefaults(
  defineProps<{
    modelValue: string[];
    options: Option[];
    placeholder?: string;
  }>(),
  { placeholder: 'Type to search...' },
);
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>();

const open = ref(false);
const query = ref('');
const inputEl = ref<HTMLInputElement | null>(null);

const idToName = computed(() => {
  const m = new Map<string, string>();
  for (const o of props.options) m.set(o.id, o.name);
  return m;
});

function nameFor(id: string) {
  return idToName.value.get(id) ?? id;
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.options
    .filter((o) => !props.modelValue.includes(o.id))
    .filter((o) => !q || o.name.toLowerCase().includes(q))
    .slice(0, 50);
});

function add(id: string) {
  if (props.modelValue.includes(id)) return;
  emit('update:modelValue', [...props.modelValue, id]);
  query.value = '';
  inputEl.value?.focus();
}
function remove(id: string) {
  emit('update:modelValue', props.modelValue.filter((x) => x !== id));
}
function selectFirst() {
  if (filtered.value[0]) add(filtered.value[0].id);
}
function onBackspace() {
  if (!query.value && props.modelValue.length) {
    remove(props.modelValue[props.modelValue.length - 1]);
  }
}
function focusInput() {
  inputEl.value?.focus();
  open.value = true;
}
function close() {
  open.value = false;
}

const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    el.__clickOutsideHandler__ = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.__clickOutsideHandler__);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el.__clickOutsideHandler__);
  },
};
</script>
