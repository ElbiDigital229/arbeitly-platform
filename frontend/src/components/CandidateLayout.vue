<template>
  <div class="flex h-screen overflow-hidden bg-background">

    <!-- Sidebar -->
    <aside
      :class="['flex flex-col h-screen border-r border-[hsl(196,50%,18%)] transition-all duration-200 shrink-0 bg-[hsl(196,89%,10%)]', collapsed ? 'w-14' : 'w-56']"
    >
      <!-- Header -->
      <div class="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
        <div class="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-primary">
          <span class="text-white font-bold text-xs">A</span>
        </div>
        <span v-if="!collapsed" class="font-bold text-sm font-display text-foreground">Candidate</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        <p v-if="!collapsed" class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">My Portal</p>

        <router-link
          v-for="item in portalItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button
            @click="navigate"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="[
              item.pro ? 'opacity-50 cursor-not-allowed' : '',
              isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-secondary/50'
            ]"
          >
            <span class="mdi text-base shrink-0" :class="item.icon" />
            <template v-if="!collapsed">
              <span class="truncate flex-1">{{ item.label }}</span>
              <span
                v-if="item.pro"
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-primary/15 text-primary"
              >PRO</span>
            </template>
          </button>
        </router-link>

        <!-- Account section -->
        <div class="pt-3">
          <p v-if="!collapsed" class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">Account</p>

          <router-link
            v-for="item in accountItems"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ isActive, navigate }"
          >
            <button
              @click="navigate"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :class="isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-secondary/50'"
            >
              <span class="mdi text-base shrink-0" :class="item.icon" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </button>
          </router-link>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-border px-2 py-2 shrink-0 space-y-0.5">
        <button
          @click="collapsed = !collapsed"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span class="mdi text-base shrink-0" :class="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
          <span v-if="!collapsed">Collapse</span>
        </button>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span class="mdi mdi-logout text-base shrink-0" />
          <span v-if="!collapsed">Log out</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header
        class="h-12 flex items-center justify-between px-3 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm"
      >
        <div class="flex items-center gap-2">
          <button
            @click="collapsed = !collapsed"
            class="h-8 w-8 rounded flex items-center justify-center transition-colors hover:bg-white/5 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span class="mdi mdi-menu text-base" />
          </button>
          <span class="text-sm font-semibold font-display text-foreground">{{ pageTitle }}</span>
        </div>

        <div class="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div class="relative w-full">
            <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted" />
            <input
              placeholder="Search..."
              class="input-field input-field-sm w-full pl-8 pr-3"
            />
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button class="h-8 w-8 rounded flex items-center justify-center hover:bg-white/5 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-help-circle-outline text-base" />
          </button>
          <button class="h-8 w-8 rounded flex items-center justify-center hover:bg-white/5 text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-bell-outline text-base" />
          </button>
          <div
            class="h-7 w-7 rounded-full ml-1 flex items-center justify-center text-[10px] font-bold shrink-0 bg-primary text-primary-foreground"
          >
            {{ initials }}
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-auto bg-background" :class="isFullBleed ? '' : 'p-6'">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const collapsed = ref(false);
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const portalItems = [
  { to: '/candidate/applications', icon: 'mdi-view-column-outline', label: 'Applications' },
  { to: '/candidate/cv', icon: 'mdi-file-document-outline', label: 'CV' },
  { to: '/candidate/files', icon: 'mdi-folder-outline', label: 'Files' },
  { to: '/candidate/faq', icon: 'mdi-help-circle-outline', label: 'FAQ', pro: true },
  { to: '/candidate/onboarding', icon: 'mdi-clipboard-check-outline', label: 'Onboarding', pro: true },
];

const accountItems = [
  { to: '/candidate/profile', icon: 'mdi-account-cog-outline', label: 'Profile & Settings' },
];

const pageTitles: Record<string, string> = {
  '/candidate/applications': 'Applications',
  '/candidate/cv': 'My CV',
  '/candidate/files': 'Files',
  '/candidate/faq': 'FAQ & Interview Prep',
  '/candidate/onboarding': 'My Onboarding',
  '/candidate/profile': 'Profile & Settings',
};

const fullBleedPaths = ['/candidate/cv', '/candidate/files'];

const pageTitle = computed(() => pageTitles[route.path] || 'Portal');
const isFullBleed = computed(() => fullBleedPaths.includes(route.path));
const initials = computed(() => {
  const email = auth.user?.email || 'U';
  return email.slice(0, 2).toUpperCase();
});

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
