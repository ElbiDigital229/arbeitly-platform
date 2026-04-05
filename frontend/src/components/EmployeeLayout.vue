<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <aside :class="['flex flex-col h-screen border-r transition-all duration-200 shrink-0', collapsed ? 'w-14' : 'w-56']" style="background: hsl(var(--sidebar-background)); border-color: hsl(var(--sidebar-border));">
      <!-- Header -->
      <div class="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border shrink-0">
        <img src="../assets/logo.png" alt="Arbeitly" class="h-7 shrink-0" />
        <span v-if="!collapsed" class="font-display text-base font-bold text-sidebar-foreground">Employee</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Main</p>
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button @click="navigate" :class="[
            'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          ]">
            <span class="mdi text-base shrink-0" :class="item.icon" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </button>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="border-t border-sidebar-border px-2 py-2 shrink-0 space-y-0.5">
        <router-link to="/employee/settings" custom v-slot="{ isActive, navigate }">
          <button @click="navigate" :class="[
            'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left',
            isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          ]">
            <span class="mdi mdi-cog-outline text-base shrink-0" />
            <span v-if="!collapsed">Settings</span>
          </button>
        </router-link>
        <button @click="handleLogout" class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <span class="mdi mdi-logout text-base shrink-0" />
          <span v-if="!collapsed">Log out</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-12 flex items-center justify-between px-3 shrink-0 border-b border-border bg-card">
        <div class="flex items-center gap-2">
          <button @click="collapsed = !collapsed" class="h-8 w-8 rounded flex items-center justify-center hover:bg-secondary/50 text-muted-foreground">
            <span class="mdi mdi-menu text-base" />
          </button>
          <span class="text-sm font-semibold font-display text-foreground">{{ pageTitle }}</span>
        </div>
        <div class="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
          {{ initials }}
        </div>
      </header>
      <main class="flex-1 overflow-auto bg-background p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmployeeStore } from '../stores/employee';

const store = useEmployeeStore();
const route = useRoute();
const router = useRouter();
const collapsed = ref(false);

const navItems = [
  { to: '/employee/dashboard', icon: 'mdi-view-dashboard-outline', label: 'Overview' },
  { to: '/employee/candidates', icon: 'mdi-account-group-outline', label: 'Candidates' },
  { to: '/employee/job-discovery', icon: 'mdi-briefcase-search-outline', label: 'Job Discovery' },
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
