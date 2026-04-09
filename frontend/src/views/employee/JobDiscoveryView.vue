<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Job Discovery</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Shared job pool. Add jobs and match them to your candidates.</p>
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

    <!-- Match filter bar -->
    <div class="rounded-xl border border-border bg-card p-4 space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-foreground">Match for candidates</h3>
          <p class="text-xs text-muted-foreground mt-0.5">Pick one or more of your assigned candidates to score every job in the pool against them.</p>
        </div>
        <button v-if="selectedCandidateIds.length > 0" @click="clearSelection" class="text-xs text-muted-foreground hover:text-foreground">Clear</button>
      </div>
      <div v-if="candidates.length === 0" class="text-xs text-muted-foreground">No candidates assigned to you.</div>
      <div v-else class="flex flex-wrap gap-2">
        <button
          v-for="c in candidates"
          :key="c.id"
          @click="toggleCandidate(c.id)"
          :class="[
            'h-7 px-3 rounded-full text-xs font-medium border transition-colors',
            selectedCandidateIds.includes(c.id)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-foreground hover:bg-secondary/60'
          ]"
        >
          {{ c.profile?.firstName || c.email.split('@')[0] }} {{ c.profile?.lastName || '' }}
        </button>
      </div>
      <div v-if="selectedCandidateIds.length > 0" class="flex items-center gap-3 pt-2 border-t border-border">
        <label class="text-xs font-medium text-foreground shrink-0">Min score</label>
        <input type="range" min="0" max="100" step="5" v-model.number="minScore" class="flex-1 accent-primary" />
        <span class="text-xs font-semibold tabular-nums w-10 text-right" :class="minScore >= 70 ? 'text-primary' : 'text-muted-foreground'">{{ minScore }}%</span>
        <span v-if="matchLoading" class="text-xs text-muted-foreground"><span class="mdi mdi-loading mdi-spin" /> Scoring…</span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <div v-else-if="visibleJobs.length === 0" class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <span class="mdi mdi-briefcase-search-outline text-4xl opacity-20" />
      <p v-if="selectedCandidateIds.length > 0" class="text-sm">No jobs match the selected candidates at {{ minScore }}%+. Lower the threshold or pick different candidates.</p>
      <p v-else class="text-sm">No jobs in the pool yet. Add one to get started.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="job in visibleJobs" :key="job.id" class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-display text-base font-semibold text-foreground">{{ job.title }}</h3>
            <p class="text-sm text-primary">{{ job.company }}</p>
            <div class="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span v-if="job.location" class="flex items-center gap-1"><span class="mdi mdi-map-marker-outline" /> {{ job.location }}</span>
              <span v-if="job.salary" class="flex items-center gap-1"><span class="mdi mdi-cash" /> {{ job.salary }}</span>
              <span class="flex items-center gap-1"><span class="mdi mdi-account-outline" /> {{ job.addedBy?.email }}</span>
            </div>
            <p v-if="job.description" class="text-xs text-muted-foreground mt-2 line-clamp-2">{{ job.description }}</p>

            <!-- Per-candidate match badges (only when filter is active) -->
            <div v-if="job.matches && Object.keys(job.matches).length > 0" class="mt-3 space-y-2">
              <div class="flex flex-wrap gap-1.5">
                <template v-for="cid in selectedCandidateIds" :key="cid">
                  <div
                    v-if="job.matches[cid] && job.matches[cid].score >= minScore"
                    class="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border cursor-pointer"
                    :class="bandClasses(job.matches[cid].score)"
                    :title="topReasonText(job.matches[cid])"
                    @click="toggleMatchDetail(`${job.id}-${cid}`)"
                  >
                    <span class="truncate max-w-[100px]">{{ candidateNameMap[cid] }}</span>
                    <span class="font-bold tabular-nums">{{ job.matches[cid].score }}%</span>
                    <button
                      @click.stop="addToQueue(job.id, cid)"
                      :disabled="queuing[`${job.id}-${cid}`]"
                      class="ml-1 h-5 w-5 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      :title="`Add to ${candidateNameMap[cid]}'s queue`"
                    >
                      <span class="mdi mdi-plus text-sm leading-none" />
                    </button>
                  </div>
                </template>
              </div>
              <!-- Expanded breakdown for clicked badge -->
              <template v-for="cid in selectedCandidateIds" :key="'detail-'+cid">
                <MatchBreakdownCard
                  v-if="job.matches[cid] && expandedMatchKeys.has(`${job.id}-${cid}`)"
                  :match="job.matches[cid]"
                />
              </template>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button @click="showCandidates(job)" class="h-8 px-3 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
              <span class="mdi mdi-target" /> Match
            </button>
            <a v-if="job.url" :href="job.url" target="_blank" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60">
              <span class="mdi mdi-open-in-new text-sm" />
            </a>
            <button @click="removeJob(job.id)" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <span class="mdi mdi-trash-can-outline text-sm" />
            </button>
          </div>
        </div>

        <!-- Candidate matching panel -->
        <div v-if="matchingJobId === job.id" class="mt-4 pt-4 border-t border-border space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Your Candidates</h4>
          <div v-if="candidates.length === 0" class="text-xs text-muted-foreground">No candidates assigned to you.</div>
          <div v-for="c in candidates" :key="c.id" class="py-2 px-3 rounded-lg bg-secondary/30 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-foreground">{{ c.profile?.firstName }} {{ c.profile?.lastName }}</p>
                <p class="text-xs text-muted-foreground">{{ c.email }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="scores[`${job.id}-${c.id}`] !== undefined" class="text-xs font-semibold tabular-nums" :class="scores[`${job.id}-${c.id}`] >= 70 ? 'text-green-500' : scores[`${job.id}-${c.id}`] >= 40 ? 'text-yellow-500' : 'text-muted-foreground'">
                  {{ scores[`${job.id}-${c.id}`] }}%
                </span>
                <button @click="scoreCandidate(job.id, c.id)" :disabled="scoring[`${job.id}-${c.id}`]" class="h-7 px-2 rounded text-[10px] font-medium border border-border text-foreground hover:bg-secondary/60 disabled:opacity-50">
                  {{ scoring[`${job.id}-${c.id}`] ? '...' : 'Score' }}
                </button>
                <button @click="addToQueue(job.id, c.id)" :disabled="queuing[`${job.id}-${c.id}`]" class="h-7 px-2 rounded text-[10px] font-medium bg-primary text-primary-foreground disabled:opacity-50">
                  {{ queuing[`${job.id}-${c.id}`] ? '...' : 'Add to Queue' }}
                </button>
              </div>
            </div>
            <p v-if="reasonings[`${job.id}-${c.id}`]" class="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
              <span class="font-semibold text-foreground">AI reasoning:</span> {{ reasonings[`${job.id}-${c.id}`] }}
            </p>
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
            <p class="text-xs text-muted-foreground mt-0.5">Bulk add jobs to the shared pool. Max 500 per import.</p>
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
          <p class="text-[11px] text-muted-foreground mt-1">First row must be the header. Quoted fields with commas are supported.</p>
        </div>

        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Upload CSV file</label>
          <input ref="fileInput" type="file" accept=".csv,text/csv" @change="onFileChange" class="block w-full text-xs text-muted-foreground file:mr-3 file:h-9 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:font-medium hover:file:opacity-90" />
        </div>

        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Or paste CSV content</label>
          <textarea v-model="csvText" @input="parseCsv" rows="6" class="input-field font-mono text-xs resize-none" placeholder="title,company,location,url,description&#10;Senior Engineer,Acme,Berlin,https://...,Great role" />
        </div>

        <p v-if="importError" class="text-sm text-destructive">{{ importError }}</p>

        <div v-if="parsedJobs.length > 0" class="rounded-lg border border-border">
          <div class="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20">
            <p class="text-xs font-medium text-foreground">Preview — {{ parsedJobs.length }} job{{ parsedJobs.length !== 1 ? 's' : '' }} ready</p>
            <p v-if="skippedCount > 0" class="text-xs text-yellow-500">{{ skippedCount }} row{{ skippedCount !== 1 ? 's' : '' }} skipped (missing title/company)</p>
          </div>
          <div class="max-h-48 overflow-y-auto divide-y divide-border">
            <div v-for="(j, i) in parsedJobs.slice(0, 50)" :key="i" class="px-3 py-1.5 text-xs flex items-center gap-2">
              <span class="text-muted-foreground tabular-nums w-6">{{ i + 1 }}</span>
              <span class="font-medium text-foreground truncate flex-1">{{ j.title }}</span>
              <span class="text-primary truncate">{{ j.company }}</span>
              <span class="text-muted-foreground truncate">{{ j.location || '—' }}</span>
            </div>
            <div v-if="parsedJobs.length > 50" class="px-3 py-1.5 text-[11px] text-muted-foreground text-center">…and {{ parsedJobs.length - 50 }} more</div>
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
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';
import MatchBreakdownCard from '../../components/MatchBreakdownCard.vue';

const store = useEmployeeStore();
const headers = store.getAuthHeaders();

interface Factor {
  key: string;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  evidence: string;
}
interface MatchResult {
  score: number;
  band: 'excellent' | 'strong' | 'possible' | 'weak' | 'poor';
  factors: Factor[];
  topReasons: string[];
  topGaps: string[];
}
interface Job {
  id: string;
  title: string;
  company: string;
  url?: string;
  description?: string;
  location?: string;
  salary?: string;
  addedBy?: { email: string };
  _count?: { queueItems: number };
  matches?: Record<string, MatchResult>;
}

const jobs = ref<Job[]>([]);
const candidates = ref<any[]>([]);
const loading = ref(true);
const showDialog = ref(false);
const formError = ref('');
const saving = ref(false);
const matchingJobId = ref<string | null>(null);
const scores = ref<Record<string, number>>({});
const reasonings = ref<Record<string, string>>({});
const scoring = ref<Record<string, boolean>>({});
const queuing = ref<Record<string, boolean>>({});

// Multi-candidate match filter
const selectedCandidateIds = ref<string[]>([]);
const minScore = ref(70);
const matchedJobs = ref<Job[]>([]);
const matchLoading = ref(false);
const expandedMatchKeys = ref<Set<string>>(new Set());
function toggleMatchDetail(key: string) {
  const next = new Set(expandedMatchKeys.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  expandedMatchKeys.value = next;
}

const candidateNameMap = computed<Record<string, string>>(() => {
  const m: Record<string, string> = {};
  for (const c of candidates.value) {
    const fn = c.profile?.firstName || '';
    const ln = c.profile?.lastName || '';
    m[c.id] = (fn || ln) ? `${fn} ${ln}`.trim() : c.email.split('@')[0];
  }
  return m;
});

const visibleJobs = computed<Job[]>(() => {
  if (selectedCandidateIds.value.length === 0) return jobs.value;
  return matchedJobs.value;
});

function toggleCandidate(id: string) {
  const i = selectedCandidateIds.value.indexOf(id);
  if (i === -1) selectedCandidateIds.value.push(id);
  else selectedCandidateIds.value.splice(i, 1);
}

function clearSelection() {
  selectedCandidateIds.value = [];
  matchedJobs.value = [];
}

function bandClasses(score: number) {
  if (score >= 85) return 'bg-green-500/15 text-green-600 border-green-500/30';
  if (score >= 70) return 'bg-primary/15 text-primary border-primary/30';
  if (score >= 50) return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30';
  return 'bg-muted text-muted-foreground border-border';
}

function topReasonText(m: MatchResult): string {
  if (m.topReasons.length > 0) return m.topReasons.join(' • ');
  if (m.topGaps.length > 0) return 'Gaps: ' + m.topGaps.join(' • ');
  return `${m.band} match`;
}

async function fetchMatched() {
  if (selectedCandidateIds.value.length === 0) { matchedJobs.value = []; return; }
  matchLoading.value = true;
  try {
    const { data } = await api.get('/jobs/with-matches', {
      params: { candidateIds: selectedCandidateIds.value.join(','), minScore: minScore.value },
      headers,
    });
    // server returns [{ job, matches, bestScore }]; flatten into jobs with matches attached
    matchedJobs.value = (data.data || []).map((row: any) => ({ ...row.job, matches: row.matches }));
  } catch (e) {
    console.error('match fetch failed', e);
    matchedJobs.value = [];
  } finally {
    matchLoading.value = false;
  }
}

// Re-fetch whenever selection or threshold changes (debounced for slider)
let matchTimer: ReturnType<typeof setTimeout> | null = null;
watch([selectedCandidateIds, minScore], () => {
  if (matchTimer) clearTimeout(matchTimer);
  matchTimer = setTimeout(fetchMatched, 200);
}, { deep: true });

const form = ref({ title: '', company: '', url: '', description: '', location: '', salary: '', requirements: '' });

// CSV import state
const showImport = ref(false);
const csvText = ref('');
const parsedJobs = ref<Array<{ title: string; company: string; url?: string; description?: string; location?: string; salary?: string; requirements?: string }>>([]);
const skippedCount = ref(0);
const importError = ref('');
const importing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

function openImport() {
  showImport.value = true;
  csvText.value = '';
  parsedJobs.value = [];
  skippedCount.value = 0;
  importError.value = '';
}

function closeImport() {
  showImport.value = false;
  if (fileInput.value) fileInput.value.value = '';
}

function downloadTemplate() {
  const sample = 'title,company,location,salary,url,description,requirements\n' +
    '"Senior Frontend Engineer","Acme GmbH","Berlin, Germany","€70k–€90k","https://acme.com/jobs/123","Build the next-gen UI","React, TypeScript, 5+ years"\n' +
    '"Product Manager","Globex","Munich","€80k","","Lead the platform team","Agile, B2B SaaS"';
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

// RFC4180-ish CSV parser: handles quoted fields with commas, escaped quotes ("")
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

  // Split into rows respecting quoted newlines
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

  const headers = splitCsvLine(rows[0]).map((h) => h.toLowerCase().replace(/^"|"$/g, ''));
  const titleIdx = headers.indexOf('title');
  const companyIdx = headers.indexOf('company');
  if (titleIdx === -1 || companyIdx === -1) {
    importError.value = 'CSV must include "title" and "company" columns.';
    return;
  }
  const idx = (k: string) => headers.indexOf(k);
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

  if (parsedJobs.value.length > 500) {
    importError.value = `Too many jobs (${parsedJobs.value.length}). Maximum 500 per import.`;
    parsedJobs.value = [];
  }
}

async function importJobs() {
  if (parsedJobs.value.length === 0) return;
  importError.value = '';
  importing.value = true;
  try {
    const { data } = await api.post('/jobs/bulk', { jobs: parsedJobs.value }, { headers });
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
    const { data } = await api.get('/jobs', { headers });
    jobs.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
}

async function fetchCandidates() {
  try {
    const { data } = await api.get('/employee/candidates', { headers });
    candidates.value = data.data;
  } catch { /* no candidates */ }
}

onMounted(() => { fetchJobs(); fetchCandidates(); });

function openAdd() { form.value = { title: '', company: '', url: '', description: '', location: '', salary: '', requirements: '' }; formError.value = ''; showDialog.value = true; }

async function saveJob() {
  formError.value = '';
  saving.value = true;
  try {
    await api.post('/jobs', form.value, { headers });
    showDialog.value = false;
    await fetchJobs();
  } catch (e: any) {
    formError.value = e?.response?.data?.error || 'Failed to add job.';
  } finally { saving.value = false; }
}

async function removeJob(id: string) {
  if (!confirm('Delete this job?')) return;
  try { await api.delete(`/jobs/${id}`, { headers }); await fetchJobs(); } catch (e: any) { alert(e?.response?.data?.error || 'Failed.'); }
}

function showCandidates(job: Job) {
  matchingJobId.value = matchingJobId.value === job.id ? null : job.id;
}

async function scoreCandidate(jobId: string, candidateId: string) {
  const key = `${jobId}-${candidateId}`;
  scoring.value[key] = true;
  try {
    const { data } = await api.post(`/jobs/${jobId}/score/${candidateId}`, {}, { headers, timeout: 180000 });
    scores.value[key] = data.data.score;
    if (data.data.reasoning) reasonings.value[key] = data.data.reasoning;
  } catch { scores.value[key] = 0; }
  finally { scoring.value[key] = false; }
}

async function addToQueue(jobId: string, candidateId: string) {
  const key = `${jobId}-${candidateId}`;
  queuing.value[key] = true;
  try {
    await api.post(`/jobs/${jobId}/queue/${candidateId}`, {}, { headers, timeout: 180000 });
    alert('Job added to candidate queue! A tailored CV is being generated.');
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to add to queue.'); }
  finally { queuing.value[key] = false; }
}
</script>
