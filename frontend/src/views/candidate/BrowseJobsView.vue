<template>
  <div class="p-6 max-w-5xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Browse jobs</h1>
      <p class="text-sm text-muted-foreground mt-0.5">
        Sorted by best fit for your profile.
      </p>
    </div>

    <div v-if="loading" class="flex items-center gap-2 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin" /> Scoring jobs against your profile…
    </div>

    <div
      v-else-if="!results.length"
      class="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground"
    >
      No jobs available yet. Check back soon.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="r in results"
        :key="r.job.id"
        class="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-border flex items-start gap-4">
          <div class="flex-1 min-w-0">
            <h2 class="font-display text-lg font-semibold text-foreground">{{ r.job.title }}</h2>
            <p class="text-sm text-muted-foreground">
              {{ r.job.company }}
              <span v-if="r.job.location"> · {{ r.job.location }}</span>
              <span v-if="r.job.remote"> · Remote OK</span>
            </p>
            <p
              v-if="r.job.salary"
              class="text-xs text-muted-foreground mt-1"
            >
              <span class="mdi mdi-cash-outline" /> {{ r.job.salary }}
            </p>
          </div>
        </div>

        <div v-if="r.job.description" class="px-5 py-3 text-sm text-muted-foreground border-b border-border">
          {{ r.job.description }}
        </div>

        <div class="p-4">
          <MatchBreakdownCard :match="r.match" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import MatchBreakdownCard from '../../components/MatchBreakdownCard.vue';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  salary?: string | null;
  description?: string | null;
  remote?: boolean;
}
interface Result {
  job: Job;
  match: any;
}

const loading = ref(true);
const results = ref<Result[]>([]);

onMounted(async () => {
  try {
    const r = await api.get('/browse-jobs');
    results.value = r.data.data;
  } catch (e) {
    console.error('browse-jobs failed', e);
  } finally {
    loading.value = false;
  }
});
</script>
