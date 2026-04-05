<template>
  <div class="max-w-lg space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">My Profile</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Admin account management.</p>
    </div>

    <!-- Avatar -->
    <div class="rounded-xl border border-border bg-card p-6">
      <div class="flex items-center gap-5">
        <div class="flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold shrink-0 bg-purple-500/20 text-purple-400">
          {{ initials }}
        </div>
        <div>
          <h2 class="font-display text-xl font-bold text-foreground">{{ store.user?.email?.split('@')[0] || 'Admin' }}</h2>
          <p class="text-sm text-muted-foreground">{{ store.user?.email }}</p>
          <span class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span class="mdi mdi-shield-account-outline text-xs" /> Super Admin
          </span>
        </div>
      </div>
    </div>

    <!-- Account -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground">Account Details</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Email</label>
          <input :value="store.user?.email" disabled class="input-field opacity-60" />
        </div>
      </div>
    </div>

    <!-- Password -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground">Change Password</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Current Password</label>
          <input v-model="pw.current" type="password" class="input-field" placeholder="••••••••" />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">New Password</label>
          <input v-model="pw.next" type="password" class="input-field" placeholder="••••••••" />
        </div>
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Confirm New Password</label>
          <input v-model="pw.confirm" type="password" class="input-field" placeholder="••••••••" />
        </div>
        <p v-if="pwError" class="text-sm text-destructive">{{ pwError }}</p>
        <div class="flex items-center gap-3">
          <button @click="savePassword" :disabled="!pw.current || !pw.next || !pw.confirm || saving"
            class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ saving ? 'Updating...' : 'Update Password' }}
          </button>
          <span v-if="saved" class="flex items-center gap-1 text-sm text-green-500"><span class="mdi mdi-check-circle" /> Updated</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const initials = computed(() => (store.user?.email || 'A').slice(0, 2).toUpperCase());
const pw = ref({ current: '', next: '', confirm: '' });
const pwError = ref('');
const saving = ref(false);
const saved = ref(false);

async function savePassword() {
  pwError.value = '';
  if (pw.value.next.length < 8) { pwError.value = 'Min 8 characters.'; return; }
  if (pw.value.next !== pw.value.confirm) { pwError.value = 'Passwords do not match.'; return; }
  saving.value = true;
  try {
    await axios.put('/api/admin/change-password', { currentPassword: pw.value.current, newPassword: pw.value.next }, { headers: store.getAuthHeaders() });
    pw.value = { current: '', next: '', confirm: '' };
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch (e: any) {
    pwError.value = e?.response?.data?.error || 'Failed';
  } finally { saving.value = false; }
}
</script>
