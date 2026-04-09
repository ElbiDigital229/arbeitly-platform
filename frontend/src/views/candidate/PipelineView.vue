<template>
  <div class="p-6 space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">My Pipeline</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">
          Jobs your employee is preparing applications for on your behalf.
        </p>
      </div>
      <button
        @click="load"
        class="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-white/5 transition-colors"
      >
        <span class="mdi mdi-refresh text-sm" />
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">Loading…</div>

    <div
      v-else-if="!items.length"
      class="border border-dashed border-border rounded-lg p-10 text-center"
    >
      <div class="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
        <span class="mdi mdi-timer-sand-empty text-2xl text-muted-foreground" />
      </div>
      <p class="text-sm font-medium text-foreground">No jobs in your pipeline yet</p>
      <p class="text-xs text-muted-foreground mt-1">
        When your employee queues a job for you, you'll see it here with the tailored CV and cover letter they prepared.
      </p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="border border-border rounded-lg p-4 bg-secondary/30"
      >
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-medium text-foreground text-sm">{{ item.job.title }}</h3>
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  statusClasses(item.status),
                ]"
              >
                <span class="mdi text-xs" :class="statusIcon(item.status)" />
                {{ statusLabel(item.status) }}
              </span>
              <span v-if="item.relevanceScore != null" class="text-[10px] text-muted-foreground">
                Match {{ Math.round(item.relevanceScore) }}%
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ item.job.company }}<span v-if="item.job.location"> · {{ item.job.location }}</span>
            </p>
            <p v-if="item.job.description" class="text-xs text-muted-foreground mt-2 line-clamp-2">
              {{ item.job.description }}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-[10px] text-muted-foreground">Queued</p>
            <p class="text-xs text-foreground">{{ formatDate(item.createdAt) }}</p>
            <p v-if="item.appliedAt" class="text-[10px] text-muted-foreground mt-1">Applied</p>
            <p v-if="item.appliedAt" class="text-xs text-foreground">{{ formatDate(item.appliedAt) }}</p>
          </div>
        </div>

        <div v-if="item.generatedCv || item.generatedCl" class="mt-3 flex flex-wrap gap-2">
          <router-link
            v-if="item.generatedCv"
            :to="`/candidate/cv?id=${item.generatedCv.id}`"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-white/5"
          >
            <span class="mdi mdi-file-document-outline text-sm" />
            Tailored CV
          </router-link>
          <button
            v-if="item.generatedCl"
            @click="openCl(item.generatedCl.content || '')"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-white/5"
          >
            <span class="mdi mdi-email-outline text-sm" />
            Tailored Cover Letter
          </button>
          <a
            v-if="item.application?.jobUrl"
            :href="item.application.jobUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-white/5"
          >
            <span class="mdi mdi-open-in-new text-sm" />
            Job posting
          </a>
        </div>
      </div>
    </div>

    <!-- CL preview modal -->
    <div
      v-if="viewingCl"
      @click.self="viewingCl = null"
      class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h3 class="font-medium text-foreground">Tailored Cover Letter</h3>
          <button @click="viewingCl = null" class="text-muted-foreground hover:text-foreground">
            <span class="mdi mdi-close text-lg" />
          </button>
        </div>
        <div class="p-4 overflow-y-auto">
          <pre class="text-xs text-foreground whitespace-pre-wrap font-sans">{{ clContent }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '../../services/api';

interface PipelineItem {
  id: string;
  status: string;
  relevanceScore: number | null;
  createdAt: string;
  appliedAt: string | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string | null;
    salary: string | null;
    url: string | null;
    description: string | null;
  };
  generatedCv: { id: string; title: string } | null;
  generatedCl: { id: string; title: string; content: string | null } | null;
  application: { id: string; status: string; appliedAt: string | null; jobUrl: string | null } | null;
}

const items = ref<PipelineItem[]>([]);
const loading = ref(false);
const viewingCl = ref<string | null>(null);
const clContent = ref('');

async function load() {
  loading.value = true;
  try {
    const res = await api.get('/applications/pipeline');
    items.value = res.data.data;
  } finally {
    loading.value = false;
  }
}

function openCl(content: string) {
  clContent.value = content;
  viewingCl.value = 'open';
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Tailoring…',
    NO_BASE_CV: 'Needs base CV',
    CV_FAILED: 'Tailoring failed',
    CV_GENERATED: 'CV ready',
    READY: 'Ready to apply',
    APPLIED: 'Applied',
  };
  return map[s] || s;
}

function statusIcon(s: string) {
  const map: Record<string, string> = {
    PENDING: 'mdi-timer-sand',
    NO_BASE_CV: 'mdi-alert-circle-outline',
    CV_FAILED: 'mdi-close-circle-outline',
    CV_GENERATED: 'mdi-check',
    READY: 'mdi-check-all',
    APPLIED: 'mdi-send-check',
  };
  return map[s] || 'mdi-circle-outline';
}

function statusClasses(s: string) {
  if (s === 'APPLIED') return 'bg-green-500/15 text-green-500 border border-green-500/25';
  if (s === 'READY') return 'bg-primary/15 text-primary border border-primary/25';
  if (s === 'CV_GENERATED') return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
  if (s === 'NO_BASE_CV' || s === 'CV_FAILED')
    return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
  return 'bg-secondary text-muted-foreground border border-border';
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

onMounted(load);
</script>
