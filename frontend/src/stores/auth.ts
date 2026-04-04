import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

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
}

interface Usage {
  cvCreationLimit: number;
  cvCreationsUsed: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile: CandidateProfile | null;
  usage: Usage | null;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('arbeitly_token'));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('arbeitly_token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearAuth() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('arbeitly_token');
    delete axios.defaults.headers.common['Authorization'];
  }

  async function register(email: string, password: string, confirmPassword: string) {
    const { data } = await axios.post('/api/auth/register', { email, password, confirmPassword });
    setToken(data.data.token);
    user.value = data.data.user;
    await fetchMe();
    return data.data;
  }

  async function login(email: string, password: string) {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setToken(data.data.token);
    user.value = data.data.user;
    // Fetch full profile after login
    await fetchMe();
    return data.data;
  }

  async function fetchMe() {
    if (!token.value) return;
    try {
      const { data } = await axios.get('/api/auth/me');
      user.value = data.data;
    } catch {
      // Token expired or invalid — clear auth
      clearAuth();
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const { data } = await axios.put('/api/auth/change-password', { currentPassword, newPassword });
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
