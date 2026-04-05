<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-bold font-display text-foreground">FAQ</h1>
      <p class="text-sm mt-1 text-muted-foreground">Questions and answers prepared by your advisor. Review and approve each one.</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12 text-muted-foreground">
      <span class="mdi mdi-loading mdi-spin text-xl mr-2" /><span class="text-sm">Loading...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="rounded-xl border border-border bg-card">
      <div class="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <span class="mdi mdi-help-circle-outline text-5xl opacity-20" />
        <p class="text-sm font-medium text-foreground">No FAQ yet</p>
        <p class="text-xs text-center max-w-xs text-muted-foreground">Your advisor hasn't created any FAQ items yet. Check back later.</p>
      </div>
    </div>

    <!-- FAQ items -->
    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="rounded-xl border border-border bg-card p-5 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2">
              <span v-if="item.category" class="rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">{{ item.category }}</span>
            </div>
            <p class="text-sm font-semibold text-foreground">{{ item.question }}</p>
            <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ item.answer }}</p>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button @click="toggleApproval(item)" class="h-8 px-3 rounded-lg text-xs font-medium transition-colors"
              :class="item.isApproved ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-secondary text-muted-foreground hover:text-foreground'">
              <span class="mdi" :class="item.isApproved ? 'mdi-check-circle' : 'mdi-check-circle-outline'" />
              {{ item.isApproved ? 'Approved' : 'Approve' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const loading = ref(true);
const items = ref<any[]>([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/faq');
    items.value = data.data || [];
  } catch {
    // no faq items
  } finally {
    loading.value = false;
  }
});

async function toggleApproval(item: any) {
  try {
    const { data } = await api.patch(`/faq/${item.id}/approve`, { isApproved: !item.isApproved });
    item.isApproved = data.data.isApproved;
  } catch (e) {
    console.error('Failed to update approval:', e);
  }
}
</script>
