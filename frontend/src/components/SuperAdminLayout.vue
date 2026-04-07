<template>
  <SidebarLayout
    brand="Admin"
    :sections="sections"
    :page-title="pageTitle"
    :footer-items="footerItems"
    @logout="handleLogout"
  >
    <template #header-right>
      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">ADMIN</span>
    </template>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '../stores/admin';
import SidebarLayout, { type NavItem, type NavSection } from './SidebarLayout.vue';

const store = useAdminStore();
const route = useRoute();
const router = useRouter();

const sections: NavSection[] = [
  {
    label: 'Platform',
    items: [
      { to: '/superadmin/overview', icon: 'mdi-view-dashboard-outline', label: 'Overview' },
      { to: '/superadmin/transactions', icon: 'mdi-credit-card-outline', label: 'Transactions' },
    ],
  },
  {
    label: 'Customers',
    items: [
      { to: '/superadmin/candidates', icon: 'mdi-account-group-outline', label: 'Candidates' },
      { to: '/superadmin/employees', icon: 'mdi-badge-account-outline', label: 'Employees' },
      { to: '/superadmin/plans', icon: 'mdi-tag-outline', label: 'Pricing Plans' },
      { to: '/superadmin/performance', icon: 'mdi-chart-line', label: 'Performance' },
      { to: '/superadmin/job-discovery', icon: 'mdi-briefcase-search-outline', label: 'Job Discovery' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/superadmin/ai-config', icon: 'mdi-brain', label: 'AI Config' },
      { to: '/superadmin/audit-log', icon: 'mdi-clipboard-list-outline', label: 'Audit Log' },
      { to: '/superadmin/system-settings', icon: 'mdi-tune-variant', label: 'System Settings' },
    ],
  },
];

const footerItems: NavItem[] = [
  { to: '/superadmin/profile', icon: 'mdi-cog-outline', label: 'Settings' },
];

const pageTitles: Record<string, string> = {
  '/superadmin/overview': 'Platform Overview',
  '/superadmin/transactions': 'Transactions',
  '/superadmin/candidates': 'Candidates',
  '/superadmin/employees': 'Employees',
  '/superadmin/plans': 'Pricing Plans',
  '/superadmin/performance': 'Employee Performance',
  '/superadmin/job-discovery': 'Job Discovery',
  '/superadmin/ai-config': 'AI Configuration',
  '/superadmin/audit-log': 'Audit Log',
  '/superadmin/system-settings': 'System Settings',
  '/superadmin/profile': 'My Profile',
};
const pageTitle = computed(() => pageTitles[route.path] || 'Super Admin');

// Reference store so unused-import lint stays happy and admin auth side-effects load
void store;

function handleLogout() {
  store.logout();
  router.push('/superadmin/login');
}
</script>
