<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Admin Settings</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Manage your admin account.</p>
    </div>
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground">Account</h3>
      </div>
      <div class="px-6 py-4 space-y-3">
        <div class="flex items-center gap-3 text-sm">
          <span class="mdi mdi-email-outline text-base text-muted-foreground" />
          <div>
            <p class="text-xs text-muted-foreground">Email</p>
            <p class="font-medium text-foreground">{{ store.user?.email || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
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
        <p v-if="pwError" class="text-sm text-destructive">{{ pwError }}</p>
        <div class="flex items-center gap-3">
          <button @click="savePassword" :disabled="!pw.current || !pw.next || saving" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ saving ? 'Updating...' : 'Update Password' }}
          </button>
          <span v-if="saved" class="flex items-center gap-1 text-sm text-green-500"><span class="mdi mdi-check-circle" /> Updated</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../services/api';
import { useAdminStore } from '../../stores/admin';

const store = useAdminStore();
const pw = ref({ current: '', next: '' });
const pwError = ref('');
const saving = ref(false);
const saved = ref(false);

async function savePassword() {
  pwError.value = '';
  if (pw.value.next.length < 8) { pwError.value = 'Min 8 characters.'; return; }
  saving.value = true;
  try {
    await api.put('/admin/change-password', { currentPassword: pw.value.current, newPassword: pw.value.next }, { headers: store.getAuthHeaders() });
    pw.value = { current: '', next: '' };
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch (e: any) {
    pwError.value = e?.response?.data?.error || 'Failed';
  } finally { saving.value = false; }
}
</script>
