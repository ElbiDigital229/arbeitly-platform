import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

interface Subscription {
  planTier: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<Subscription | null>(null);
  const loading = ref(false);

  async function fetchSubscription() {
    loading.value = true;
    try {
      const { data } = await axios.get('/api/payments/subscription');
      subscription.value = data.data;
    } catch {
      subscription.value = { planTier: 'FREE', status: 'ACTIVE' };
    } finally {
      loading.value = false;
    }
  }

  async function startCheckout(tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE') {
    const { data } = await axios.post('/api/payments/create-checkout', { tier });
    if (data.data.url) {
      window.location.href = data.data.url;
    }
  }

  async function openPortal() {
    const { data } = await axios.post('/api/payments/portal');
    if (data.data.url) {
      window.location.href = data.data.url;
    }
  }

  return {
    subscription,
    loading,
    fetchSubscription,
    startCheckout,
    openPortal,
  };
});
