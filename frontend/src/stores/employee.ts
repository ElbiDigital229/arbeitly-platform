import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

interface EmployeeUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export const useEmployeeStore = defineStore('employee', () => {
  const token = ref<string | null>(localStorage.getItem('arbeitly_employee_token'));
  const user = ref<EmployeeUser | null>(null);
  const isAuthenticated = computed(() => !!token.value);

  async function signin(email: string, password: string) {
    const { data } = await axios.post('/api/employee/signin', { email, password });
    token.value = data.data.token;
    user.value = data.data.user;
    localStorage.setItem('arbeitly_employee_token', data.data.token);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('arbeitly_employee_token');
  }

  function getAuthHeaders() {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  }

  return { token, user, isAuthenticated, signin, logout, getAuthHeaders };
});
