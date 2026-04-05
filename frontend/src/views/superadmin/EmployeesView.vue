<template>
  <div class="max-w-4xl space-y-6">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">Employees</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">{{ employees.length }} team member{{ employees.length !== 1 ? 's' : '' }}</p>
      </div>
      <button @click="showCreate = true" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
        <span class="mdi mdi-plus" /> Add Employee
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading…</span>
    </div>

    <div v-else-if="employees.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
      <span class="mdi mdi-badge-account-outline text-5xl text-muted-foreground/20" />
      <p class="text-sm text-foreground mt-3">No employees yet</p>
    </div>

    <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-xs text-muted-foreground">
            <th class="text-left px-4 py-3 font-medium">Email</th>
            <th class="text-center px-4 py-3 font-medium">Candidates</th>
            <th class="text-left px-4 py-3 font-medium">Created</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in employees" :key="e.id" class="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors">
            <td class="px-4 py-3 font-medium text-foreground">{{ e.email }}</td>
            <td class="px-4 py-3 text-center tabular-nums text-foreground">{{ e._count?.assignedCandidates ?? 0 }}</td>
            <td class="px-4 py-3 text-muted-foreground text-xs">{{ formatDate(e.createdAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="confirmDelete(e)" class="text-muted-foreground hover:text-destructive transition-colors">
                <span class="mdi mdi-trash-can-outline text-sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create dialog -->
    <div v-if="showCreate" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
        <h3 class="font-display text-lg font-bold text-foreground">Create Employee</h3>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Email</label>
            <input v-model="newEmail" type="email" class="input-field" placeholder="employee@arbeitly.de" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1">Password</label>
            <input v-model="newPassword" type="password" class="input-field" placeholder="Min 8 characters" />
          </div>
        </div>
        <p v-if="createError" class="text-sm text-destructive">{{ createError }}</p>
        <div class="flex gap-2 justify-end">
          <button @click="showCreate = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="createEmployee" :disabled="!newEmail || !newPassword || creating" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ creating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete dialog -->
    <div v-if="deleteTarget" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
        <div class="flex items-start gap-3">
          <div class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10 border border-destructive/20">
            <span class="mdi mdi-trash-can-outline text-lg text-destructive" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Delete Employee?</p>
            <p class="text-xs mt-0.5 text-muted-foreground">"<span class="font-medium text-foreground">{{ deleteTarget.email }}</span>" and all assigned candidates will be unassigned.</p>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="deleteTarget = null" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="executeDelete" :disabled="deleting" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive text-white disabled:opacity-50">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
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
const loading = ref(true);
const employees = ref<any[]>([]);
const showCreate = ref(false);
const newEmail = ref('');
const newPassword = ref('');
const creating = ref(false);
const createError = ref('');
const deleteTarget = ref<any>(null);
const deleting = ref(false);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function createEmployee() {
  createError.value = '';
  creating.value = true;
  try {
    const { data } = await api.post('/admin/employees', { email: newEmail.value, password: newPassword.value }, { headers: store.getAuthHeaders() });
    employees.value.unshift({ ...data.data, _count: { assignedCandidates: 0 }, createdAt: new Date().toISOString() });
    showCreate.value = false;
    newEmail.value = '';
    newPassword.value = '';
  } catch (e: any) {
    createError.value = e?.response?.data?.error || 'Failed to create';
  } finally { creating.value = false; }
}

function confirmDelete(e: any) { deleteTarget.value = e; }

async function executeDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await api.delete(`/admin/employees/${deleteTarget.value.id}`, { headers: store.getAuthHeaders() });
    employees.value = employees.value.filter(e => e.id !== deleteTarget.value.id);
    deleteTarget.value = null;
  } catch (err) { console.error(err); }
  finally { deleting.value = false; }
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/employees', { headers: store.getAuthHeaders() });
    employees.value = data.data || [];
  } catch (err) { console.error(err); }
  finally { loading.value = false; }
});
</script>
