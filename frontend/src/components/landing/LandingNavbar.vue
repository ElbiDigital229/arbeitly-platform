<template>
  <nav class="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
    <div class="container mx-auto flex h-16 items-center justify-between px-6">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2">
        <img src="../../assets/logo.png" alt="Arbeitly" class="h-8" />
      </router-link>

      <!-- Center nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
        <a href="#how-it-works" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</a>
        <router-link to="/pricing" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</router-link>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Sign In dropdown -->
        <div class="relative" ref="dropdownRef">
          <button
            @click="signInOpen = !signInOpen"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors hover:bg-secondary hover:text-foreground text-foreground"
          >
            Sign In
            <span class="mdi mdi-chevron-down text-base transition-transform" :class="{ 'rotate-180': signInOpen }" />
          </button>

          <transition name="fade-dropdown">
            <div
              v-if="signInOpen"
              class="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card overflow-hidden shadow-xl"
            >
              <p class="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Choose your portal
              </p>
              <!-- Candidate login -->
              <router-link
                to="/login"
                class="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                @click="signInOpen = false"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span class="mdi mdi-account-circle-outline text-base text-blue-400" />
                </div>
                <div>
                  <p class="font-medium text-sm">Candidate</p>
                  <p class="text-[11px] text-muted-foreground">Job seekers & applicants</p>
                </div>
              </router-link>
              <!-- Employee login -->
              <router-link
                to="/employee/login"
                class="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/60 transition-colors border-t border-border/40"
                @click="signInOpen = false"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <span class="mdi mdi-view-dashboard-outline text-base text-primary" />
                </div>
                <div>
                  <p class="font-medium text-sm">Employee</p>
                  <p class="text-[11px] text-muted-foreground">Arbeitly team members</p>
                </div>
              </router-link>
              <!-- Super Admin login -->
              <router-link
                to="/superadmin/login"
                class="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/60 transition-colors border-t border-border/40"
                @click="signInOpen = false"
              >
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span class="mdi mdi-shield-account-outline text-base text-purple-400" />
                </div>
                <div>
                  <p class="font-medium text-sm">Super Admin</p>
                  <p class="text-[11px] text-muted-foreground">Platform management</p>
                </div>
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Get Started -->
        <router-link
          to="/register?plan=free"
          class="px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-primary text-primary-foreground"
        >
          Get Started
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const signInOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function handleOutsideClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    signInOpen.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick));
</script>

<style scoped>
.fade-dropdown-enter-active,
.fade-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-dropdown-enter-from,
.fade-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
