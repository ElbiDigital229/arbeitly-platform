<template>
  <div class="max-w-5xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Platform Overview</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Key metrics across the platform.</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="rounded-xl border border-border bg-card p-5">
        <div class="h-9 w-9 rounded-lg flex items-center justify-center mb-3 bg-primary/10 border border-primary/15">
          <span class="mdi text-lg text-primary" :class="stat.icon" />
        </div>
        <p class="text-2xl font-bold font-display text-foreground tabular-nums">{{ stat.value }}</p>
        <p class="text-xs text-muted-foreground mt-0.5">{{ stat.label }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const stats = ref([
  { icon: 'mdi-account-group-outline', value: '0', label: 'Total Candidates' },
  { icon: 'mdi-badge-account-outline', value: '0', label: 'Total Employees' },
  { icon: 'mdi-briefcase-outline', value: '0', label: 'Total Applications' },
  { icon: 'mdi-check-circle-outline', value: '0', label: 'Accepted' },
]);

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/admin/dashboard', { headers: store.getAuthHeaders() });
    const s = data.data;
    stats.value[0].value = String(s.candidates ?? 0);
    stats.value[1].value = String(s.employees ?? 0);
    stats.value[2].value = String(s.totalApplications ?? 0);
    stats.value[3].value = String(s.accepted ?? 0);
  } catch (err) { console.error(err); }
});
</script>
