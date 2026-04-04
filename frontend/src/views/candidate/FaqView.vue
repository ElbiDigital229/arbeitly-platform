<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h1 class="text-xl font-bold font-display text-foreground">FAQ</h1>
      <p class="text-sm mt-1 text-muted-foreground">Questions and answers prepared by your advisor. Review and approve each one.</p>
    </div>

    <!-- Empty state -->
    <div class="rounded-xl border border-border bg-card">
      <div class="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <span class="mdi mdi-help-circle-outline text-5xl opacity-20" />
        <p class="text-sm font-medium text-foreground">No FAQ yet</p>
        <p class="text-xs text-center max-w-xs text-muted-foreground">Your advisor hasn't created any FAQ items yet. Check back later.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
