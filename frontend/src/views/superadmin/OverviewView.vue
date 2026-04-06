<template>
  <div class="space-y-6">
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Plan distribution -->
      <div v-if="planStats.length > 0" class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-chart-pie" /> Plan Distribution
          </h3>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-3">
            <div v-for="p in planStats" :key="p.name" class="flex items-center gap-3">
              <span class="text-sm font-medium text-foreground w-24 truncate">{{ p.name }}</span>
              <div class="flex-1 h-2 rounded-full overflow-hidden bg-secondary">
                <div class="h-full rounded-full bg-primary transition-all" :style="`width: ${p.pct}%`" />
              </div>
              <span class="text-xs text-muted-foreground tabular-nums w-16 text-right">{{ p.count }} user{{ p.count !== 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Performers -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-trophy-outline" /> Top Performers
          </h3>
        </div>
        <div class="px-6 py-4">
          <div v-if="topPerformers.length === 0" class="text-sm text-muted-foreground py-4 text-center">No performance data yet.</div>
          <div v-else class="space-y-3">
            <div v-for="(emp, i) in topPerformers" :key="emp.email" class="flex items-center gap-3">
              <span class="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                :class="i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-500/20 text-orange-500'">
                {{ i + 1 }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">{{ emp.email }}</p>
                <p class="text-[10px] text-muted-foreground">{{ emp.applicationsFiled }} apps · {{ emp.interviewRatio }}% interview rate</p>
              </div>
              <span class="text-sm font-bold tabular-nums" :class="emp.interviewRatio >= 20 ? 'text-green-500' : 'text-foreground'">{{ emp.accepted }} accepted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const stats = ref([
  { icon: 'mdi-account-group-outline', value: '0', label: 'Total Candidates' },
  { icon: 'mdi-badge-account-outline', value: '0', label: 'Total Employees' },
  { icon: 'mdi-briefcase-outline', value: '0', label: 'Total Applications' },
  { icon: 'mdi-cash-multiple', value: '€0', label: 'Total Revenue' },
]);

interface PlanStat { name: string; count: number; pct: number; }
const planStats = ref<PlanStat[]>([]);
const topPerformers = ref<any[]>([]);

onMounted(async () => {
  const headers = store.getAuthHeaders();
  try {
    const [dashRes, perfRes] = await Promise.all([
      api.get('/admin/dashboard', { headers }),
      api.get('/admin/performance', { headers }).catch(() => ({ data: { data: [] } })),
    ]);

    const s = dashRes.data.data;
    stats.value[0].value = String(s.candidates ?? 0);
    stats.value[1].value = String(s.employees ?? 0);
    stats.value[2].value = String(s.totalApplications ?? 0);
    stats.value[3].value = `€${s.totalRevenue ?? 0}`;

    // Plan distribution
    const plans = s.plans || [];
    const total = (s.candidates ?? 0);
    const paidTotal = plans.reduce((sum: number, p: any) => sum + (p._count?.candidates ?? 0), 0);
    const freeCount = Math.max(0, total - paidTotal);

    const items: PlanStat[] = [{ name: 'Free', count: freeCount, pct: total > 0 ? (freeCount / total) * 100 : 0 }];
    for (const p of plans) {
      const count = p._count?.candidates ?? 0;
      items.push({ name: p.name, count, pct: total > 0 ? (count / total) * 100 : 0 });
    }
    planStats.value = items;

    // Top performers (top 3 by applications filed)
    const perf = perfRes.data.data || [];
    topPerformers.value = [...perf].sort((a: any, b: any) => b.applicationsFiled - a.applicationsFiled).slice(0, 3);
  } catch (err) { console.error(err); }
});
</script>
