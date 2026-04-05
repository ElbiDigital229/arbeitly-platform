<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">My Candidates</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">{{ filteredCandidates.length }} candidate{{ filteredCandidates.length !== 1 ? 's' : '' }} assigned</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
          <input v-model="search" placeholder="Search candidates..." class="h-9 w-64 rounded-lg bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div class="flex items-center rounded-lg border border-border bg-secondary p-0.5 gap-0.5">
          <button v-for="mode in ['list', 'grid']" :key="mode" @click="viewMode = mode as any"
            :class="['h-7 w-7 rounded-md flex items-center justify-center transition-colors', viewMode === mode ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5']">
            <span class="mdi text-sm" :class="mode === 'list' ? 'mdi-view-list' : 'mdi-view-grid'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" />
      <span class="text-sm">Loading candidates…</span>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredCandidates.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
      <span class="mdi mdi-account-group-outline text-5xl text-muted-foreground/20" />
      <p class="text-sm font-medium text-foreground mt-3">No candidates{{ search ? ' match your search' : ' assigned yet' }}</p>
    </div>

    <!-- List view -->
    <div v-else-if="viewMode === 'list'" class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-xs text-muted-foreground">
            <th class="text-left px-4 py-3 font-medium">Name</th>
            <th class="text-left px-4 py-3 font-medium">Email</th>
            <th class="text-center px-4 py-3 font-medium">Applications</th>
            <th class="text-center px-4 py-3 font-medium">Interviews</th>
            <th class="text-center px-4 py-3 font-medium">Accepted</th>
            <th class="text-left px-4 py-3 font-medium">Location</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredCandidates" :key="c.id" class="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer" @click="$router.push(`/employee/candidates/${c.id}`)">
            <td class="px-4 py-3 font-medium text-foreground">{{ candidateName(c) }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ c.email }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-foreground">{{ c.totalApplications }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-yellow-400">{{ c.stats?.INTERVIEW || 0 }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-green-400">{{ c.stats?.ACCEPTED || 0 }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ c.profile?.location || '—' }}</td>
            <td class="px-4 py-3"><span class="mdi mdi-chevron-right text-muted-foreground" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid view -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="c in filteredCandidates" :key="c.id" @click="$router.push(`/employee/candidates/${c.id}`)"
        class="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-10 w-10 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-sm shrink-0">
            {{ candidateInitials(c) }}
          </div>
          <div class="min-w-0">
            <p class="font-medium text-foreground truncate">{{ candidateName(c) }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ c.email }}</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="rounded-lg bg-secondary p-2">
            <p class="text-lg font-bold tabular-nums text-foreground">{{ c.totalApplications }}</p>
            <p class="text-[10px] text-muted-foreground">Apps</p>
          </div>
          <div class="rounded-lg bg-secondary p-2">
            <p class="text-lg font-bold tabular-nums text-yellow-400">{{ c.stats?.INTERVIEW || 0 }}</p>
            <p class="text-[10px] text-muted-foreground">Interviews</p>
          </div>
          <div class="rounded-lg bg-secondary p-2">
            <p class="text-lg font-bold tabular-nums text-green-400">{{ c.stats?.ACCEPTED || 0 }}</p>
            <p class="text-[10px] text-muted-foreground">Accepted</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const loading = ref(true);
const candidates = ref<any[]>([]);
const search = ref('');
const viewMode = ref<'list' | 'grid'>('list');

const filteredCandidates = computed(() => {
  if (!search.value) return candidates.value;
  const q = search.value.toLowerCase();
  return candidates.value.filter(c =>
    candidateName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );
});

function candidateName(c: any) {
  const p = c.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return c.email.split('@')[0];
}

function candidateInitials(c: any) {
  const name = candidateName(c);
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/employee/candidates', { headers: store.getAuthHeaders() });
    candidates.value = data.data || [];
  } catch (err) {
    console.error('Failed to load candidates:', err);
  } finally {
    loading.value = false;
  }
});
</script>
