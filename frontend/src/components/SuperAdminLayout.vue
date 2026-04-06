<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <aside :class="['flex flex-col h-screen border-r transition-all duration-200 shrink-0', collapsed ? 'w-14' : 'w-56']" style="background: hsl(var(--sidebar-background)); border-color: hsl(var(--sidebar-border));">
      <div class="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border shrink-0">
        <img src="../assets/logo.png" alt="Arbeitly" class="h-7 shrink-0" />
        <span v-if="!collapsed" class="font-display text-base font-bold text-sidebar-foreground">Admin</span>
      </div>
      <nav class="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Platform</p>
        <router-link v-for="item in platformItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
          <button @click="navigate" :class="['w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground']">
            <span class="mdi text-base shrink-0" :class="item.icon" /><span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </button>
        </router-link>

        <div class="pt-3">
          <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Customers</p>
          <router-link v-for="item in customerItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
            <button @click="navigate" :class="['w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground']">
              <span class="mdi text-base shrink-0" :class="item.icon" /><span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </button>
          </router-link>
        </div>

        <div class="pt-3">
          <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Configuration</p>
          <router-link v-for="item in configItems" :key="item.to" :to="item.to" custom v-slot="{ isActive, navigate }">
            <button @click="navigate" :class="['w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground']">
              <span class="mdi text-base shrink-0" :class="item.icon" /><span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </button>
          </router-link>
        </div>
      </nav>
      <div class="border-t border-sidebar-border px-2 py-2 shrink-0 space-y-0.5">
        <router-link to="/superadmin/profile" custom v-slot="{ isActive, navigate }">
          <button @click="navigate" :class="['w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground']">
            <span class="mdi mdi-cog-outline text-base shrink-0" /><span v-if="!collapsed">Settings</span>
          </button>
        </router-link>
        <button @click="handleLogout" class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <span class="mdi mdi-logout text-base shrink-0" /><span v-if="!collapsed">Log out</span>
        </button>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-12 flex items-center justify-between px-3 shrink-0 border-b border-border bg-card">
        <div class="flex items-center gap-2">
          <button @click="collapsed = !collapsed" class="h-8 w-8 rounded flex items-center justify-center hover:bg-secondary/50 text-muted-foreground"><span class="mdi mdi-menu text-base" /></button>
          <span class="text-sm font-semibold font-display text-foreground">{{ pageTitle }}</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">ADMIN</span>
      </header>
      <main class="flex-1 overflow-auto bg-background p-6"><router-view /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '../stores/admin';

const store = useAdminStore();
const route = useRoute();
const router = useRouter();
const collapsed = ref(false);

const platformItems = [
  { to: '/superadmin/overview', icon: 'mdi-view-dashboard-outline', label: 'Overview' },
  { to: '/superadmin/transactions', icon: 'mdi-credit-card-outline', label: 'Transactions' },
];
const customerItems = [
  { to: '/superadmin/candidates', icon: 'mdi-account-group-outline', label: 'Candidates' },
  { to: '/superadmin/employees', icon: 'mdi-badge-account-outline', label: 'Employees' },
  { to: '/superadmin/plans', icon: 'mdi-tag-outline', label: 'Pricing Plans' },
  { to: '/superadmin/performance', icon: 'mdi-chart-line', label: 'Performance' },
];
const configItems = [
  { to: '/superadmin/ai-config', icon: 'mdi-brain', label: 'AI Config' },
  { to: '/superadmin/audit-log', icon: 'mdi-clipboard-list-outline', label: 'Audit Log' },
  { to: '/superadmin/system-settings', icon: 'mdi-tune-variant', label: 'System Settings' },
];

const pageTitles: Record<string, string> = {
  '/superadmin/overview': 'Platform Overview',
  '/superadmin/transactions': 'Transactions',
  '/superadmin/candidates': 'Candidates',
  '/superadmin/employees': 'Employees',
  '/superadmin/plans': 'Pricing Plans',
  '/superadmin/performance': 'Employee Performance',
  '/superadmin/ai-config': 'AI Configuration',
  '/superadmin/audit-log': 'Audit Log',
  '/superadmin/system-settings': 'System Settings',
  '/superadmin/profile': 'My Profile',
};
const pageTitle = computed(() => pageTitles[route.path] || 'Super Admin');

function handleLogout() { store.logout(); router.push('/superadmin/login'); }
</script>
