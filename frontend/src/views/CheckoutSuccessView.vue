<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center max-w-md mx-auto px-6">
      <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
        <v-icon size="32" color="success">mdi-check-circle</v-icon>
      </div>
      <h1 class="text-2xl font-display font-bold text-foreground mb-3">Payment Successful</h1>
      <p class="text-muted mb-8">
        Your subscription has been activated. You now have access to all premium features.
      </p>
      <router-link
        to="/candidate/applications"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
        <v-icon size="18">mdi-arrow-right</v-icon>
      </router-link>
    </div>
  </div>
</template>
