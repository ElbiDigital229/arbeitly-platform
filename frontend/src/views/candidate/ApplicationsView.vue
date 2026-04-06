<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Applications</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">{{ filtered.length }} application{{ filtered.length !== 1 ? 's' : '' }} tracked</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- View toggle -->
        <div class="flex items-center rounded-lg p-0.5 gap-0.5 border border-border bg-secondary">
          <button
            v-for="mode in ['list', 'board']"
            :key="mode"
            @click="viewMode = mode as 'list'|'board'"
            :class="['h-7 w-7 rounded-md flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-primary', viewMode === mode ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5']"
          >
            <span class="mdi text-sm" :class="mode === 'list' ? 'mdi-view-list' : 'mdi-view-grid'" />
          </button>
        </div>
        <button
          @click="handleDownloadTemplate"
          class="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
        >
          <span class="mdi mdi-download text-sm" />
          Template
        </button>
        <button
          @click="csvFileInput?.click()"
          class="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
        >
          <span class="mdi mdi-upload text-sm" />
          Import
        </button>
        <input ref="csvFileInput" type="file" accept=".csv" class="hidden" @change="onCsvSelect" />
        <button
          @click="handleExportCsv"
          :disabled="apps.length === 0"
          class="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-white/5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
        >
          <span class="mdi mdi-download text-sm" />
          Export
        </button>
        <button
          @click="openAdd"
          class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-opacity"
        >
          <span class="mdi mdi-plus" />
          Add Application
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[180px] max-w-sm">
        <span class="mdi mdi-magnify absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
        <input
          v-model="search"
          placeholder="Search applications..."
          class="input-field pl-9"
        />
      </div>
      <select
        v-model="statusFilter"
        class="h-9 px-3 rounded-lg text-sm outline-none border border-border bg-[hsl(196_89%_9%)] text-foreground focus:ring-2 focus:ring-primary"
      >
        <option value="all">All Statuses</option>
        <option v-for="s in allStatuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" />
      <span class="text-sm">Loading applications...</span>
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="space-y-2">
      <div
        v-for="app in filtered"
        :key="app.id"
        class="flex items-center gap-4 p-4 rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg shrink-0 bg-secondary">
          <span class="mdi mdi-domain text-lg text-muted-foreground" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-medium text-sm text-foreground">{{ app.job }}</p>
            <span
              class="rounded-full px-2.5 py-0.5 text-[10px] font-medium shrink-0"
              :style="statusStyle(app.status)"
            >{{ statusLabels[app.status] }}</span>
          </div>
          <div class="flex items-center gap-3 mt-1 text-xs flex-wrap text-muted-foreground">
            <span class="font-medium">{{ app.company }}</span>
            <span>{{ formatDate(app.date) }}</span>
            <span v-if="app.salary" class="flex items-center gap-0.5"><span class="mdi mdi-currency-eur text-xs" />{{ app.salary }}</span>
            <a v-if="app.url" :href="app.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-primary hover:underline">
              <span class="mdi mdi-link-variant text-xs" />Job post
            </a>
            <span v-if="app.cvUsed" class="flex items-center gap-0.5"><span class="mdi mdi-file-document-outline text-xs" />{{ app.cvUsed }}</span>
          </div>
          <p v-if="app.nextAction" class="flex items-center gap-1 text-xs mt-1.5 text-muted-foreground">
            <span class="mdi mdi-message-outline text-xs shrink-0" />
            <span class="truncate">Next: {{ app.nextAction }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <select
            :value="app.status"
            @change="handleStatusChange(app.id, ($event.target as HTMLSelectElement).value as AppStatus)"
            class="h-7 px-2 rounded-lg text-xs outline-none border border-border bg-secondary text-foreground focus:ring-2 focus:ring-primary"
          >
            <option v-for="s in allStatuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
          </select>
          <button @click="openEdit(app)" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-pencil-outline text-sm text-muted-foreground" />
          </button>
          <button @click="handleDelete(app.id)" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-trash-can-outline text-sm text-destructive" />
          </button>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <span class="mdi mdi-briefcase-outline text-4xl opacity-30" />
        <p class="text-sm">No applications yet.</p>
        <button
          @click="openAdd"
          class="flex items-center gap-1 px-4 py-2 rounded-full text-xs border border-border text-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span class="mdi mdi-plus" /> Add your first application
        </button>
      </div>
    </div>

    <!-- Board / Kanban View -->
    <div v-else-if="!loading" class="overflow-x-auto -mx-6 px-6 pb-4">
      <div class="flex gap-3 min-w-max">
        <div v-for="col in allStatuses" :key="col" class="flex flex-col gap-2 w-60 flex-shrink-0">
          <div class="flex items-center justify-between px-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-foreground">{{ statusLabels[col] }}</span>
            <span class="flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1.5 bg-secondary text-foreground">
              {{ filtered.filter(a => a.status === col).length }}
            </span>
          </div>
          <div class="space-y-2 min-h-16">
            <div
              v-for="app in filtered.filter(a => a.status === col)"
              :key="app.id"
              class="rounded-xl border border-border bg-card p-3 space-y-2 transition-colors hover:border-primary/30"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium leading-snug text-foreground">{{ app.job }}</p>
                  <p class="text-xs mt-0.5 text-muted-foreground">{{ app.company }}</p>
                </div>
                <button @click="openEdit(app)" class="h-5 w-5 rounded flex items-center justify-center hover:bg-white/5 shrink-0 focus-visible:ring-2 focus-visible:ring-primary">
                  <span class="mdi mdi-pencil-outline text-xs text-muted-foreground" />
                </button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-muted-foreground">{{ formatDate(app.date) }}</span>
                <select
                  :value="app.status"
                  @change="handleStatusChange(app.id, ($event.target as HTMLSelectElement).value as AppStatus)"
                  class="h-6 px-1.5 rounded text-[10px] outline-none border border-border bg-secondary text-foreground focus:ring-2 focus:ring-primary"
                >
                  <option v-for="s in allStatuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
                </select>
              </div>
            </div>
            <div
              v-if="filtered.filter(a => a.status === col).length === 0"
              class="rounded-xl border border-dashed border-white/5 py-6 flex items-center justify-center"
            >
              <span class="text-[10px] text-white/20">Empty</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <div
      v-if="dialogOpen"
      class="modal-overlay"
      @click.self="dialogOpen = false"
    >
      <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-base font-bold text-foreground">{{ editingId ? 'Edit Application' : 'Add Application' }}</h2>
          <button @click="dialogOpen = false" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-close text-muted-foreground" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">Job Title *</label>
            <input v-model="form.job" placeholder="e.g. Software Engineer" required class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">Company *</label>
            <input v-model="form.company" placeholder="e.g. Acme GmbH" required class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">Job URL</label>
            <input v-model="form.url" placeholder="https://..." type="url" class="input-field" />
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">Status</label>
            <select v-model="form.status" class="input-field">
              <option v-for="s in allStatuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">Date</label>
            <input v-model="form.date" type="date" class="input-field" />
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">Salary</label>
            <input v-model="form.salary" placeholder="e.g. 60,000" class="input-field" />
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">Contact Person</label>
            <input v-model="form.contactPerson" placeholder="e.g. Anna Schmidt" class="input-field" />
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">Next Action</label>
            <input v-model="form.nextAction" placeholder="e.g. Follow up on Monday" class="input-field" />
          </div>
          <div>
            <label class="text-xs font-medium block mb-1 text-foreground">References</label>
            <input v-model="form.references" placeholder="e.g. John Doe" class="input-field" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">CV Used</label>
            <select v-model="form.cvUsed" class="input-field">
              <option value="">None</option>
              <option v-for="cv in cvOptions" :key="cv.id" :value="cv.title">{{ cv.title }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">Job Description</label>
            <textarea v-model="form.jobDescription" rows="3" placeholder="Paste the job description here..." class="input-field h-auto resize-none py-2" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium block mb-1 text-foreground">Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Any notes about this application..." class="input-field h-auto resize-none py-2" />
          </div>
        </div>

        <div
          v-if="duplicateWarning"
          class="px-3 py-2 rounded-lg text-xs bg-warning/10 text-warning border border-warning/20"
        >
          Possible duplicate detected. Click Save again to confirm.
        </div>

        <div class="flex justify-end gap-2">
          <button @click="dialogOpen = false" class="h-9 px-4 rounded-lg text-sm border border-border text-muted-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
          <button
            @click="handleSave"
            :disabled="!form.job.trim() || !form.company.trim()"
            class="h-9 px-5 rounded-lg text-sm font-medium disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
          >
            {{ editingId ? 'Update' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CSV Import Dialog -->
    <div
      v-if="importDialogOpen"
      class="modal-overlay"
      @click.self="importDialogOpen = false"
    >
      <div class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-base font-bold text-foreground">Import Applications</h2>
          <button @click="importDialogOpen = false" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-close text-muted-foreground" />
          </button>
        </div>
        <p class="text-xs text-muted-foreground">
          {{ csvPreview.length }} application{{ csvPreview.length !== 1 ? 's' : '' }} found in CSV.
          Expected columns: job, company, url, status, date, salary, contactPerson, nextAction, cvUsed, notes
        </p>
        <div class="max-h-48 overflow-y-auto rounded-lg border border-border">
          <div
            v-for="(row, i) in csvPreview.slice(0, 20)"
            :key="i"
            class="flex items-center gap-3 px-3 py-2 text-xs border-b border-white/5 text-foreground"
          >
            <span class="font-medium shrink-0 w-5 text-right text-muted-foreground">{{ i + 1 }}</span>
            <span class="font-medium">{{ row.job || row.jobtitle || row['job title'] || '---' }}</span>
            <span class="text-muted-foreground">at</span>
            <span>{{ row.company || row.companyname || row['company name'] || '---' }}</span>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="importDialogOpen = false" class="h-9 px-4 rounded-lg text-sm border border-border text-muted-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
          <button
            @click="handleCsvImport"
            :disabled="importing"
            class="h-9 px-5 rounded-lg text-sm font-medium disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
          >
            {{ importing ? 'Importing...' : `Import ${csvPreview.length} Applications` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import api from '../../services/api';

export type AppStatus = 'TO_APPLY' | 'APPLIED' | 'IN_PROGRESS' | 'INTERVIEW' | 'OFFER' | 'ACCEPTED' | 'REJECTED' | 'FAILED';

interface BoardApp {
  id: string;
  job: string;
  company: string;
  url?: string;
  notes?: string;
  status: AppStatus;
  date: string;
  salary?: string;
  contactPerson?: string;
  nextAction?: string;
  jobDescription?: string;
  cvUsed?: string;
  references?: string;
}

interface CvOption {
  id: string;
  title: string;
}

const statusLabels: Record<AppStatus, string> = {
  TO_APPLY: 'To Apply',
  APPLIED: 'Applied',
  IN_PROGRESS: 'In Progress',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

const allStatuses: AppStatus[] = ['TO_APPLY', 'APPLIED', 'IN_PROGRESS', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'FAILED'];

const statusColorMap: Record<AppStatus, string> = {
  TO_APPLY: 'hsl(var(--muted-foreground))',
  APPLIED: 'hsl(var(--info))',
  IN_PROGRESS: 'hsl(195 80% 60%)',
  INTERVIEW: 'hsl(var(--warning))',
  OFFER: 'hsl(270 60% 65%)',
  ACCEPTED: 'hsl(var(--success))',
  REJECTED: 'hsl(var(--destructive))',
  FAILED: 'hsl(30 80% 55%)',
};

const statusBgMap: Record<AppStatus, string> = {
  TO_APPLY: 'hsl(var(--muted-foreground) / 0.1)',
  APPLIED: 'hsl(var(--info) / 0.1)',
  IN_PROGRESS: 'hsl(195 80% 60% / 0.1)',
  INTERVIEW: 'hsl(var(--warning) / 0.1)',
  OFFER: 'hsl(270 60% 65% / 0.1)',
  ACCEPTED: 'hsl(var(--success) / 0.1)',
  REJECTED: 'hsl(var(--destructive) / 0.1)',
  FAILED: 'hsl(30 80% 55% / 0.1)',
};

function statusStyle(s: AppStatus) {
  return `background: ${statusBgMap[s]}; color: ${statusColorMap[s]};`;
}


function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

function mapFromApi(a: any): BoardApp {
  return {
    id: a.id,
    job: a.jobTitle,
    company: a.companyName,
    url: a.jobUrl || undefined,
    notes: a.notes || undefined,
    status: a.status as AppStatus,
    date: a.appliedAt ? a.appliedAt.split('T')[0] : a.createdAt.split('T')[0],
    salary: a.salary || undefined,
    contactPerson: a.contactPerson || undefined,
    nextAction: a.nextAction || undefined,
    jobDescription: a.jobDescription || undefined,
    cvUsed: a.cvUsed || undefined,
    references: a.references || undefined,
  };
}

// State
const apps = ref<BoardApp[]>([]);
const loading = ref(true);

const search = ref('');
const statusFilter = ref('all');
const viewMode = ref<'list' | 'board'>('board');
const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const duplicateWarning = ref(false);

const emptyForm = () => ({
  job: '',
  company: '',
  url: '',
  status: 'TO_APPLY' as AppStatus,
  date: new Date().toISOString().split('T')[0],
  notes: '',
  salary: '',
  contactPerson: '',
  nextAction: '',
  jobDescription: '',
  cvUsed: '',
  references: '',
});

const form = reactive(emptyForm());

// CV options for the "CV Used" dropdown
const cvOptions = ref<CvOption[]>([]);
// CSV import
const csvFileInput = ref<HTMLInputElement | null>(null);
const importDialogOpen = ref(false);
const csvPreview = ref<any[]>([]);
const importing = ref(false);

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return apps.value.filter(a => {
    const matchSearch = a.job.toLowerCase().includes(q) || a.company.toLowerCase().includes(q);
    const matchStatus = statusFilter.value === 'all' || a.status === statusFilter.value;
    return matchSearch && matchStatus;
  });
});

onMounted(async () => {
  try {
    const [appsRes, cvsRes] = await Promise.all([
      api.get('/applications'),
      api.get('/cvs').catch(() => ({ data: { data: [] } })),
    ]);
    apps.value = (appsRes.data.data || []).map(mapFromApi);
    cvOptions.value = (cvsRes.data.data || []).map((cv: any) => ({ id: cv.id, title: cv.title }));
  } catch (err) {
    console.error('Failed to load applications:', err);
  } finally {
    loading.value = false;
  }
});

function openAdd() {
  editingId.value = null;
  Object.assign(form, emptyForm());
  duplicateWarning.value = false;
  dialogOpen.value = true;
}

function openEdit(app: BoardApp) {
  editingId.value = app.id;
  Object.assign(form, {
    job: app.job,
    company: app.company,
    url: app.url ?? '',
    status: app.status,
    date: app.date,
    notes: app.notes ?? '',
    salary: app.salary ?? '',
    contactPerson: app.contactPerson ?? '',
    nextAction: app.nextAction ?? '',
    jobDescription: app.jobDescription ?? '',
    cvUsed: app.cvUsed ?? '',
    references: app.references ?? '',
  });
  duplicateWarning.value = false;
  dialogOpen.value = true;
}

async function handleSave() {
  if (!form.job.trim() || !form.company.trim()) return;

  const payload = {
    jobTitle: form.job.trim(),
    companyName: form.company.trim(),
    jobUrl: form.url.trim() || '',
    status: form.status,
    appliedAt: form.date || undefined,
    notes: form.notes.trim() || undefined,
    salary: form.salary.trim() || undefined,
    contactPerson: form.contactPerson.trim() || undefined,
    nextAction: form.nextAction.trim() || undefined,
    jobDescription: form.jobDescription.trim() || undefined,
    cvUsed: form.cvUsed || undefined,
    references: form.references.trim() || undefined,
  };

  if (editingId.value) {
    try {
      const { data } = await api.put(`/applications/${editingId.value}`, payload);
      const idx = apps.value.findIndex(a => a.id === editingId.value);
      if (idx >= 0) apps.value[idx] = mapFromApi(data.data);
    } catch (err) {
      console.error('Failed to update application:', err);
    }
  } else {
    const isDuplicate = apps.value.some(
      a => a.company.toLowerCase() === form.company.trim().toLowerCase() && a.job.toLowerCase() === form.job.trim().toLowerCase()
    );
    if (isDuplicate && !duplicateWarning.value) {
      duplicateWarning.value = true;
      return;
    }
    try {
      const { data } = await api.post('/applications', payload);
      apps.value.unshift(mapFromApi(data.data));
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  }

  dialogOpen.value = false;
  editingId.value = null;
  duplicateWarning.value = false;
}

async function handleDelete(id: string) {
  try {
    await api.delete(`/applications/${id}`);
    apps.value = apps.value.filter(a => a.id !== id);
  } catch (err) {
    console.error('Failed to delete application:', err);
  }
}

// ── CSV Export / Template ────────────────────────────────────────────────────
const CSV_COLUMNS = ['job', 'company', 'url', 'status', 'date', 'salary', 'contactPerson', 'nextAction', 'notes'] as const;

function handleExportCsv() {
  const header = CSV_COLUMNS.join(',');
  const rows = apps.value.map(a => CSV_COLUMNS.map(col => {
    const val = (a as Record<string, unknown>)[col] ?? '';
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(','));
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = 'applications_export.csv';
  el.click();
  URL.revokeObjectURL(url);
}

function handleDownloadTemplate() {
  const csv = CSV_COLUMNS.join(',') + '\n' + `"Software Engineer","Acme GmbH","https://example.com","TO_APPLY","${new Date().toISOString().split('T')[0]}","60000","Jane Smith","Send CV","Great opportunity"`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = 'applications_template.csv';
  el.click();
  URL.revokeObjectURL(url);
}

// ── CSV Import ──────────────────────────────────────────────────────────────
function onCsvSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  (e.target as HTMLInputElement).value = '';
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: any = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row;
    });
    csvPreview.value = rows;
    importDialogOpen.value = true;
  };
  reader.readAsText(file);
}

async function handleCsvImport() {
  if (csvPreview.value.length === 0) return;
  importing.value = true;
  const mapped = csvPreview.value.map((row: any) => ({
    jobTitle: row.job || row.jobtitle || row['job title'] || '',
    companyName: row.company || row.companyname || row['company name'] || '',
    jobUrl: row.url || row.joburl || row['job url'] || '',
    status: (row.status || 'TO_APPLY').toUpperCase().replace(/[\s-]/g, '_'),
    appliedAt: row.date || row.appliedat || undefined,
    salary: row.salary || '',
    contactPerson: row.contactperson || row['contact person'] || '',
    nextAction: row.nextaction || row['next action'] || '',
    cvUsed: row.cvused || row['cv used'] || '',
    notes: row.notes || '',
  })).filter((r: any) => r.jobTitle && r.companyName);

  try {
    const { data } = await api.post('/applications/bulk', { applications: mapped });
    const newApps = (data.data || []).map(mapFromApi);
    apps.value = [...newApps, ...apps.value];
  } catch (err) {
    console.error('Bulk import failed:', err);
  } finally {
    importing.value = false;
    importDialogOpen.value = false;
    csvPreview.value = [];
  }
}

async function handleStatusChange(id: string, status: AppStatus) {
  const app = apps.value.find(a => a.id === id);
  if (!app) return;
  const prev = app.status;
  app.status = status; // optimistic update
  try {
    await api.put(`/applications/${id}`, { status });
  } catch (err) {
    app.status = prev; // revert on failure
    console.error('Failed to update status:', err);
  }
}
</script>
