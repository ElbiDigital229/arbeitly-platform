<template>
  <div class="max-w-5xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Employee Performance</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Track employee productivity and success rates.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl" />
    </div>

    <div v-else-if="employees.length === 0" class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <span class="mdi mdi-account-group-outline text-4xl opacity-20" />
      <p class="text-sm">No employees found.</p>
    </div>

    <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidates</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applications</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interviews</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accepted</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interview %</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jobs Added</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="emp in employees" :key="emp.id" class="hover:bg-secondary/20 transition-colors cursor-pointer" @click="showDetail(emp)">
            <td class="px-4 py-3">
              <p class="text-sm font-medium text-foreground">{{ emp.email }}</p>
            </td>
            <td class="px-4 py-3 text-center text-sm tabular-nums text-foreground">{{ emp.candidates }}</td>
            <td class="px-4 py-3 text-center text-sm tabular-nums text-foreground">{{ emp.applicationsFiled }}</td>
            <td class="px-4 py-3 text-center text-sm tabular-nums text-foreground">{{ emp.interviews }}</td>
            <td class="px-4 py-3 text-center text-sm tabular-nums text-foreground">{{ emp.accepted }}</td>
            <td class="px-4 py-3 text-center">
              <span class="text-sm font-semibold tabular-nums" :class="emp.interviewRatio >= 20 ? 'text-green-500' : emp.interviewRatio >= 10 ? 'text-yellow-500' : 'text-muted-foreground'">
                {{ emp.interviewRatio }}%
              </span>
            </td>
            <td class="px-4 py-3 text-center text-sm tabular-nums text-foreground">{{ emp.jobsAdded }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail modal -->
    <div v-if="detailEmployee" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-lg font-bold text-foreground">{{ detailEmployee.email }}</h3>
          <button @click="detailEmployee = null" class="text-muted-foreground hover:text-foreground"><span class="mdi mdi-close" /></button>
        </div>
        <div v-if="detailLoading" class="flex items-center justify-center py-8"><span class="mdi mdi-loading mdi-spin text-xl text-muted-foreground" /></div>
        <template v-else-if="detail">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-secondary/30 p-3 text-center">
              <p class="text-xl font-bold tabular-nums text-foreground">{{ detail.applicationsFiled }}</p>
              <p class="text-[10px] text-muted-foreground uppercase">Applications</p>
            </div>
            <div class="rounded-lg bg-secondary/30 p-3 text-center">
              <p class="text-xl font-bold tabular-nums text-foreground">{{ detail.interviewRatio }}%</p>
              <p class="text-[10px] text-muted-foreground uppercase">Interview Rate</p>
            </div>
            <div class="rounded-lg bg-secondary/30 p-3 text-center">
              <p class="text-xl font-bold tabular-nums text-foreground">{{ detail.accepted }}</p>
              <p class="text-[10px] text-muted-foreground uppercase">Accepted</p>
            </div>
            <div class="rounded-lg bg-secondary/30 p-3 text-center">
              <p class="text-xl font-bold tabular-nums text-foreground">{{ detail.jobsAdded }}</p>
              <p class="text-[10px] text-muted-foreground uppercase">Jobs Added</p>
            </div>
          </div>
          <div v-if="detail.recentApplications?.length > 0">
            <h4 class="text-sm font-semibold text-foreground mb-2">Recent Applications</h4>
            <div class="space-y-1.5">
              <div v-for="app in detail.recentApplications.slice(0, 10)" :key="app.jobTitle + app.createdAt" class="flex items-center justify-between text-xs py-1">
                <span class="text-foreground">{{ app.jobTitle }} @ {{ app.companyName }}</span>
                <span class="text-muted-foreground capitalize">{{ app.status?.toLowerCase().replace('_', ' ') }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();

interface Employee { id: string; email: string; candidates: number; applicationsFiled: number; interviews: number; accepted: number; interviewRatio: number; jobsAdded: number; }

const employees = ref<Employee[]>([]);
const loading = ref(true);
const detailEmployee = ref<Employee | null>(null);
const detail = ref<any>(null);
const detailLoading = ref(false);

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/performance', { headers: store.getAuthHeaders() });
    employees.value = data.data;
  } catch (e) { console.error(e); }
  finally { loading.value = false; }
});

async function showDetail(emp: Employee) {
  detailEmployee.value = emp;
  detailLoading.value = true;
  try {
    const { data } = await api.get(`/admin/performance/${emp.id}`, { headers: store.getAuthHeaders() });
    detail.value = data.data;
  } catch { detail.value = null; }
  finally { detailLoading.value = false; }
}
</script>
