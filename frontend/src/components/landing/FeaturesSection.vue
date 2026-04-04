<template>
  <section id="features" class="py-24 bg-background">
    <div class="container mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="font-display text-4xl font-bold text-foreground">
          Why <span class="text-gradient">Arbeitly</span>?
        </h2>
        <p class="mt-4 text-lg text-muted-foreground">
          Applying for jobs is exhausting. We built Arbeitly so you can focus on your current job while we apply to better ones for you.
        </p>
      </div>

      <div ref="gridRef" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          :class="{ 'animate-fade-in': gridVisible }"
          :style="gridVisible ? { animationDelay: `${index * 0.1}s`, animationFillMode: 'both' } : { opacity: 0 }"
        >
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span class="mdi text-xl text-primary" :class="feature.icon" />
          </div>
          <h3 class="font-display text-lg font-semibold text-card-foreground">
            {{ feature.title }}
          </h3>
          <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const gridRef = ref<HTMLElement | null>(null);
const gridVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (gridRef.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gridVisible.value = true;
          observer?.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(gridRef.value);
  }
});

onBeforeUnmount(() => observer?.disconnect());

const features = [
  {
    icon: 'mdi-file-document-outline',
    title: 'CV Optimization',
    description: 'AI-powered ATS optimization with keyword extraction. Upload your CV and get a polished, recruiter-ready version.',
  },
  {
    icon: 'mdi-pencil-outline',
    title: 'Cover Letter Engine',
    description: 'Generate job-specific cover letters tailored to each role. Editable and ready to send in seconds.',
  },
  {
    icon: 'mdi-magnify',
    title: 'Job Discovery',
    description: 'Intelligent job matching from LinkedIn, Indeed, and more. Find roles that fit your skills and experience.',
  },
  {
    icon: 'mdi-chart-bar',
    title: 'Application Tracking',
    description: "Monitor every application's status. From applied to offer — track your entire job search journey.",
  },
  {
    icon: 'mdi-translate',
    title: 'Multi-Language',
    description: 'Full support for German and English. Generate documents in either language with natural fluency.',
  },
  {
    icon: 'mdi-shield-check-outline',
    title: 'GDPR Compliant',
    description: 'EU-hosted infrastructure with encryption at rest and in transit. Your data stays secure and private.',
  },
];
</script>
