<template>
  <div class="max-w-2xl space-y-6">
    <!-- Step indicator -->
    <div class="flex items-center gap-3">
      <div v-for="(s, i) in steps" :key="i" class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          :class="step > i ? 'bg-green-500 text-white' : step === i ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'">
          <span v-if="step > i" class="mdi mdi-check" />
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="text-sm font-medium hidden sm:inline" :class="step === i ? 'text-foreground' : 'text-muted-foreground'">{{ s }}</span>
        <span v-if="i < steps.length - 1" class="w-8 h-px bg-border hidden sm:block" />
      </div>
    </div>

    <!-- Step 1: Personal Info -->
    <template v-if="step === 0">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 class="font-display text-lg font-bold text-foreground">Personal Information</h2>
        <p class="text-sm text-muted-foreground">Tell us about yourself so we can match you with the right opportunities.</p>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-sm font-medium text-foreground block mb-1">First Name *</label><input v-model="form.firstName" class="input-field" /></div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Last Name *</label><input v-model="form.lastName" class="input-field" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="text-sm font-medium text-foreground block mb-1">Phone</label><input v-model="form.phone" class="input-field" placeholder="+49..." /></div>
          <div><label class="text-sm font-medium text-foreground block mb-1">Location</label><input v-model="form.location" class="input-field" placeholder="Berlin, Germany" /></div>
        </div>
        <div><label class="text-sm font-medium text-foreground block mb-1">Short Bio</label><textarea v-model="form.bio" rows="3" class="input-field resize-none" placeholder="A brief description of your background..." /></div>
      </div>
      <div class="flex justify-end">
        <button @click="nextStep" :disabled="!form.firstName || !form.lastName" class="h-9 px-5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          Continue
        </button>
      </div>
    </template>

    <!-- Step 2: Upload Base CV -->
    <template v-if="step === 1">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 class="font-display text-lg font-bold text-foreground">Upload Your CV</h2>
        <p class="text-sm text-muted-foreground">Upload your base CV. This will be used to generate tailored versions for job applications.</p>
        <div class="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-3" @dragover.prevent @drop.prevent="handleDrop">
          <span class="mdi mdi-file-upload-outline text-4xl text-muted-foreground/30" />
          <p class="text-sm text-muted-foreground">Drag & drop your CV here or</p>
          <label class="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
            <span class="mdi mdi-upload" /> Browse Files
            <input type="file" accept=".pdf,.doc,.docx" class="hidden" @change="handleFileSelect" />
          </label>
          <p class="text-[10px] text-muted-foreground">PDF, DOC, DOCX — max 10MB</p>
        </div>
        <div v-if="cvFile" class="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
          <span class="mdi mdi-file-document-outline text-lg text-primary" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ cvFile.name }}</p>
            <p class="text-[10px] text-muted-foreground">{{ (cvFile.size / 1024).toFixed(0) }} KB</p>
          </div>
          <button @click="cvFile = null" class="text-muted-foreground hover:text-destructive"><span class="mdi mdi-close" /></button>
        </div>
        <div v-if="cvUploaded" class="flex items-center gap-2 text-sm text-green-500">
          <span class="mdi mdi-check-circle" /> CV uploaded successfully
        </div>
        <button v-if="cvFile && !cvUploaded && !uploading" @click="uploadCV" class="h-9 px-5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          Upload CV
        </button>
        <div v-if="uploading" class="flex items-center gap-2 text-sm text-muted-foreground">
          <span class="mdi mdi-loading mdi-spin" /> Uploading...
        </div>
      </div>
      <div class="flex justify-between">
        <button @click="step--" class="h-9 px-5 rounded-full text-sm font-medium bg-secondary text-foreground">Back</button>
        <button @click="nextStep" :disabled="!cvUploaded" class="h-9 px-5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          Continue
        </button>
      </div>
    </template>

    <!-- Step 3: Base Cover Letter -->
    <template v-if="step === 2">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 class="font-display text-lg font-bold text-foreground">Base Cover Letter</h2>
        <p class="text-sm text-muted-foreground">Write a general cover letter. We'll tailor it for each job application.</p>
        <textarea v-model="form.baseCoverLetter" rows="12" class="input-field resize-none w-full font-mono text-xs" placeholder="Dear Hiring Manager,

I am writing to express my interest in..." />
      </div>
      <div class="flex justify-between">
        <button @click="step--" class="h-9 px-5 rounded-full text-sm font-medium bg-secondary text-foreground">Back</button>
        <button @click="completeOnboarding" :disabled="saving" class="h-9 px-5 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {{ saving ? 'Completing...' : 'Complete Onboarding' }}
        </button>
      </div>
    </template>

    <!-- Error -->
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';
// Auth store auto-attaches token via interceptor

const auth = useAuthStore();
const router = useRouter();

const steps = ['Personal Info', 'Upload CV', 'Cover Letter'];
const step = ref(0);
const error = ref('');
const saving = ref(false);
const uploading = ref(false);
const cvFile = ref<File | null>(null);
const cvUploaded = ref(false);

const form = ref({
  firstName: auth.user?.profile?.firstName || '',
  lastName: auth.user?.profile?.lastName || '',
  phone: auth.user?.profile?.phone || '',
  location: auth.user?.profile?.location || '',
  bio: auth.user?.profile?.bio || '',
  baseCoverLetter: '',
});

function nextStep() { step.value++; }

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0];
  if (file) { cvFile.value = file; cvUploaded.value = false; }
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) { cvFile.value = file; cvUploaded.value = false; }
}

async function uploadCV() {
  if (!cvFile.value) return;
  uploading.value = true;
  error.value = '';
  try {
    const fd = new FormData();
    fd.append('file', cvFile.value);
    await api.post('/cvs', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    cvUploaded.value = true;
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to upload CV.';
  } finally {
    uploading.value = false;
  }
}

async function completeOnboarding() {
  saving.value = true;
  error.value = '';
  try {
    await api.post('/onboarding', form.value);
    // Refresh user data
    await auth.fetchMe();
    router.push('/candidate/applications');
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to complete onboarding.';
  } finally {
    saving.value = false;
  }
}
</script>
