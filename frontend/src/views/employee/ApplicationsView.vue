<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">All Applications</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">{{ applications.length }} application{{ applications.length !== 1 ? 's' : '' }} across your candidates</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
          <input v-model="search" placeholder="Search..." class="h-9 w-64 rounded-lg bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <select v-model="statusFilter" class="h-9 rounded-lg bg-secondary border-none text-xs text-foreground px-3 outline-none">
          <option value="all">All Statuses</option>
          <option value="TO_APPLY">To Apply</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading…</span>
    </div>

    <div v-else-if="filtered.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
      <span class="mdi mdi-briefcase-outline text-5xl text-muted-foreground/20" />
      <p class="text-sm text-foreground mt-3">No applications found</p>
    </div>

    <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-xs text-muted-foreground">
            <th class="text-left px-4 py-3 font-medium">Job Title</th>
            <th class="text-left px-4 py-3 font-medium">Company</th>
            <th class="text-left px-4 py-3 font-medium">Candidate</th>
            <th class="text-left px-4 py-3 font-medium">Status</th>
            <th class="text-left px-4 py-3 font-medium">Source</th>
            <th class="text-left px-4 py-3 font-medium">Salary</th>
            <th class="text-left px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in filtered" :key="app.id" class="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
            <td class="px-4 py-3 font-medium text-foreground">{{ app.jobTitle }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ app.companyName }}</td>
            <td class="px-4 py-3 text-muted-foreground">
              <router-link :to="`/employee/candidates/${app.candidateId}`" class="text-primary hover:underline">{{ app.candidateName }}</router-link>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium" :class="statusClass(app.status)">{{ app.status.replace('_', ' ') }}</span>
            </td>
            <td class="px-4 py-3">
              <span v-if="app.source === 'platform'" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">Arbeitly</span>
              <span v-else class="text-xs text-muted-foreground">Self</span>
            </td>
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ app.salary || '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ formatDate(app.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const loading = ref(true);
const applications = ref<any[]>([]);
const search = ref('');
const statusFilter = ref('all');

const filtered = computed(() => applications.value.filter(a => {
  if (statusFilter.value !== 'all' && a.status !== statusFilter.value) return false;
  if (search.value) {
    const q = search.value.toLowerCase();
    if (!a.jobTitle.toLowerCase().includes(q) && !a.companyName.toLowerCase().includes(q) && !a.candidateName.toLowerCase().includes(q)) return false;
  }
  return true;
}));

function statusClass(s: string) {
  return { TO_APPLY: 'bg-muted text-muted-foreground', APPLIED: 'bg-blue-500/10 text-blue-400', INTERVIEW: 'bg-yellow-500/10 text-yellow-400', ACCEPTED: 'bg-green-500/10 text-green-400', REJECTED: 'bg-destructive/10 text-destructive' }[s] || '';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  try {
    const headers = store.getAuthHeaders();
    // Get all candidates, then fetch their applications
    const { data: candRes } = await api.get('/employee/candidates', { headers });
    const candidates = candRes.data || [];

    const allApps: any[] = [];
    for (const c of candidates) {
      const name = c.profile ? `${c.profile.firstName || ''} ${c.profile.lastName || ''}`.trim() : c.email.split('@')[0];
      try {
        const { data: appRes } = await api.get(`/employee/candidates/${c.id}/applications`, { headers });
        for (const app of (appRes.data || [])) {
          allApps.push({ ...app, candidateId: c.id, candidateName: name });
        }
      } catch { /* skip */ }
    }
    applications.value = allApps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
});
</script>
