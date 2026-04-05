<template>
  <AppLayout>
    <v-container>
      <h1 class="text-h5 font-weight-bold mb-6">My Profile</h1>

      <v-card class="pa-6" :loading="loading">
        <v-form @submit.prevent="handleSave">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.firstName"
                label="First Name"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.lastName"
                label="Last Name"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.phone" label="Phone" variant="outlined" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.location" label="Location" variant="outlined" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.bio" label="Bio" variant="outlined" rows="4" />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.linkedinUrl"
                label="LinkedIn URL"
                variant="outlined"
                prepend-inner-icon="mdi-linkedin"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.portfolioUrl"
                label="Portfolio URL"
                variant="outlined"
                prepend-inner-icon="mdi-web"
              />
            </v-col>
          </v-row>

          <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
            Profile updated successfully!
          </v-alert>

          <v-alert v-if="apiError" type="error" variant="tonal" class="mb-4">
            {{ apiError }}
          </v-alert>

          <v-btn type="submit" color="primary" :loading="saving">Save Changes</v-btn>
        </v-form>
      </v-card>
    </v-container>
  </AppLayout>
</template>

<script setup lang="ts">
// TODO: Fully integrated with GET /api/profile and PUT /api/profile
import { ref, onMounted } from 'vue';
import api from '../services/api';
import AppLayout from '../components/AppLayout.vue';

const loading = ref(true);
const saving = ref(false);
const success = ref(false);
const apiError = ref('');

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
  bio: '',
  linkedinUrl: '',
  portfolioUrl: '',
});

onMounted(async () => {
  try {
    const { data } = await api.get('/profile');
    const p = data.data;
    form.value = {
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      phone: p.phone ?? '',
      location: p.location ?? '',
      bio: p.bio ?? '',
      linkedinUrl: p.linkedinUrl ?? '',
      portfolioUrl: p.portfolioUrl ?? '',
    };
  } catch {
    apiError.value = 'Failed to load profile.';
  } finally {
    loading.value = false;
  }
});

async function handleSave() {
  apiError.value = '';
  success.value = false;
  saving.value = true;
  try {
    await api.put('/profile', form.value);
    success.value = true;
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    apiError.value = e.response?.data?.error ?? 'Failed to save profile.';
  } finally {
    saving.value = false;
  }
}
</script>
