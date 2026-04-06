<template>
  <div class="flex flex-col border border-border rounded-xl overflow-hidden bg-[hsl(196_89%_7%)]">
    <!-- Toolbar -->
    <div v-if="!readOnly && editor" class="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-card shrink-0 flex-wrap">
      <button type="button" @click="editor.chain().focus().undo().run()" title="Undo" :class="tbtn()"><span class="mdi mdi-undo text-sm" /></button>
      <button type="button" @click="editor.chain().focus().redo().run()" title="Redo" :class="tbtn()"><span class="mdi mdi-redo text-sm" /></button>
      <div class="w-px h-5 bg-border mx-1 shrink-0" />
      <button type="button" @click="editor.chain().focus().toggleBold().run()" title="Bold" :class="tbtn(editor.isActive('bold'))"><span class="mdi mdi-format-bold text-sm" /></button>
      <button type="button" @click="editor.chain().focus().toggleItalic().run()" title="Italic" :class="tbtn(editor.isActive('italic'))"><span class="mdi mdi-format-italic text-sm" /></button>
      <button type="button" @click="editor.chain().focus().toggleUnderline().run()" title="Underline" :class="tbtn(editor.isActive('underline'))"><span class="mdi mdi-format-underline text-sm" /></button>
      <button type="button" @click="editor.chain().focus().toggleStrike().run()" title="Strikethrough" :class="tbtn(editor.isActive('strike'))"><span class="mdi mdi-format-strikethrough text-sm" /></button>
      <div class="w-px h-5 bg-border mx-1 shrink-0" />
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" title="Heading 1" :class="tbtn(editor.isActive('heading', { level: 1 }))"><span class="mdi mdi-format-header-1 text-sm" /></button>
      <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" title="Heading 2" :class="tbtn(editor.isActive('heading', { level: 2 }))"><span class="mdi mdi-format-header-2 text-sm" /></button>
      <div class="w-px h-5 bg-border mx-1 shrink-0" />
      <button type="button" @click="editor.chain().focus().toggleBulletList().run()" title="Bullet list" :class="tbtn(editor.isActive('bulletList'))"><span class="mdi mdi-format-list-bulleted text-sm" /></button>
      <button type="button" @click="editor.chain().focus().toggleOrderedList().run()" title="Numbered list" :class="tbtn(editor.isActive('orderedList'))"><span class="mdi mdi-format-list-numbered text-sm" /></button>
      <div class="w-px h-5 bg-border mx-1 shrink-0" />
      <button type="button" @click="editor.chain().focus().setTextAlign('left').run()" title="Align left" :class="tbtn(editor.isActive({ textAlign: 'left' }))"><span class="mdi mdi-format-align-left text-sm" /></button>
      <button type="button" @click="editor.chain().focus().setTextAlign('center').run()" title="Center" :class="tbtn(editor.isActive({ textAlign: 'center' }))"><span class="mdi mdi-format-align-center text-sm" /></button>
      <button type="button" @click="editor.chain().focus().setTextAlign('right').run()" title="Align right" :class="tbtn(editor.isActive({ textAlign: 'right' }))"><span class="mdi mdi-format-align-right text-sm" /></button>
    </div>
    <!-- Editor -->
    <div class="flex-1 overflow-y-auto px-5 py-4" :style="`min-height: ${minHeight}px`">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';

const props = withDefaults(defineProps<{
  modelValue: string;
  readOnly?: boolean;
  minHeight?: number;
}>(), { readOnly: false, minHeight: 150 });

const emit = defineEmits<{ (e: 'update:modelValue', val: string): void }>();

function plainToHtml(text: string): string {
  if (text.startsWith('<')) return text; // already HTML
  return text.split('\n').filter(l => l.trim()).map(l => {
    const t = l.trim();
    if (/^[•·\-+]/.test(t)) return `<li><p>${t.replace(/^[•·\-+]\s*/, '')}</p></li>`;
    if (t === t.toUpperCase() && t.length > 3) return `<h2>${t}</h2>`;
    return `<p>${t}</p>`;
  }).join('');
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight,
    Underline,
    Typography,
  ],
  content: plainToHtml(props.modelValue),
  editable: !props.readOnly,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
  },
  editorProps: {
    attributes: { class: 'rte-content focus:outline-none' },
  },
});

watch(() => props.modelValue, (val) => {
  if (!editor.value) return;
  const html = plainToHtml(val);
  if (editor.value.getHTML() !== html) {
    editor.value.commands.setContent(html, false);
  }
});

onBeforeUnmount(() => editor.value?.destroy());

function tbtn(active = false) {
  return `h-7 w-7 rounded-md flex items-center justify-center transition-colors shrink-0 ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`;
}
</script>
