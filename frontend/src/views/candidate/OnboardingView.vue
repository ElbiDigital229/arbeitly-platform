<template>
  <div class="max-w-2xl space-y-6">
    <!-- Empty state (no onboarding data yet) -->
    <div class="text-center py-16 space-y-4">
      <div class="flex justify-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <span class="mdi mdi-clipboard-check-outline text-3xl text-primary" />
        </div>
      </div>
      <h2 class="text-xl font-bold font-display text-foreground">
        Onboarding Not Completed
      </h2>
      <p class="max-w-sm mx-auto text-muted-foreground">
        Complete your onboarding so we can match you with the best job opportunities.
      </p>
      <button
        class="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-90 bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Start Onboarding
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
