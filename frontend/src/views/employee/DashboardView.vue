<template>
  <div class="max-w-4xl space-y-6">
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

    <!-- Quick actions -->
    <div class="rounded-xl border border-border bg-card p-6">
      <h2 class="font-display text-base font-semibold text-foreground mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <router-link to="/employee/candidates" class="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors">
          <span class="mdi mdi-account-group-outline" /> View Candidates
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();

const statCards = ref([
  { icon: 'mdi-account-group-outline', value: '0', label: 'Total Candidates' },
  { icon: 'mdi-briefcase-outline', value: '0', label: 'Active Applications' },
  { icon: 'mdi-account-voice', value: '0', label: 'Interviews' },
  { icon: 'mdi-check-circle-outline', value: '0', label: 'Accepted' },
]);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/employee/dashboard', { headers: store.getAuthHeaders() });
    const s = data.data;
    statCards.value[0].value = String(s.candidateCount ?? 0);
    statCards.value[1].value = String(s.totalApplications ?? 0);
    statCards.value[2].value = String(s.interviews ?? 0);
    statCards.value[3].value = String(s.accepted ?? 0);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
});
</script>
