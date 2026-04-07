<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <aside
      :class="[
        'flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56',
      ]"
    >
      <!-- Header -->
      <div class="flex items-center gap-2 px-3 py-3 border-b border-sidebar-border shrink-0">
        <img src="../assets/logo.png" alt="Arbeitly" class="h-7 shrink-0" />
        <span v-if="!collapsed" class="font-display text-base font-bold text-sidebar-foreground">{{ brand }}</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        <template v-for="(section, idx) in sections" :key="idx">
          <p
            v-if="!collapsed && section.label"
            :class="[idx > 0 ? 'pt-3' : '', 'px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50']"
          >
            {{ section.label }}
          </p>
          <div v-else-if="idx > 0" class="pt-3" />
          <router-link
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ isActive, navigate }"
          >
            <button
              @click="navigate"
              :disabled="item.disabled"
              class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              :class="[
                item.disabled ? 'opacity-50 cursor-not-allowed' : '',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              ]"
            >
              <span class="mdi text-base shrink-0" :class="item.icon" />
              <template v-if="!collapsed">
                <span class="truncate flex-1">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-primary/15 text-primary"
                >{{ item.badge }}</span>
              </template>
            </button>
          </router-link>
        </template>
      </nav>

      <!-- Footer -->
      <div class="border-t border-sidebar-border px-2 py-2 shrink-0 space-y-0.5">
        <router-link
          v-for="item in footerItems"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <button
            @click="navigate"
            class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            :class="
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            "
          >
            <span class="mdi text-base shrink-0" :class="item.icon" />
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </button>
        </router-link>
        <button
          @click="collapsed = !collapsed"
          class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span class="mdi text-base shrink-0" :class="collapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
          <span v-if="!collapsed">{{ collapseLabel }}</span>
        </button>
        <button
          @click="$emit('logout')"
          class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span class="mdi mdi-logout text-base shrink-0" />
          <span v-if="!collapsed">{{ logoutLabel }}</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-12 flex items-center justify-between px-3 shrink-0 border-b border-border bg-card">
        <div class="flex items-center gap-2">
          <button
            @click="collapsed = !collapsed"
            class="h-8 w-8 rounded flex items-center justify-center transition-colors hover:bg-secondary/50 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span class="mdi mdi-menu text-base" />
          </button>
          <span class="text-sm font-semibold font-display text-foreground">{{ pageTitle }}</span>
        </div>

        <slot name="header-center" />

        <div class="flex items-center gap-1">
          <slot name="header-right" />
        </div>
      </header>

      <main class="flex-1 overflow-auto bg-background" :class="fullBleed ? '' : 'p-6'">
        <slot>
          <router-view />
        </slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface NavItem {
  to: string;
  icon: string;
  label: string;
  disabled?: boolean;
  badge?: string;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

withDefaults(
  defineProps<{
    brand: string;
    sections: NavSection[];
    pageTitle: string;
    footerItems?: NavItem[];
    fullBleed?: boolean;
    collapseLabel?: string;
    logoutLabel?: string;
  }>(),
  {
    footerItems: () => [],
    fullBleed: false,
    collapseLabel: 'Collapse',
    logoutLabel: 'Log out',
  },
);

defineEmits<{
  logout: [];
}>();

const collapsed = ref(false);
</script>
