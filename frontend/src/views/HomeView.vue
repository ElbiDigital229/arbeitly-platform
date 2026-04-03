<template>
  <div class="min-h-screen" style="background: var(--color-bg);">
    <LandingNavbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <PricingSection />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import LandingNavbar from '../components/landing/LandingNavbar.vue';
import HeroSection from '../components/landing/HeroSection.vue';
import FeaturesSection from '../components/landing/FeaturesSection.vue';
import HowItWorksSection from '../components/landing/HowItWorksSection.vue';
import PricingSection from '../components/landing/PricingSection.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';
</script>
