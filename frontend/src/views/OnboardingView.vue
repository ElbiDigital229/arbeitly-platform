<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="7" lg="6">
        <v-card class="pa-6 elevation-4">
          <div class="mb-6">
            <h1 class="text-h5 font-weight-bold">Welcome to Arbeitly!</h1>
            <p class="text-subtitle-2 text-medium-emphasis mt-1">
              Let's set up your profile to get started.
            </p>
          </div>

          <v-form @submit.prevent="handleOnboarding">
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
                <v-text-field
                  v-model="form.phone"
                  label="Phone (optional)"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.location"
                  label="Location (optional)"
                  variant="outlined"
                  placeholder="e.g. Berlin, Germany"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.bio"
                  label="Short Bio (optional)"
                  variant="outlined"
                  rows="3"
                  placeholder="Tell employers a bit about yourself..."
                />
              </v-col>
            </v-row>

            <v-alert v-if="apiError" type="error" variant="tonal" class="mb-4">
              {{ apiError }}
            </v-alert>

            <v-btn type="submit" color="primary" size="large" block :loading="loading">
              Complete Setup
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// TODO: Wire up to onboarding API endpoint POST /api/onboarding
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const loading = ref(false);
const apiError = ref('');

const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
  bio: '',
});

async function handleOnboarding() {
  apiError.value = '';
  loading.value = true;
  try {
    await api.post('/onboarding', form.value);
    router.push('/dashboard');
  } catch (err: unknown) {
    const e = err as { response?: { data?: { error?: string } } };
    apiError.value = e.response?.data?.error ?? 'Something went wrong.';
  } finally {
    loading.value = false;
  }
}
</script>
