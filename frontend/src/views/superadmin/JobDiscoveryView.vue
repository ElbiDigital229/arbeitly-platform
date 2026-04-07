<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Job Discovery</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Global job pool. Add jobs and score them against any candidate using the active matching prompt.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="openImport" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium border border-border text-foreground hover:bg-secondary/60">
          <span class="mdi mdi-file-upload-outline" /> Import CSV
        </button>
        <button @click="openAdd" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          <span class="mdi mdi-plus" /> Add Job
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <div v-else-if="jobs.length === 0" class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <span class="mdi mdi-briefcase-search-outline text-4xl opacity-20" />
      <p class="text-sm">No jobs in the pool yet. Add one to get started.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="job in jobs" :key="job.id" class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-display text-base font-semibold text-foreground">{{ job.title }}</h3>
            <p class="text-sm text-primary">{{ job.company }}</p>
            <div class="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span v-if="job.location" class="flex items-center gap-1"><span class="mdi mdi-map-marker-outline" /> {{ job.location }}</span>
              <span v-if="job.salary" class="flex items-center gap-1"><span class="mdi mdi-cash" /> {{ job.salary }}</span>
              <span v-if="job.addedBy?.email" class="flex items-center gap-1"><span class="mdi mdi-account-outline" /> {{ job.addedBy.email }}</span>
              <span class="flex items-center gap-1"><span class="mdi mdi-calendar-outline" /> {{ formatDate(job.createdAt) }}</span>
            </div>
            <p v-if="job.description" class="text-xs text-muted-foreground mt-2 line-clamp-2">{{ job.description }}</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button @click="toggleMatch(job)" class="h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <span class="mdi mdi-target mr-1" /> Score
            </button>
            <a v-if="job.url" :href="job.url" target="_blank" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60">
              <span class="mdi mdi-open-in-new text-sm" />
            </a>
            <button @click="removeJob(job.id)" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <span class="mdi mdi-trash-can-outline text-sm" />
            </button>
          </div>
        </div>

        <!-- Candidate scoring panel -->
        <div v-if="matchingJobId === job.id" class="mt-4 pt-4 border-t border-border space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-foreground">All Candidates</h4>
            <input v-model="candidateSearch" placeholder="Search candidates..." class="h-7 rounded-md bg-secondary border-none text-xs px-2 outline-none w-48" />
          </div>
          <div v-if="filteredCandidates.length === 0" class="text-xs text-muted-foreground">No candidates match.</div>
          <div class="max-h-80 overflow-y-auto space-y-1">
            <div v-for="c in filteredCandidates" :key="c.id" class="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-foreground truncate">{{ candidateName(c) }}</p>
                <p class="text-xs text-muted-foreground truncate">{{ c.email }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="scores[`${job.id}-${c.id}`] !== undefined" class="text-xs font-semibold tabular-nums" :class="scores[`${job.id}-${c.id}`] >= 70 ? 'text-green-500' : scores[`${job.id}-${c.id}`] >= 40 ? 'text-yellow-500' : 'text-muted-foreground'">
                  {{ scores[`${job.id}-${c.id}`] }}%
                </span>
                <button @click="scoreCandidate(job.id, c.id)" :disabled="scoring[`${job.id}-${c.id}`]" class="h-7 px-2 rounded text-[10px] font-medium border border-border text-foreground hover:bg-secondary/60 disabled:opacity-50">
                  {{ scoring[`${job.id}-${c.id}`] ? '...' : 'Score' }}
                </button>
              </div>
            </div>
          </div>
          <div v-if="reasonings[matchingJobId]" class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground whitespace-pre-wrap">
            <p class="font-semibold mb-1">Last reasoning:</p>{{ reasonings[matchingJobId] }}
          </div>
        </div>
      </div>
    </div>

    <!-- Import CSV dialog -->
    <div v-if="showImport" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-display text-lg font-bold text-foreground">Import Jobs from CSV</h3>
            <p class="text-xs text-muted-foreground mt-0.5">Bulk add jobs to the global pool. Max 500 per import.</p>
          </div>
          <button @click="downloadTemplate" class="h-8 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60 shrink-0">
            <span class="mdi mdi-download" /> Template
          </button>
        </div>
        <div class="rounded-lg border border-border bg-secondary/20 p-3">
          <p class="text-xs text-muted-foreground">
            <span class="font-medium text-foreground">Required columns:</span> title, company.
            <span class="font-medium text-foreground">Optional:</span> url, location, salary, description, requirements.
          </p>
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Upload CSV file</label>
          <input ref="fileInput" type="file" accept=".csv,text/csv" @change="onFileChange" class="block w-full text-xs text-muted-foreground file:mr-3 file:h-9 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-medium hover:file:opacity-90" />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Or paste CSV content</label>
          <textarea v-model="csvText" @input="parseCsv" rows="6" class="input-field font-mono text-xs resize-none" placeholder="title,company,location,url,description" />
        </div>
        <p v-if="importError" class="text-sm text-destructive">{{ importError }}</p>
        <div v-if="parsedJobs.length > 0" class="rounded-lg border border-border">
          <div class="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20">
            <p class="text-xs font-medium text-foreground">Preview — {{ parsedJobs.length }} job{{ parsedJobs.length !== 1 ? 's' : '' }} ready</p>
            <p v-if="skippedCount > 0" class="text-xs text-yellow-500">{{ skippedCount }} row{{ skippedCount !== 1 ? 's' : '' }} skipped</p>
          </div>
          <div class="max-h-48 overflow-y-auto divide-y divide-border">
            <div v-for="(j, i) in parsedJobs.slice(0, 50)" :key="i" class="px-3 py-1.5 text-xs flex items-center gap-2">
              <span class="text-muted-foreground tabular-nums w-6">{{ i + 1 }}</span>
              <span class="font-medium text-foreground truncate flex-1">{{ j.title }}</span>
              <span class="text-primary truncate">{{ j.company }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="closeImport" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="importJobs" :disabled="importing || parsedJobs.length === 0" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ importing ? 'Importing...' : `Import ${parsedJobs.length || ''} jobs` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Job dialog -->
    <div v-if="showDialog" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">Add Job</h3>
        <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Job Title *</label><input v-model="form.title" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Company *</label><input v-model="form.company" class="input-field" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Location</label><input v-model="form.location" class="input-field" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Salary</label><input v-model="form.salary" class="input-field" /></div>
          </div>
          <div><label class="text-sm font-medium text-foreground block mb-1">URL</label><input v-model="form.url" class="input-field" placeholder="https://..." /></div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Description</label><textarea v-model="form.description" rows="4" class="input-field resize-none" /></div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Requirements</label><textarea v-model="form.requirements" rows="3" class="input-field resize-none" /></div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="showDialog = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="saveJob" :disabled="saving" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">{{ saving ? 'Saving...' : 'Add Job' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const headers = computed(() => store.getAuthHeaders());

interface Job { id: string; title: string; company: string; url?: string; description?: string; location?: string; salary?: string; addedBy?: { email: string }; createdAt: string; }

const jobs = ref<Job[]>([]);
const candidates = ref<any[]>([]);
const candidateSearch = ref('');
const loading = ref(true);
const showDialog = ref(false);
const formError = ref('');
const saving = ref(false);
const matchingJobId = ref<string | null>(null);
const scores = ref<Record<string, number>>({});
const reasonings = ref<Record<string, string>>({});
const scoring = ref<Record<string, boolean>>({});

const form = ref({ title: '', company: '', url: '', description: '', location: '', salary: '', requirements: '' });

// CSV import state
const showImport = ref(false);
const csvText = ref('');
const parsedJobs = ref<Array<{ title: string; company: string; url?: string; description?: string; location?: string; salary?: string; requirements?: string }>>([]);
const skippedCount = ref(0);
const importError = ref('');
const importing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const filteredCandidates = computed(() => {
  const q = candidateSearch.value.trim().toLowerCase();
  if (!q) return candidates.value;
  return candidates.value.filter((c: any) => {
    const name = candidateName(c).toLowerCase();
    return name.includes(q) || (c.email || '').toLowerCase().includes(q);
  });
});

function candidateName(c: any): string {
  const p = c.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return c.email?.split('@')[0] || c.email || '—';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function openImport() { showImport.value = true; csvText.value = ''; parsedJobs.value = []; skippedCount.value = 0; importError.value = ''; }
function closeImport() { showImport.value = false; if (fileInput.value) fileInput.value.value = ''; }

function downloadTemplate() {
  const sample = 'title,company,location,salary,url,description,requirements\n' +
    '"Senior Frontend Engineer","Acme GmbH","Berlin, Germany","€70k–€90k","https://acme.com/jobs/123","Build the next-gen UI","React, TypeScript, 5+ years"';
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'job-import-template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { csvText.value = String(reader.result || ''); parseCsv(); };
  reader.readAsText(file);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cur += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv() {
  importError.value = '';
  parsedJobs.value = [];
  skippedCount.value = 0;
  const text = csvText.value.trim();
  if (!text) return;

  const rows: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; cur += ch; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur) { rows.push(cur); cur = ''; }
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else { cur += ch; }
  }
  if (cur) rows.push(cur);
  if (rows.length < 2) { importError.value = 'CSV must contain a header row and at least one data row.'; return; }

  const headerCells = splitCsvLine(rows[0]).map((h) => h.toLowerCase().replace(/^"|"$/g, ''));
  const titleIdx = headerCells.indexOf('title');
  const companyIdx = headerCells.indexOf('company');
  if (titleIdx === -1 || companyIdx === -1) { importError.value = 'CSV must include "title" and "company" columns.'; return; }
  const idx = (k: string) => headerCells.indexOf(k);
  const urlIdx = idx('url');
  const locIdx = idx('location');
  const salIdx = idx('salary');
  const descIdx = idx('description');
  const reqIdx = idx('requirements');

  for (let r = 1; r < rows.length; r++) {
    const cells = splitCsvLine(rows[r]);
    const title = cells[titleIdx] || '';
    const company = cells[companyIdx] || '';
    if (!title || !company) { skippedCount.value++; continue; }
    const job: any = { title, company };
    if (urlIdx !== -1 && cells[urlIdx]) job.url = cells[urlIdx];
    if (locIdx !== -1 && cells[locIdx]) job.location = cells[locIdx];
    if (salIdx !== -1 && cells[salIdx]) job.salary = cells[salIdx];
    if (descIdx !== -1 && cells[descIdx]) job.description = cells[descIdx];
    if (reqIdx !== -1 && cells[reqIdx]) job.requirements = cells[reqIdx];
    parsedJobs.value.push(job);
  }

  if (parsedJobs.value.length > 500) { importError.value = `Too many jobs (${parsedJobs.value.length}). Maximum 500 per import.`; parsedJobs.value = []; }
}

async function importJobs() {
  if (parsedJobs.value.length === 0) return;
  importError.value = '';
  importing.value = true;
  try {
    const { data } = await api.post('/jobs/bulk', { jobs: parsedJobs.value }, { headers: headers.value });
    closeImport();
    await fetchJobs();
    alert(`Imported ${data.data.created} job${data.data.created !== 1 ? 's' : ''} successfully.`);
  } catch (e: any) {
    importError.value = e?.response?.data?.error || 'Import failed.';
  } finally { importing.value = false; }
}

async function fetchJobs() {
  loading.value = true;
  try {
    const { data } = await api.get('/jobs', { headers: headers.value });
    jobs.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
}

async function fetchCandidates() {
  try {
    const { data } = await api.get('/admin/candidates', { headers: headers.value });
    candidates.value = data.data || [];
  } catch { /* none */ }
}

onMounted(() => { fetchJobs(); fetchCandidates(); });

function openAdd() { form.value = { title: '', company: '', url: '', description: '', location: '', salary: '', requirements: '' }; formError.value = ''; showDialog.value = true; }

async function saveJob() {
  formError.value = '';
  saving.value = true;
  try {
    await api.post('/jobs', form.value, { headers: headers.value });
    showDialog.value = false;
    await fetchJobs();
  } catch (e: any) {
    formError.value = e?.response?.data?.error || 'Failed to add job.';
  } finally { saving.value = false; }
}

async function removeJob(id: string) {
  if (!confirm('Delete this job?')) return;
  try { await api.delete(`/jobs/${id}`, { headers: headers.value }); await fetchJobs(); } catch (e: any) { alert(e?.response?.data?.error || 'Failed.'); }
}

function toggleMatch(job: Job) {
  matchingJobId.value = matchingJobId.value === job.id ? null : job.id;
}

async function scoreCandidate(jobId: string, candidateId: string) {
  const key = `${jobId}-${candidateId}`;
  scoring.value[key] = true;
  try {
    const { data } = await api.post(`/jobs/${jobId}/score/${candidateId}`, {}, { headers: headers.value, timeout: 180000 });
    scores.value[key] = data.data.score;
    if (data.data.reasoning) reasonings.value[jobId] = data.data.reasoning;
  } catch { scores.value[key] = 0; }
  finally { scoring.value[key] = false; }
}
</script>
