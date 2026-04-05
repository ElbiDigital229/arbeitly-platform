<template>
  <AppLayout>
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h5 font-weight-bold">My Applications</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add Application
        </v-btn>
      </div>

      <!-- Status filter chips -->
      <div class="mb-4 d-flex flex-wrap gap-2">
        <v-chip
          v-for="s in statuses"
          :key="s"
          :color="activeFilter === s ? 'primary' : undefined"
          :variant="activeFilter === s ? 'flat' : 'outlined'"
          @click="activeFilter = activeFilter === s ? null : s"
        >
          {{ s }}
        </v-chip>
      </div>

      <v-card v-if="filteredApplications.length === 0" class="pa-8 text-center" variant="outlined">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-briefcase-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No applications yet</p>
        <p class="text-body-2 text-medium-emphasis">Start tracking your job applications.</p>
      </v-card>

      <v-table v-else>
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Status</th>
            <th>Applied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in filteredApplications" :key="app.id">
            <td class="font-weight-medium">{{ app.companyName }}</td>
            <td>{{ app.jobTitle }}</td>
            <td>
              <v-chip :color="statusColor(app.status)" size="small" variant="tonal">
                {{ app.status }}
              </v-chip>
            </td>
            <td>{{ app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—' }}</td>
            <td>
              <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEditDialog(app)" />
              <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteApplication(app.id)" />
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="dialog" max-width="600">
        <v-card class="pa-4">
          <v-card-title>{{ editingId ? 'Edit Application' : 'Add Application' }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.companyName" label="Company Name" variant="outlined" required />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.jobTitle" label="Job Title" variant="outlined" required />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.jobUrl" label="Job URL (optional)" variant="outlined" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="form.status"
                  :items="statuses"
                  label="Status"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.appliedAt"
                  label="Applied Date"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.notes" label="Notes" variant="outlined" rows="3" />
              </v-col>
            </v-row>
            <v-alert v-if="formError" type="error" variant="tonal">{{ formError }}</v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="dialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="saving" @click="handleSave">
              {{ editingId ? 'Update' : 'Add' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </AppLayout>
</template>

<script setup lang="ts">
// TODO: Full CRUD connected to /api/applications
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import AppLayout from '../components/AppLayout.vue';

interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string | null;
  status: string;
  appliedAt: string | null;
  notes: string | null;
}

const statuses = ['WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

const applications = ref<Application[]>([]);
const activeFilter = ref<string | null>(null);
const dialog = ref(false);
const editingId = ref<string | null>(null);
const saving = ref(false);
const formError = ref('');

const form = ref({
  companyName: '',
  jobTitle: '',
  jobUrl: '',
  status: 'WISHLIST',
  appliedAt: '',
  notes: '',
});

const filteredApplications = computed(() => {
  if (!activeFilter.value) return applications.value;
  return applications.value.filter((a) => a.status === activeFilter.value);
});

function statusColor(status: string) {
  const map: Record<string, string> = {
    WISHLIST: 'grey',
    APPLIED: 'blue',
    PHONE_SCREEN: 'cyan',
    INTERVIEW: 'orange',
    OFFER: 'green',
    REJECTED: 'red',
    WITHDRAWN: 'deep-purple',
  };
  return map[status] ?? 'grey';
}

function openCreateDialog() {
  editingId.value = null;
  form.value = { companyName: '', jobTitle: '', jobUrl: '', status: 'WISHLIST', appliedAt: '', notes: '' };
  formError.value = '';
  dialog.value = true;
}

function openEditDialog(app: Application) {
  editingId.value = app.id;
  form.value = {
    companyName: app.companyName,
    jobTitle: app.jobTitle,
    jobUrl: app.jobUrl ?? '',
    status: app.status,
    appliedAt: app.appliedAt ? app.appliedAt.substring(0, 10) : '',
    notes: app.notes ?? '',
  };
  formError.value = '';
  dialog.value = true;
}

onMounted(fetchApplications);

async function fetchApplications() {
  try {
    const { data } = await api.get('/applications');
    applications.value = data.data;
  } catch {
    // Silently handle
  }
}

async function handleSave() {
  formError.value = '';
  saving.value = true;
  try {
    const payload = {
      ...form.value,
      appliedAt: form.value.appliedAt || undefined,
      jobUrl: form.value.jobUrl || undefined,
    };
    if (editingId.value) {
      await api.put(`/api/applications/${editingId.value}`, payload);
    } else {
      await api.post('/applications', payload);
    }
    dialog.value = false;
    await fetchApplications();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    formError.value = e.response?.data?.error ?? 'Failed to save application.';
  } finally {
    saving.value = false;
  }
}

async function deleteApplication(id: string) {
  if (!confirm('Delete this application?')) return;
  try {
    await api.delete(`/api/applications/${id}`);
    await fetchApplications();
  } catch {
    // Silently handle
  }
}
</script>
