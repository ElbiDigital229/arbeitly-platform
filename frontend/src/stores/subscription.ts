import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  applicationLimit: number;
  features: { text: string; included: boolean }[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

interface CurrentPlan {
  plan: Plan | null;
  status: 'FREE' | 'PAID';
  applicationLimitUsed?: number;
  applicationLimit?: number;
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const currentPlan = ref<CurrentPlan | null>(null);
  const loading = ref(false);

  async function fetchCurrentPlan() {
    loading.value = true;
    try {
      const { data } = await api.get('/payment/subscription');
      currentPlan.value = data.data;
    } catch {
      currentPlan.value = { plan: null, status: 'FREE' };
    } finally {
      loading.value = false;
    }
  }

  async function purchasePlan(planId: string) {
    const { data } = await api.post('/payment/purchase', { planId });
    await fetchCurrentPlan();
    return data.data;
  }

  return {
    currentPlan,
    loading,
    fetchCurrentPlan,
    purchasePlan,
  };
});
