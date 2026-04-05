import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  onboardingCompleted: boolean;
  applicationLimitUsed: number;
}

interface Usage {
  cvCreationLimit: number;
  cvCreationsUsed: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  applicationLimit: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: CandidateProfile | null;
  usage: Usage | null;
  plan: Plan | null;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('arbeitly_token'));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('arbeitly_token', newToken);
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('arbeitly_token');
  }

  async function register(email: string, password: string, confirmPassword: string) {
    const { data } = await api.post('/auth/register', { email, password, confirmPassword });
    setToken(data.data.token);
    user.value = data.data.user;
    await fetchMe();
    return data.data;
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.data.token);
    user.value = data.data.user;
    await fetchMe();
    return data.data;
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const { data } = await api.get('/auth/me');
      user.value = data.data;
    } catch {
      clearAuth();
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data.data;
  }

  function logout() {
    clearAuth();
  }

  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchMe,
    changePassword,
  };
});
