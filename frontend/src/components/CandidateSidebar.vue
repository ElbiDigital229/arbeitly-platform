<template>
  <aside
    :class="[
      'flex flex-col h-screen border-r transition-all duration-200 shrink-0',
      collapsed ? 'w-[52px]' : 'w-[220px]'
    ]"
    style="background: hsl(var(--sidebar-background)); border-color: hsl(var(--sidebar-border));"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border">
      <img src="../assets/logo.png" alt="Arbeitly" class="h-7 shrink-0" />
      <span v-if="!collapsed" class="font-display text-base font-bold text-sidebar-foreground">Candidate</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
      <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">My Portal</p>

      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button
          @click="navigate"
          :class="[
            'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            item.pro && !auth.user?.plan ? 'opacity-50 cursor-not-allowed' : '',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          ]"
        >
          <span class="mdi text-base shrink-0" :class="item.icon" />
          <template v-if="!collapsed">
            <span class="truncate flex-1">{{ item.label }}</span>
            <span
              v-if="item.pro && !auth.user?.plan"
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-primary/15 text-primary"
            >PRO</span>
          </template>
        </button>
      </router-link>

      <div class="pt-3">
        <p v-if="!collapsed" class="px-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Account</p>
        <router-link to="/candidate/profile" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            :class="[
              'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            ]"
          >
            <span class="mdi mdi-account-outline text-base shrink-0" />
            <span v-if="!collapsed">Profile & Settings</span>
          </button>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-sidebar-border px-2 py-2">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <span class="mdi mdi-logout text-base shrink-0" />
        <span v-if="!collapsed">Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

defineProps<{ collapsed: boolean }>();

const auth = useAuthStore();
const router = useRouter();

const navItems: { to: string; icon: string; label: string; pro?: boolean }[] = [
  { to: '/candidate/browse', icon: 'mdi-magnify', label: 'Browse jobs' },
  { to: '/candidate/applications', icon: 'mdi-view-column-outline', label: 'Applications' },
  { to: '/candidate/cv', icon: 'mdi-file-document-outline', label: 'CV' },
  { to: '/candidate/files', icon: 'mdi-folder-outline', label: 'Files' },
  { to: '/candidate/faq', icon: 'mdi-help-circle-outline', label: 'FAQ', pro: true },
];

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
