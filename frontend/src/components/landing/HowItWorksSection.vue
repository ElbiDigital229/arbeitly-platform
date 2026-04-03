<template>
  <section id="how-it-works" class="py-24 bg-section-light">
    <div class="container mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="font-display text-4xl font-bold text-foreground">
          How It Works
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          Four simple steps to transform your job search
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="item in steps"
          :key="item.step"
          class="text-center rounded-xl border border-border bg-card p-6"
        >
          <div class="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span class="mdi text-3xl text-primary" :class="item.icon" />
            <span class="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {{ item.step }}
            </span>
          </div>
          <h3 class="font-display text-lg font-semibold text-foreground">{{ item.title }}</h3>
          <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    icon: 'mdi-upload-outline',
    step: '01',
    title: 'Understanding Career Goals',
    description: 'We understand your career goals and analyse your profile. Application documents are updated and improved.',
  },
  {
    icon: 'mdi-auto-fix',
    step: '02',
    title: 'Job Hunting & Applications',
    description: 'We search for the most relevant jobs and apply on the ones that align with your career goals.',
  },
  {
    icon: 'mdi-send-outline',
    step: '03',
    title: 'Realtime Application Tracking',
    description: 'From application submission to interview scheduling, you can track all updates, anytime.',
  },
  {
    icon: 'mdi-trending-up',
    step: '04',
    title: 'Job Secured',
    description: "We celebrate your success as you land the job that fits your goals. We're here to support your continued growth.",
  },
];
</script>
