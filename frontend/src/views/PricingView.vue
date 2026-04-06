<template>
  <div class="min-h-screen bg-background">
    <LandingNavbar />

    <!-- Page header -->
    <div class="pt-24 pb-12">
      <div class="container mx-auto px-6 text-center">
        <h1
          class="text-4xl md:text-5xl font-bold animate-fade-in text-foreground"
          style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;"
        >
          Choose Your Plan
        </h1>
        <p
          class="mt-4 text-lg max-w-2xl mx-auto animate-fade-in text-muted-foreground"
          style="animation-delay: 0.1s; animation-fill-mode: both;"
        >
          Start with a 14-day free trial. No credit card required. Upgrade or downgrade anytime.
        </p>
      </div>
    </div>

    <PricingSection />

    <!-- FAQ -->
    <div class="py-16 bg-background">
      <div class="container mx-auto px-6">
        <div class="max-w-3xl mx-auto text-center">
          <h2
            class="text-2xl font-bold mb-4 text-foreground"
            style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif;"
          >
            Frequently Asked Questions
          </h2>
          <div class="grid md:grid-cols-2 gap-6 mt-8 text-left">
            <div
              v-for="faq in faqs"
              :key="faq.q"
              class="p-4 rounded-xl border border-border bg-card"
            >
              <h3 class="font-semibold mb-2 text-foreground">{{ faq.q }}</h3>
              <p class="text-sm text-muted-foreground">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import LandingNavbar from '../components/landing/LandingNavbar.vue';
import PricingSection from '../components/landing/PricingSection.vue';
import LandingFooter from '../components/landing/LandingFooter.vue';

const faqs = [
  {
    q: 'Can I change plans anytime?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, PayPal, and SEPA bank transfers for EU customers.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our service.',
  },
  {
    q: 'Do you offer custom enterprise solutions?',
    a: "Absolutely! Contact our sales team for custom pricing tailored to your organization's needs.",
  },
];
</script>
