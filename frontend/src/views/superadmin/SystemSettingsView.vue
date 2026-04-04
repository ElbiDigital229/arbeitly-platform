<template>
  <div class="max-w-2xl space-y-6">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-foreground">System Settings</h1>
        <p class="text-sm mt-0.5 text-muted-foreground">Global platform configuration.</p>
      </div>
      <button @click="save" :disabled="!dirty" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- General -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2"><span class="mdi mdi-cog-outline" /> General</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Platform Name</label>
            <input v-model="settings.platformName" @input="dirty = true" class="input-field" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Support Email</label>
            <input v-model="settings.supportEmail" @input="dirty = true" type="email" class="input-field" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Default Language</label>
            <select v-model="settings.defaultLanguage" @change="dirty = true" class="input-field">
              <option value="en">English</option><option value="de">Deutsch</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Timezone</label>
            <select v-model="settings.timezone" @change="dirty = true" class="input-field">
              <option value="Europe/Berlin">Europe/Berlin</option><option value="Europe/London">Europe/London</option><option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2"><span class="mdi mdi-bell-outline" /> Notifications</h3>
      </div>
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-foreground">Email Notifications</p>
            <p class="text-xs text-muted-foreground">Send email updates to candidates on application changes</p>
          </div>
          <button @click="settings.emailNotifications = !settings.emailNotifications; dirty = true"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="settings.emailNotifications ? 'bg-primary' : 'bg-secondary'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="settings.emailNotifications ? 'translate-x-4' : 'translate-x-0.5'" />
          </button>
        </div>
      </div>
    </div>

    <!-- Access -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2"><span class="mdi mdi-shield-check-outline" /> Access & Registration</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-foreground">Allow Free Signups</p>
            <p class="text-xs text-muted-foreground">Allow new candidates to register with the free plan</p>
          </div>
          <button @click="settings.allowFreeSignups = !settings.allowFreeSignups; dirty = true"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="settings.allowFreeSignups ? 'bg-primary' : 'bg-secondary'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="settings.allowFreeSignups ? 'translate-x-4' : 'translate-x-0.5'" />
          </button>
        </div>
        <div class="border-t border-border pt-4">
          <label class="text-sm font-medium text-foreground block mb-1.5">Max CV Exports (Free Plan)</label>
          <input v-model.number="settings.maxFreeExports" @input="dirty = true" type="number" min="0" class="input-field max-w-[120px]" />
        </div>
      </div>
    </div>

    <!-- Maintenance -->
    <div class="rounded-xl border bg-card" :class="settings.maintenanceMode ? 'border-destructive' : 'border-border'">
      <div class="px-6 py-4 border-b" :class="settings.maintenanceMode ? 'border-destructive' : 'border-border'">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2"><span class="mdi mdi-wrench-outline" /> Maintenance Mode</h3>
      </div>
      <div class="px-6 py-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-foreground">Enable Maintenance Mode</p>
            <p class="text-xs text-muted-foreground">Disables public access while maintenance is active</p>
          </div>
          <button @click="settings.maintenanceMode = !settings.maintenanceMode; dirty = true"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" :class="settings.maintenanceMode ? 'bg-destructive' : 'bg-secondary'">
            <span class="inline-block h-4 w-4 rounded-full bg-white transition-transform" :class="settings.maintenanceMode ? 'translate-x-4' : 'translate-x-0.5'" />
          </button>
        </div>
        <div v-if="settings.maintenanceMode" class="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <span class="mdi mdi-alert-outline text-destructive mt-0.5" />
          <p class="text-xs text-destructive">Maintenance mode is ON. The platform is not accessible to users.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dirty = ref(false);
const saving = ref(false);
const settings = ref({
  platformName: 'Arbeitly',
  supportEmail: 'support@arbeitly.de',
  defaultLanguage: 'en',
  timezone: 'Europe/Berlin',
  emailNotifications: true,
  allowFreeSignups: true,
  maxFreeExports: 10,
  maintenanceMode: false,
});

function save() {
  saving.value = true;
  setTimeout(() => { saving.value = false; dirty.value = false; }, 500);
}
</script>
