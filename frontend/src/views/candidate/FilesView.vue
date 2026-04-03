<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-bold font-display text-foreground">Files</h1>
      <p class="text-sm mt-1 text-muted">Your saved CVs are listed here. Open in the editor or download as PDF.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16 text-muted">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" />
      <span class="text-sm">Loading files…</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="cvs.length === 0" class="rounded-xl border border-border bg-card">
      <div class="p-12 flex flex-col items-center justify-center gap-3 text-muted">
        <span class="mdi mdi-folder-outline text-5xl opacity-20" />
        <p class="text-sm font-medium text-foreground">No files yet</p>
        <p class="text-xs text-center max-w-xs text-muted">Save a CV from the CV Builder and it will appear here.</p>
        <router-link
          to="/candidate/cv"
          class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span class="mdi mdi-plus" />
          Create CV
        </router-link>
      </div>
    </div>

    <!-- CV list -->
    <div v-else class="space-y-3">
      <div
        v-for="cv in cvs"
        :key="cv.id"
        class="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
      >
        <!-- Icon -->
        <div class="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 border border-primary/15">
          <span class="mdi mdi-file-document-outline text-xl text-primary" />
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold truncate text-foreground">{{ cv.title }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-muted">{{ formatDate(cv.createdAt) }}</span>
            <span v-if="cv.style" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-secondary text-muted">
              {{ cv.style }}
            </span>
            <span v-if="cv.language" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted">
              {{ cv.language }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <router-link
            :to="`/candidate/cv?edit=${cv.id}`"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-secondary text-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span class="mdi mdi-pencil-outline text-sm" />
            Edit
          </router-link>
          <button
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors bg-secondary text-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :disabled="downloading === cv.id"
            @click="downloadPDF(cv)"
          >
            <span v-if="downloading === cv.id" class="mdi mdi-loading mdi-spin text-sm" />
            <span v-else class="mdi mdi-download-outline text-sm" />
            PDF
          </button>
          <button
            class="inline-flex items-center justify-center h-7 w-7 rounded-lg transition-colors bg-secondary text-muted hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            @click="confirmDelete(cv)"
          >
            <span class="mdi mdi-trash-can-outline text-sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm dialog -->
    <div v-if="deleteTarget" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
        <div class="flex items-start gap-3">
          <div class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10 border border-destructive/20">
            <span class="mdi mdi-trash-can-outline text-lg text-destructive" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Delete CV?</p>
            <p class="text-xs mt-0.5 text-muted">
              "<span class="font-medium text-foreground">{{ deleteTarget.title }}</span>" will be permanently deleted.
            </p>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-secondary text-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            @click="deleteTarget = null"
          >Cancel</button>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-destructive text-white hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            :disabled="deleting"
            @click="executeDelete"
          >
            <span v-if="deleting" class="mdi mdi-loading mdi-spin mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

interface CvFile {
  id: string;
  title: string;
  style: string | null;
  language: string | null;
  createdAt: string;
}

const loading = ref(true);
const cvs = ref<CvFile[]>([]);
const downloading = ref<string | null>(null);
const deleteTarget = ref<CvFile | null>(null);
const deleting = ref(false);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/cvs');
    cvs.value = data.data || [];
  } catch (err) {
    console.error('Failed to load CVs:', err);
  } finally {
    loading.value = false;
  }
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

async function downloadPDF(cv: CvFile) {
  downloading.value = cv.id;
  try {
    const res = await axios.get(`/api/cvs/${cv.id}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    downloading.value = null;
  }
}

function confirmDelete(cv: CvFile) {
  deleteTarget.value = cv;
}

async function executeDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await axios.delete(`/api/cvs/${deleteTarget.value.id}`);
    cvs.value = cvs.value.filter(c => c.id !== deleteTarget.value!.id);
    deleteTarget.value = null;
  } catch (err) {
    console.error('Failed to delete CV:', err);
  } finally {
    deleting.value = false;
  }
}
</script>
