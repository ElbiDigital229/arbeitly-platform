<template>
  <AppLayout>
    <v-container>
      <h1 class="text-h5 font-weight-bold mb-6">Dashboard</h1>

      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="primary" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Total Applications</p>
                <p class="text-h4 font-weight-bold">{{ stats.total }}</p>
              </div>
              <v-icon size="40" color="primary">mdi-briefcase</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="info" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Applied</p>
                <p class="text-h4 font-weight-bold">{{ stats.applied }}</p>
              </div>
              <v-icon size="40" color="info">mdi-send</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="warning" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Interviews</p>
                <p class="text-h4 font-weight-bold">{{ stats.interview }}</p>
              </div>
              <v-icon size="40" color="warning">mdi-account-voice</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="pa-4" color="success" variant="tonal">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Offers</p>
                <p class="text-h4 font-weight-bold">{{ stats.offer }}</p>
              </div>
              <v-icon size="40" color="success">mdi-trophy</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-btn to="/applications" color="primary" variant="outlined" block prepend-icon="mdi-plus">
                    Track New Application
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn to="/cvs" color="secondary" variant="outlined" block prepend-icon="mdi-file-upload">
                    Upload CV
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn to="/profile" color="accent" variant="outlined" block prepend-icon="mdi-account-edit">
                    Edit Profile
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<script setup lang="ts">
// TODO: Fetch real stats from GET /api/applications
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AppLayout from '../components/AppLayout.vue';

const stats = ref({ total: 0, applied: 0, interview: 0, offer: 0 });

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/applications');
    const apps = data.data as { status: string }[];
    stats.value = {
      total: apps.length,
      applied: apps.filter((a) => a.status === 'APPLIED').length,
      interview: apps.filter((a) => a.status === 'INTERVIEW').length,
      offer: apps.filter((a) => a.status === 'OFFER').length,
    };
  } catch {
    // Silently fail — user may not have applications yet
  }
});
</script>
