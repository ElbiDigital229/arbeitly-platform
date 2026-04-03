<template>
  <aside
    :class="[
      'flex flex-col h-screen border-r transition-all duration-200 shrink-0',
      collapsed ? 'w-[52px]' : 'w-[220px]'
    ]"
    style="background: var(--color-sidebar-bg); border-color: var(--color-sidebar-border);"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-3 border-b" style="border-color: var(--color-border);">
      <div class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style="background: var(--color-primary);">
        <span class="text-white font-bold text-xs">A</span>
      </div>
      <span v-if="!collapsed" class="font-bold text-sm" style="color: var(--color-foreground);">Arbeitly</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
      <p v-if="!collapsed" class="px-2 pb-1 text-[10px] uppercase tracking-wider" style="color: var(--color-muted);">My Portal</p>

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
            'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors text-left',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted hover:bg-white/5'
          ]"
          :style="isActive ? 'color: var(--color-primary);' : 'color: var(--color-muted);'"
        >
          <span class="mdi text-base shrink-0" :class="item.icon" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </button>
      </router-link>

      <div class="pt-3">
        <p v-if="!collapsed" class="px-2 pb-1 text-[10px] uppercase tracking-wider" style="color: var(--color-muted);">Account</p>
        <router-link to="/candidate/profile" custom v-slot="{ isActive, navigate }">
          <button
            @click="navigate"
            :class="[
              'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors text-left',
              isActive ? 'bg-primary/10' : 'hover:bg-white/5'
            ]"
            :style="isActive ? 'color: var(--color-primary);' : 'color: var(--color-muted);'"
          >
            <span class="mdi mdi-account-outline text-base shrink-0" />
            <span v-if="!collapsed">Profile & Settings</span>
          </button>
        </router-link>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t px-2 py-2" style="border-color: var(--color-border);">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
        style="color: var(--color-muted);"
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

const navItems = [
  { to: '/candidate/applications', icon: 'mdi-briefcase-outline', label: 'Applications' },
  { to: '/candidate/cv', icon: 'mdi-file-document-outline', label: 'CV' },
];

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
