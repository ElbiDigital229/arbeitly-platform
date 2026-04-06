<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Job Discovery</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Shared job pool. Add jobs and match them to your candidates.</p>
      </div>
      <button @click="openAdd" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Job
      </button>
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
              <span class="flex items-center gap-1"><span class="mdi mdi-account-outline" /> {{ job.addedBy?.email }}</span>
            </div>
            <p v-if="job.description" class="text-xs text-muted-foreground mt-2 line-clamp-2">{{ job.description }}</p>
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
          <div v-for="c in candidates" :key="c.id" class="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
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
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const headers = store.getAuthHeaders();

interface Job { id: string; title: string; company: string; url?: string; description?: string; location?: string; salary?: string; addedBy?: { email: string }; _count?: { queueItems: number }; }

const jobs = ref<Job[]>([]);
const candidates = ref<any[]>([]);
const loading = ref(true);
const showDialog = ref(false);
const formError = ref('');
const saving = ref(false);
const matchingJobId = ref<string | null>(null);
const scores = ref<Record<string, number>>({});
const scoring = ref<Record<string, boolean>>({});
const queuing = ref<Record<string, boolean>>({});

const form = ref({ title: '', company: '', url: '', description: '', location: '', salary: '', requirements: '' });

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
    const { data } = await api.post(`/jobs/${jobId}/score/${candidateId}`, {}, { headers });
    scores.value[key] = data.data.score;
  } catch { scores.value[key] = 0; }
  finally { scoring.value[key] = false; }
}

async function addToQueue(jobId: string, candidateId: string) {
  const key = `${jobId}-${candidateId}`;
  queuing.value[key] = true;
  try {
    await api.post(`/jobs/${jobId}/queue/${candidateId}`, {}, { headers });
    alert('Job added to candidate queue! A tailored CV is being generated.');
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to add to queue.'); }
  finally { queuing.value[key] = false; }
}
</script>
