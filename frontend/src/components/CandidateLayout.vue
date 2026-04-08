<template>
  <SidebarLayout
    brand="Candidate"
    :sections="sections"
    :page-title="pageTitle"
    :full-bleed="isFullBleed"
    :collapse-label="t('nav.collapse')"
    :logout-label="t('nav.logout')"
    @logout="handleLogout"
  >
    <template #header-center>
      <div class="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div class="relative w-full">
          <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
          <input
            :placeholder="t('nav.search')"
            class="h-8 w-full rounded-md bg-secondary border-none pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </template>

    <template #header-right>
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
      <div class="h-7 w-7 rounded-full ml-1 flex items-center justify-center text-[10px] font-bold shrink-0 bg-primary text-primary-foreground">
        {{ initials }}
      </div>
    </template>
  </SidebarLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLocale } from '../composables/useLocale';
import SidebarLayout, { type NavSection } from './SidebarLayout.vue';

const notificationCount = ref(0);
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useLocale();

const sections = computed<NavSection[]>(() => [
  {
    label: t('nav.portal'),
    items: [
      { to: '/candidate/applications', icon: 'mdi-view-column-outline', label: t('nav.applications') },
      { to: '/candidate/cv', icon: 'mdi-file-document-outline', label: t('nav.cv') },
      { to: '/candidate/files', icon: 'mdi-folder-outline', label: t('nav.files') },
      {
        to: '/candidate/faq',
        icon: 'mdi-help-circle-outline',
        label: t('nav.faq'),
        disabled: !auth.user?.plan,
        badge: auth.user?.plan ? undefined : 'PRO',
      },
    ],
  },
  {
    label: t('nav.account'),
    items: [{ to: '/candidate/profile', icon: 'mdi-account-cog-outline', label: t('nav.profile') }],
  },
]);

const pageTitles = computed(
  () =>
    ({
      '/candidate/applications': t('nav.applications'),
      '/candidate/cv': t('nav.cv'),
      '/candidate/files': t('nav.files'),
      '/candidate/faq': t('nav.faq'),
      '/candidate/onboarding': t('nav.onboarding'),
      '/candidate/profile': t('nav.profile'),
    }) as Record<string, string>,
);

const fullBleedPaths = ['/candidate/cv', '/candidate/files'];

const pageTitle = computed(() => pageTitles.value[route.path] || 'Portal');
const isFullBleed = computed(() => fullBleedPaths.includes(route.path));
const initials = computed(() => (auth.user?.email || 'U').slice(0, 2).toUpperCase());

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
