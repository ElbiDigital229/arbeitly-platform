<template>
  <footer class="border-t border-border bg-card py-12">
    <div class="container mx-auto px-6">
      <div class="grid md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <router-link to="/" class="flex items-center gap-2">
            <img src="../../assets/logo.png" alt="Arbeitly" class="h-8" />
          </router-link>
          <p class="mt-3 text-sm text-muted-foreground">
            AI-powered job application automation. Made in Germany.
          </p>
        </div>

        <!-- Product -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-3">Product</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" class="hover:text-primary transition-colors">Features</a></li>
            <li><a href="#pricing" class="hover:text-primary transition-colors">Pricing</a></li>
            <li><a href="#how-it-works" class="hover:text-primary transition-colors">How It Works</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-3">Company</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" class="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Blogs</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">FAQs</a></li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-display font-semibold text-foreground mb-3">Legal</h4>
          <ul class="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" class="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Terms of Service</a></li>
            <li><a href="#" class="hover:text-primary transition-colors">Impressum</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © {{ new Date().getFullYear() }} Arbeitly. All rights reserved. EU-hosted & GDPR compliant.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
