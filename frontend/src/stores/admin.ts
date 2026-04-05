import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(localStorage.getItem('arbeitly_admin_token'));
  const user = ref<any>(null);
  const isAuthenticated = computed(() => !!token.value);

  async function signin(email: string, password: string) {
    const { data } = await axios.post('/api/admin/signin', { email, password });
    token.value = data.data.token;
    user.value = data.data.user;
    localStorage.setItem('arbeitly_admin_token', data.data.token);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('arbeitly_admin_token');
  }

  function getAuthHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  }

  return { token, user, isAuthenticated, signin, logout, getAuthHeaders };
});
