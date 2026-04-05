<template>
  <div class="max-w-5xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Audit Log</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Track all platform activity.</p>
    </div>

    <div class="grid gap-4" style="grid-template-columns: 280px 1fr;">
      <!-- Left: user list -->
      <div class="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <div class="px-3 py-2 border-b border-border shrink-0">
          <div class="relative">
            <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" />
            <input v-model="userSearch" placeholder="Search users..." class="h-7 w-full rounded-md bg-secondary border-none pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </div>
        <div class="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] divide-y divide-border/50">
          <button v-for="u in filteredUsers" :key="u.id" @click="selectedUser = u"
            class="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
            :class="selectedUser?.id === u.id ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-secondary/40'">
            <div class="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" :class="userTypeColor(u.role)">
              {{ u.email[0].toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-foreground truncate">{{ u.email }}</p>
              <span class="text-[10px] px-1 py-0.5 rounded-full" :class="userTypeBadge(u.role)">{{ u.role.toLowerCase() }}</span>
            </div>
            <span class="text-[10px] text-muted-foreground shrink-0">{{ u.activityCount }}</span>
          </button>
          <p v-if="filteredUsers.length === 0" class="px-3 py-6 text-center text-xs text-muted-foreground">No users found.</p>
        </div>
      </div>

      <!-- Right: activity feed -->
      <div class="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <template v-if="selectedUser">
          <div class="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
            <div class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold" :class="userTypeColor(selectedUser.role)">
              {{ selectedUser.email[0].toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">{{ selectedUser.email }}</p>
              <span class="text-[10px] px-1 py-0.5 rounded-full" :class="userTypeBadge(selectedUser.role)">{{ selectedUser.role.toLowerCase() }}</span>
            </div>
            <span class="ml-auto text-xs text-muted-foreground">{{ selectedUser.activityCount }} activities</span>
          </div>
          <div class="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] divide-y divide-border/50">
            <div v-for="(a, i) in selectedUserActivities" :key="i" class="flex items-start gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors">
              <div class="mt-1.5"><div class="h-2 w-2 rounded-full" :class="userTypeDot(a.role)" /></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-foreground">{{ a.action }}</p>
                <p v-if="a.detail" class="text-xs text-muted-foreground mt-0.5">{{ a.detail }}</p>
              </div>
              <span class="text-[10px] text-muted-foreground/60 shrink-0 whitespace-nowrap">{{ a.date }}</span>
            </div>
            <p v-if="selectedUserActivities.length === 0" class="px-5 py-12 text-center text-sm text-muted-foreground">No activity recorded.</p>
          </div>
        </template>
        <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground py-16">
          <span class="mdi mdi-clipboard-list-outline text-4xl opacity-20" />
          <p class="text-sm">Select a user to view activity</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const userSearch = ref('');
const selectedUser = ref<any>(null);
const users = ref<any[]>([]);
const activities = ref<any[]>([]);

function userTypeColor(role: string) {
  return { CANDIDATE: 'bg-blue-500/20 text-blue-400', EMPLOYEE: 'bg-primary/20 text-primary', ADMIN: 'bg-purple-500/20 text-purple-400' }[role] || 'bg-secondary text-muted-foreground';
}
function userTypeBadge(role: string) {
  return { CANDIDATE: 'bg-blue-500/10 text-blue-400', EMPLOYEE: 'bg-primary/10 text-primary', ADMIN: 'bg-purple-500/10 text-purple-400' }[role] || '';
}
function userTypeDot(role: string) {
  return { CANDIDATE: 'bg-blue-400', EMPLOYEE: 'bg-primary', ADMIN: 'bg-purple-400' }[role] || 'bg-muted-foreground';
}

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  const q = userSearch.value.toLowerCase();
  return users.value.filter(u => u.email.toLowerCase().includes(q));
});

const selectedUserActivities = computed(() => {
  if (!selectedUser.value) return [];
  return activities.value.filter(a => a.userId === selectedUser.value.id);
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

onMounted(async () => {
  try {
    const [cRes, eRes] = await Promise.all([
      axios.get('/api/admin/candidates', { headers: store.getAuthHeaders() }),
      axios.get('/api/admin/employees', { headers: store.getAuthHeaders() }),
    ]);
    const candidates = (cRes.data.data || []).map((c: any) => ({ id: c.id, email: c.email, role: 'CANDIDATE', activityCount: c._count?.applications || 0 }));
    const employees = (eRes.data.data || []).map((e: any) => ({ id: e.id, email: e.email, role: 'EMPLOYEE', activityCount: e._count?.assignedCandidates || 0 }));
    users.value = [...candidates, ...employees].sort((a, b) => b.activityCount - a.activityCount);

    // Build activity feed from candidate applications
    for (const c of cRes.data.data || []) {
      const appsRes = await axios.get(`/api/admin/candidates/${c.id}/applications`, { headers: store.getAuthHeaders() }).catch(() => ({ data: { data: [] } }));
      for (const app of appsRes.data.data || []) {
        activities.value.push({
          userId: c.id,
          role: 'CANDIDATE',
          action: `Application: ${app.jobTitle} at ${app.companyName}`,
          detail: app.status?.replace('_', ' '),
          date: formatDate(app.createdAt),
        });
      }
    }
  } catch (err) { console.error(err); }
});
</script>
