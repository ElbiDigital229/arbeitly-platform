<template>
  <div class="space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Operations Overview</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Your candidates and application performance at a glance.</p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in statCards" :key="stat.label" class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="h-9 w-9 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/15">
            <span class="mdi text-lg text-primary" :class="stat.icon" />
          </div>
        </div>
        <p class="text-2xl font-bold font-display text-foreground tabular-nums">{{ stat.value }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Your Stats This Month -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
          <span class="mdi mdi-chart-line" /> Your Stats This Month
        </h3>
      </div>
      <div class="px-6 py-4">
        <div v-if="perfLoading" class="flex items-center justify-center py-4 text-muted-foreground">
          <span class="mdi mdi-loading mdi-spin text-xl" />
        </div>
        <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-lg bg-secondary/30 p-4 text-center">
            <p class="text-xl font-bold tabular-nums text-foreground">{{ perfStats.applicationsFiled }}</p>
            <p class="text-[10px] text-muted-foreground uppercase mt-1">Applications Filed</p>
          </div>
          <div class="rounded-lg bg-secondary/30 p-4 text-center">
            <p class="text-xl font-bold tabular-nums" :class="perfStats.interviewRatio >= 20 ? 'text-green-500' : perfStats.interviewRatio >= 10 ? 'text-yellow-500' : 'text-foreground'">{{ perfStats.interviewRatio }}%</p>
            <p class="text-[10px] text-muted-foreground uppercase mt-1">Interview Rate</p>
          </div>
          <div class="rounded-lg bg-secondary/30 p-4 text-center">
            <p class="text-xl font-bold tabular-nums text-foreground">{{ perfStats.accepted }}</p>
            <p class="text-[10px] text-muted-foreground uppercase mt-1">Accepted</p>
          </div>
          <div class="rounded-lg bg-secondary/30 p-4 text-center">
            <p class="text-xl font-bold tabular-nums text-foreground">{{ perfStats.jobsAdded }}</p>
            <p class="text-[10px] text-muted-foreground uppercase mt-1">Jobs Added</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="font-display text-base font-semibold text-foreground mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <router-link to="/employee/candidates" class="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors">
          <span class="mdi mdi-account-group-outline" /> View Candidates
        </router-link>
        <router-link to="/employee/job-discovery" class="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors">
          <span class="mdi mdi-briefcase-search-outline" /> Job Discovery
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();

const statCards = ref([
  { icon: 'mdi-account-group-outline', value: '0', label: 'Total Candidates' },
  { icon: 'mdi-briefcase-outline', value: '0', label: 'Active Applications' },
  { icon: 'mdi-account-voice', value: '0', label: 'Interviews' },
  { icon: 'mdi-check-circle-outline', value: '0', label: 'Accepted' },
]);

const perfLoading = ref(true);
const perfStats = ref({ applicationsFiled: 0, interviewRatio: 0, accepted: 0, jobsAdded: 0 });

onMounted(async () => {
  const headers = store.getAuthHeaders();
  try {
    const [dashRes, perfRes] = await Promise.all([
      api.get('/employee/dashboard', { headers }),
      api.get('/employee/performance', { headers }).catch(() => ({ data: { data: {} } })),
    ]);
    const s = dashRes.data.data;
    statCards.value[0].value = String(s.candidateCount ?? 0);
    statCards.value[1].value = String(s.totalApplications ?? 0);
    statCards.value[2].value = String(s.interviews ?? 0);
    statCards.value[3].value = String(s.accepted ?? 0);

    const p = perfRes.data.data;
    perfStats.value = {
      applicationsFiled: p.applicationsFiled ?? 0,
      interviewRatio: p.interviewRatio ?? 0,
      accepted: p.accepted ?? 0,
      jobsAdded: p.jobsAdded ?? 0,
    };
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  } finally {
    perfLoading.value = false;
  }
});
</script>
