<template>
  <SidebarLayout
    brand="Employee"
    :sections="sections"
    :page-title="pageTitle"
    :footer-items="footerItems"
    @logout="handleLogout"
  >
    <template #header-right>
      <div class="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
        {{ initials }}
      </div>
    </template>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmployeeStore } from '../stores/employee';
import SidebarLayout, { type NavItem, type NavSection } from './SidebarLayout.vue';

const store = useEmployeeStore();
const route = useRoute();
const router = useRouter();

const sections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/employee/dashboard', icon: 'mdi-view-dashboard-outline', label: 'Overview' },
      { to: '/employee/candidates', icon: 'mdi-account-group-outline', label: 'Candidates' },
      { to: '/employee/job-discovery', icon: 'mdi-briefcase-search-outline', label: 'Job Discovery' },
    ],
  },
];

const footerItems: NavItem[] = [
  { to: '/employee/settings', icon: 'mdi-cog-outline', label: 'Settings' },
];

const pageTitles: Record<string, string> = {
  '/employee/dashboard': 'Operations Overview',
  '/employee/candidates': 'My Candidates',
  '/employee/job-discovery': 'Job Discovery',
  '/employee/settings': 'Settings',
};

const pageTitle = computed(() => {
  if (route.path.startsWith('/employee/candidates/')) return 'Candidate Details';
  return pageTitles[route.path] || 'Employee Portal';
});

const initials = computed(() => (store.user?.email || 'E').slice(0, 2).toUpperCase());

function handleLogout() {
  store.logout();
  router.push('/employee/login');
}
</script>
