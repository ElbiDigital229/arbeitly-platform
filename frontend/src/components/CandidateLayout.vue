<template>
  <div class="flex h-screen overflow-hidden bg-background">

    <!-- Sidebar -->
    <aside
      :class="['flex flex-col h-screen border-r border-sidebar-border transition-all duration-200 shrink-0 bg-sidebar', collapsed ? 'w-14' : 'w-56']"
    >
      <!-- Header -->
      <div class="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border shrink-0">
        <img src="../assets/logo.png" alt="Arbeitly" class="h-7 shrink-0" />
        <span v-if="!collapsed" class="font-display text-base font-bold text-sidebar-foreground">Candidate</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        <p v-if="!collapsed" class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{{ t('nav.portal') }}</p>

        <router-link
          v-for="item in portalItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button
            @click="navigate"
            class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            :class="[
              item.pro && !auth.user?.plan ? 'opacity-50 cursor-not-allowed' : '',
              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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

        <!-- Account section -->
        <div class="pt-3">
          <p v-if="!collapsed" class="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">{{ t('nav.account') }}</p>

          <router-link
            v-for="item in accountItems"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ isActive, navigate }"
          >
            <button
              @click="navigate"
              class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              :class="isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'"
            >
              <span class="mdi text-base shrink-0" :class="item.icon" />
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </button>
          </router-link>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t border-sidebar-border px-2 py-2 shrink-0 space-y-0.5">
        <button
          @click="collapsed = !collapsed"
          class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span class="mdi text-base shrink-0" :class="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
          <span v-if="!collapsed">{{ t('nav.collapse') }}</span>
        </button>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span class="mdi mdi-logout text-base shrink-0" />
          <span v-if="!collapsed">{{ t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header
        class="h-12 flex items-center justify-between px-3 shrink-0 border-b border-border bg-card"
      >
        <div class="flex items-center gap-2">
          <button
            @click="collapsed = !collapsed"
            class="h-8 w-8 rounded flex items-center justify-center transition-colors hover:bg-secondary/50 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span class="mdi mdi-menu text-base" />
          </button>
          <span class="text-sm font-semibold font-display text-foreground">{{ pageTitle }}</span>
        </div>

        <div class="hidden md:flex items-center flex-1 max-w-xs mx-4">
          <div class="relative w-full">
            <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
            <input
              :placeholder="t('nav.search')"
              class="h-8 w-full rounded-md bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div class="flex items-center gap-1">
          <router-link
            v-if="auth.user?.plan"
            to="/candidate/profile"
            class="hidden sm:flex items-center gap-1 h-7 px-3 rounded-full text-xs font-medium mr-1 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          >
            <span class="mdi mdi-star text-sm" />
            {{ auth.user.plan.name }}
          </router-link>
          <router-link
            v-else
            to="/pricing"
            class="hidden sm:flex items-center gap-1 h-7 px-3 rounded-full text-xs font-medium mr-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span class="mdi mdi-creation text-sm" />
            {{ t('nav.upgrade') }}
          </router-link>
          <!-- locale toggle hidden — EN only for now -->
          <button class="h-8 w-8 rounded flex items-center justify-center hover:bg-secondary/50 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-help-circle-outline text-base" />
          </button>
          <button class="relative h-8 w-8 rounded flex items-center justify-center hover:bg-secondary/50 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-bell-outline text-base" />
            <span
              v-if="notificationCount > 0"
              class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground leading-none"
            >{{ notificationCount }}</span>
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
import { useLocale } from '../composables/useLocale';

const collapsed = ref(false);
const notificationCount = ref(0);
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useLocale();

const portalItems = computed(() => [
  { to: '/candidate/applications', icon: 'mdi-view-column-outline', label: t('nav.applications') },
  { to: '/candidate/cv', icon: 'mdi-file-document-outline', label: t('nav.cv') },
  { to: '/candidate/files', icon: 'mdi-folder-outline', label: t('nav.files') },
  { to: '/candidate/faq', icon: 'mdi-help-circle-outline', label: t('nav.faq'), pro: true },
]);

const accountItems = computed(() => [
  { to: '/candidate/profile', icon: 'mdi-account-cog-outline', label: t('nav.profile') },
]);

const pageTitles = computed(() => ({
  '/candidate/applications': t('nav.applications'),
  '/candidate/cv': t('nav.cv'),
  '/candidate/files': t('nav.files'),
  '/candidate/faq': t('nav.faq'),
  '/candidate/onboarding': t('nav.onboarding'),
  '/candidate/profile': t('nav.profile'),
} as Record<string, string>));

const fullBleedPaths = ['/candidate/cv', '/candidate/files'];

const pageTitle = computed(() => pageTitles.value[route.path] || 'Portal');
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
