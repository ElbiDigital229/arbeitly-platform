<template>
  <AppLayout>
    <v-container>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h5 font-weight-bold">My CVs</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="uploadDialog = true">
          Upload CV
        </v-btn>
      </div>

      <v-row v-if="cvs.length > 0">
        <v-col v-for="cv in cvs" :key="cv.id" cols="12" sm="6" md="4">
          <v-card class="pa-4">
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ cv.title }}</v-card-title>
            <v-card-subtitle>{{ new Date(cv.createdAt).toLocaleDateString() }}</v-card-subtitle>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="text"
                :href="`/api/cvs/${cv.id}/export`"
                target="_blank"
                prepend-icon="mdi-download"
              >
                Export PDF
              </v-btn>
              <v-btn
                color="error"
                variant="text"
                prepend-icon="mdi-delete"
                @click="deleteCV(cv.id)"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else class="pa-8 text-center" variant="outlined">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-document-outline</v-icon>
        <p class="text-h6 text-medium-emphasis">No CVs yet</p>
        <p class="text-body-2 text-medium-emphasis">Upload your first CV to get started.</p>
      </v-card>

      <!-- Upload Dialog -->
      <v-dialog v-model="uploadDialog" max-width="500">
        <v-card class="pa-4">
          <v-card-title>Upload CV</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="uploadTitle"
              label="CV Title"
              variant="outlined"
              class="mb-3"
              required
            />
            <v-file-input
              v-model="uploadFile"
              label="Select CV file (PDF, DOCX)"
              variant="outlined"
              accept=".pdf,.doc,.docx"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
            />
            <v-alert v-if="uploadError" type="error" variant="tonal" class="mt-3">
              {{ uploadError }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="uploadDialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="uploading" @click="handleUpload">Upload</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </AppLayout>
</template>

<script setup lang="ts">
// TODO: Fully connected to CV API endpoints
import { ref, onMounted } from 'vue';
import api from '../services/api';
import AppLayout from '../components/AppLayout.vue';

interface CV {
  id: string;
  title: string;
  createdAt: string;
}

const cvs = ref<CV[]>([]);
const uploadDialog = ref(false);
const uploadTitle = ref('');
const uploadFile = ref<File[]>([]);
const uploading = ref(false);
const uploadError = ref('');

onMounted(fetchCVs);

async function fetchCVs() {
  try {
    const { data } = await api.get('/cvs');
    cvs.value = data.data;
  } catch {
    // Handle silently
  }
}

async function handleUpload() {
  if (!uploadTitle.value || !uploadFile.value[0]) {
    uploadError.value = 'Please provide a title and select a file.';
    return;
  }
  uploadError.value = '';
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('title', uploadTitle.value);
    formData.append('file', uploadFile.value[0]);
    await api.post('/cvs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    uploadDialog.value = false;
    uploadTitle.value = '';
    uploadFile.value = [];
    await fetchCVs();
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    uploadError.value = e.response?.data?.error ?? 'Upload failed.';
  } finally {
    uploading.value = false;
  }
}

async function deleteCV(id: string) {
  if (!confirm('Are you sure you want to delete this CV?')) return;
  try {
    await api.delete(`/api/cvs/${id}`);
    await fetchCVs();
  } catch {
    // Handle silently
  }
}
</script>
