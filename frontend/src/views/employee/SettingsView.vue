<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">Settings</h1>
      <p class="text-sm mt-0.5 text-muted-foreground">Manage your employee account.</p>
    </div>

    <!-- Profile -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground">Profile Information</h3>
      </div>
      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="text-sm font-medium text-foreground block mb-1.5">Email</label>
          <input v-model="email" type="email" class="input-field" />
        </div>
        <div class="flex items-center gap-3">
          <button @click="saveProfile" :disabled="saving" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <span v-if="saved" class="flex items-center gap-1 text-sm text-green-500"><span class="mdi mdi-check-circle" /> Saved</span>
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
        <p v-if="pwError" class="text-sm text-destructive">{{ pwError }}</p>
        <button @click="savePassword" :disabled="!pw.current || !pw.next || savingPw"
          class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {{ savingPw ? 'Updating...' : 'Update Password' }}
        </button>
      </div>
    </div>
    <!-- Activity -->
    <div class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
          <span class="mdi mdi-clipboard-list-outline text-primary" /> My Activity
        </h3>
      </div>
      <div v-if="loadingActivity" class="flex items-center justify-center py-8 text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-xl mr-2" /><span class="text-sm">Loading...</span>
      </div>
      <div v-else-if="activityItems.length === 0" class="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <span class="mdi mdi-clipboard-list-outline text-3xl opacity-20" />
        <p class="text-sm mt-1">No activity yet.</p>
      </div>
      <div v-else class="divide-y divide-border/50">
        <div v-for="item in activityItems" :key="item.id" class="flex items-start gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors">
          <span class="mdi text-base text-muted-foreground shrink-0 mt-0.5" :class="item.icon" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground">{{ item.action }}</p>
            <p class="text-xs text-muted-foreground">{{ item.detail || item.category }}</p>
          </div>
          <span class="text-[10px] text-muted-foreground/60 shrink-0 whitespace-nowrap pt-0.5">{{ formatDate(item.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const email = ref(store.user?.email || '');
const saving = ref(false);
const saved = ref(false);
const pw = ref({ current: '', next: '' });
const pwError = ref('');
const savingPw = ref(false);
const activityItems = ref<any[]>([]);
const loadingActivity = ref(false);

const CATEGORY_ICONS: Record<string, string> = {
  account: 'mdi-account-outline',
  application: 'mdi-briefcase-outline',
  cv: 'mdi-file-document-outline',
  faq: 'mdi-help-circle-outline',
  profile: 'mdi-account-cog-outline',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(async () => {
  loadingActivity.value = true;
  try {
    const { data } = await api.get('/employee/activity', { headers: store.getAuthHeaders() });
    activityItems.value = (data.data || []).map((item: any) => ({
      ...item,
      icon: CATEGORY_ICONS[item.category] || 'mdi-circle-outline',
    }));
  } catch { /* ignore */ }
  finally { loadingActivity.value = false; }
});

async function saveProfile() {
  saving.value = true;
  try {
    await api.put('/employee/profile', { email: email.value }, { headers: store.getAuthHeaders() });
    saved.value = true;
    setTimeout(() => { saved.value = false; }, 3000);
  } catch (err) {
    console.error('Save failed:', err);
  } finally {
    saving.value = false;
  }
}

async function savePassword() {
  pwError.value = '';
  if (pw.value.next.length < 8) { pwError.value = 'Min 8 characters.'; return; }
  savingPw.value = true;
  try {
    await api.put('/employee/change-password', { currentPassword: pw.value.current, newPassword: pw.value.next }, { headers: store.getAuthHeaders() });
    pw.value = { current: '', next: '' };
  } catch (e: any) {
    pwError.value = e?.response?.data?.error || 'Failed';
  } finally {
    savingPw.value = false;
  }
}
</script>
