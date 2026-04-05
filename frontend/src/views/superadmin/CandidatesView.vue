<template>
  <div class="max-w-5xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Candidates</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">{{ candidates.length }} registered</p>
      </div>
      <div class="relative">
        <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
        <input v-model="search" placeholder="Search..." class="h-9 w-64 rounded-lg bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary" />
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading…</span>
    </div>

    <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-xs text-muted-foreground">
            <th class="text-left px-4 py-3 font-medium">Name</th>
            <th class="text-left px-4 py-3 font-medium">Email</th>
            <th class="text-center px-4 py-3 font-medium">Apps</th>
            <th class="text-center px-4 py-3 font-medium">CVs</th>
            <th class="text-left px-4 py-3 font-medium">Assigned To</th>
            <th class="text-left px-4 py-3 font-medium">Joined</th>
            <th class="px-4 py-3 font-medium">Assign</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id" class="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
            <td class="px-4 py-3 font-medium text-foreground">{{ candidateName(c) }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ c.email }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-foreground">{{ c._count?.applications ?? 0 }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-foreground">{{ c._count?.cvs ?? 0 }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ c.assignedEmployee?.email || '—' }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ formatDate(c.createdAt) }}</td>
            <td class="px-4 py-3">
              <select :value="c.assignedEmployeeId || ''" @change="assignEmployee(c.id, ($event.target as HTMLSelectElement).value)"
                class="h-7 rounded-md bg-secondary border-none text-[11px] text-foreground px-1.5 outline-none w-full max-w-[140px]">
                <option value="">Unassigned</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.email }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const loading = ref(true);
const candidates = ref<any[]>([]);
const employees = ref<any[]>([]);
const search = ref('');

const filtered = computed(() => {
  if (!search.value) return candidates.value;
  const q = search.value.toLowerCase();
  return candidates.value.filter((c: any) => candidateName(c).toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
});

function candidateName(c: any) {
  const p = c.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return c.email.split('@')[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function assignEmployee(candidateId: string, employeeId: string) {
  try {
    await axios.patch(`/api/admin/candidates/${candidateId}`, { assignedEmployeeId: employeeId || null }, { headers: store.getAuthHeaders() });
    const c = candidates.value.find((c: any) => c.id === candidateId);
    if (c) {
      c.assignedEmployeeId = employeeId || null;
      c.assignedEmployee = employeeId ? employees.value.find((e: any) => e.id === employeeId) : null;
    }
  } catch (err) { console.error(err); }
}

onMounted(async () => {
  try {
    const [cRes, eRes] = await Promise.all([
      axios.get('/api/admin/candidates', { headers: store.getAuthHeaders() }),
      axios.get('/api/admin/employees', { headers: store.getAuthHeaders() }),
    ]);
    candidates.value = cRes.data.data || [];
    employees.value = eRes.data.data || [];
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
});
</script>
