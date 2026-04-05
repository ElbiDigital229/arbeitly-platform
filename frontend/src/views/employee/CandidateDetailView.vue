<template>
  <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
    <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading…</span>
  </div>

  <div v-else-if="!candidate" class="text-center py-16 text-muted-foreground">
    <p>Candidate not found.</p>
    <router-link to="/employee/candidates" class="text-primary hover:underline text-sm mt-2 inline-block">← Back</router-link>
  </div>

  <div v-else class="max-w-4xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <router-link to="/employee/candidates" class="h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary/50 text-muted-foreground">
        <span class="mdi mdi-arrow-left text-sm" />
      </router-link>
      <div class="flex items-center gap-3 flex-1">
        <div class="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg shrink-0">
          {{ initials }}
        </div>
        <div>
          <h1 class="font-display text-xl font-bold text-foreground">{{ fullName }}</h1>
          <p class="text-sm text-muted-foreground">{{ candidate.email }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'">
        {{ tab.label }}
      </button>
    </div>

    <!-- Profile tab -->
    <template v-if="activeTab === 'profile'">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 class="font-display text-base font-semibold text-foreground">Personal Information</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><p class="text-xs text-muted-foreground">Name</p><p class="font-medium text-foreground">{{ fullName }}</p></div>
          <div><p class="text-xs text-muted-foreground">Email</p><p class="font-medium text-foreground">{{ candidate.email }}</p></div>
          <div><p class="text-xs text-muted-foreground">Phone</p><p class="font-medium text-foreground">{{ candidate.profile?.phone || '—' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Location</p><p class="font-medium text-foreground">{{ candidate.profile?.location || '—' }}</p></div>
          <div v-if="candidate.profile?.linkedinUrl"><p class="text-xs text-muted-foreground">LinkedIn</p><p class="font-medium text-primary truncate">{{ candidate.profile.linkedinUrl }}</p></div>
          <div><p class="text-xs text-muted-foreground">Onboarding</p><p class="font-medium" :class="candidate.profile?.onboardingCompleted ? 'text-green-400' : 'text-yellow-400'">{{ candidate.profile?.onboardingCompleted ? 'Completed' : 'Pending' }}</p></div>
        </div>
      </div>
    </template>

    <!-- Applications tab -->
    <template v-if="activeTab === 'applications'">
      <!-- Add application -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">{{ applications.length }} application{{ applications.length !== 1 ? 's' : '' }}</p>
        <button @click="showAddApp = true" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          <span class="mdi mdi-plus" /> Add Application
        </button>
      </div>

      <div v-if="applications.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-briefcase-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-foreground mt-3">No applications yet</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="app in applications" :key="app.id" class="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm font-medium text-foreground">{{ app.jobTitle }}</p>
              <span :class="statusClass(app.status)" class="rounded-full px-2 py-0.5 text-[10px] font-medium">{{ app.status.replace('_', ' ') }}</span>
              <span v-if="app.source === 'platform'" class="rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">Arbeitly</span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">{{ app.companyName }}{{ app.salary ? ` · ${app.salary}` : '' }}</p>
          </div>
          <select :value="app.status" @change="updateAppStatus(app.id, ($event.target as HTMLSelectElement).value)"
            class="h-7 rounded-md bg-secondary border-none text-xs text-foreground px-2 outline-none">
            <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
          </select>
          <button @click="deleteApp(app.id)" class="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
            <span class="mdi mdi-trash-can-outline text-sm" />
          </button>
        </div>
      </div>

      <!-- Add dialog -->
      <div v-if="showAddApp" class="modal-overlay">
        <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-md space-y-4">
          <h3 class="font-display text-lg font-bold text-foreground">Add Application</h3>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-foreground block mb-1">Job Title *</label>
              <input v-model="newApp.jobTitle" class="input-field" placeholder="Software Engineer" />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1">Company *</label>
              <input v-model="newApp.companyName" class="input-field" placeholder="Acme GmbH" />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1">Job URL</label>
              <input v-model="newApp.jobUrl" class="input-field" placeholder="https://..." />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-sm font-medium text-foreground block mb-1">Status</label>
                <select v-model="newApp.status" class="input-field">
                  <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-foreground block mb-1">Salary</label>
                <input v-model="newApp.salary" class="input-field" placeholder="€60,000" />
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1">Notes</label>
              <textarea v-model="newApp.notes" rows="2" class="input-field resize-none" />
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button @click="showAddApp = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground hover:bg-secondary/80">Cancel</button>
            <button @click="submitNewApp" :disabled="!newApp.jobTitle || !newApp.companyName || addingApp"
              class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {{ addingApp ? 'Adding...' : 'Add Application' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const route = useRoute();
const candidateId = route.params.id as string;

const loading = ref(true);
const candidate = ref<any>(null);
const applications = ref<any[]>([]);
const activeTab = ref('profile');
const showAddApp = ref(false);
const addingApp = ref(false);

const statuses = ['TO_APPLY', 'APPLIED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];
const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'applications', label: 'Applications' },
];

const newApp = ref({ jobTitle: '', companyName: '', jobUrl: '', status: 'TO_APPLY', salary: '', notes: '' });

const fullName = computed(() => {
  const p = candidate.value?.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return candidate.value?.email?.split('@')[0] || '';
});

const initials = computed(() => fullName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase());

function statusClass(s: string) {
  const map: Record<string, string> = {
    TO_APPLY: 'bg-muted text-muted-foreground',
    APPLIED: 'bg-blue-500/10 text-blue-400',
    INTERVIEW: 'bg-yellow-500/10 text-yellow-400',
    ACCEPTED: 'bg-green-500/10 text-green-400',
    REJECTED: 'bg-destructive/10 text-destructive',
  };
  return map[s] || '';
}

const headers = computed(() => store.getAuthHeaders());

onMounted(async () => {
  try {
    const [cRes, aRes] = await Promise.all([
      axios.get(`/api/employee/candidates/${candidateId}`, { headers: headers.value }),
      axios.get(`/api/employee/candidates/${candidateId}/applications`, { headers: headers.value }),
    ]);
    candidate.value = cRes.data.data;
    applications.value = aRes.data.data || [];
  } catch (err) {
    console.error('Failed to load candidate:', err);
  } finally {
    loading.value = false;
  }
});

async function submitNewApp() {
  addingApp.value = true;
  try {
    const { data } = await axios.post(`/api/employee/candidates/${candidateId}/applications`, newApp.value, { headers: headers.value });
    applications.value.unshift(data.data);
    showAddApp.value = false;
    newApp.value = { jobTitle: '', companyName: '', jobUrl: '', status: 'TO_APPLY', salary: '', notes: '' };
  } catch (err) {
    console.error('Failed to add application:', err);
  } finally {
    addingApp.value = false;
  }
}

async function updateAppStatus(appId: string, status: string) {
  try {
    await axios.put(`/api/employee/candidates/${candidateId}/applications/${appId}`, { status }, { headers: headers.value });
    const app = applications.value.find(a => a.id === appId);
    if (app) app.status = status;
  } catch (err) {
    console.error('Failed to update:', err);
  }
}

async function deleteApp(appId: string) {
  try {
    await axios.delete(`/api/employee/candidates/${candidateId}/applications/${appId}`, { headers: headers.value });
    applications.value = applications.value.filter(a => a.id !== appId);
  } catch (err) {
    console.error('Failed to delete:', err);
  }
}
</script>
