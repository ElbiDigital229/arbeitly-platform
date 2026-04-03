<template>
  <section class="relative min-h-screen flex items-center justify-center bg-hero overflow-hidden">
    <div class="absolute inset-0 bg-hero-radial opacity-60" />

    <div class="container relative z-10 mx-auto px-6 pt-24 pb-16 text-center">
      <h1
        class="font-display text-5xl md:text-7xl font-extrabold leading-tight text-foreground animate-fade-in"
      >
        We Apply.
        <br />
        <span class="text-gradient">You Grow.</span>
      </h1>

      <p
        class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground animate-fade-in"
        style="animation-delay: 0.15s; animation-fill-mode: both;"
      >
        Arbeitly helps you land your ideal role by managing job searches, optimizing CVs, applying on jobs on your behalf and handling application tracking.
      </p>

      <p
        class="mx-auto mt-3 max-w-xl text-muted-foreground animate-fade-in"
        style="animation-delay: 0.25s; animation-fill-mode: both;"
      >
        We save your time and ensure your applications are professional, targeted, and effective.
      </p>

      <div
        class="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in"
        style="animation-delay: 0.35s; animation-fill-mode: both;"
      >
        <router-link
          to="/register?plan=free"
          class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Get Started
          <span class="mdi mdi-arrow-right text-lg" />
        </router-link>
        <a
          href="#how-it-works"
          class="inline-flex items-center px-8 py-3 rounded-full border border-border text-foreground font-semibold text-base hover:bg-secondary/60 transition-colors"
        >
          Schedule a Free Call
        </a>
      </div>

      <div
        class="mt-14 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in"
        style="animation-delay: 0.5s; animation-fill-mode: both;"
      >
        <span class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-primary" />
          ATS-Optimized CVs
        </span>
        <span class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-primary" />
          German & English
        </span>
        <span class="flex items-center gap-2">
          <span class="h-1.5 w-1.5 rounded-full bg-primary" />
          GDPR Compliant
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
