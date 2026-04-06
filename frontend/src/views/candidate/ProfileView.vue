<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="font-display text-2xl font-bold text-foreground">My Account</h1>
      <p class="text-muted-foreground">Profile, settings, and activity</p>
    </div>

    <!-- Tab bar -->
    <div class="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Profile tab ── -->
    <template v-if="activeTab === 'profile'">
      <!-- Avatar + info -->
      <div class="rounded-xl border border-border bg-card p-6">
        <div class="flex items-center gap-5">
          <div class="flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-bold shrink-0 bg-primary text-primary-foreground">
            {{ initials }}
          </div>
          <div>
            <h2 class="font-display text-xl font-bold text-foreground">{{ fullName }}</h2>
            <p class="text-sm text-muted-foreground">{{ auth.user?.email }}</p>
            <span class="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">active</span>
          </div>
        </div>
      </div>

      <!-- Account details -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-account-outline" />
            Account Details
          </h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="flex items-center gap-3 text-sm">
            <span class="mdi mdi-email-outline text-base text-muted-foreground shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Email</p>
              <p class="font-medium text-foreground">{{ auth.user?.email }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="mdi mdi-calendar-outline text-base text-muted-foreground shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Member Since</p>
              <p class="font-medium text-foreground">{{ memberSince }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <span class="mdi mdi-shield-account-outline text-base text-muted-foreground shrink-0" />
            <div>
              <p class="text-xs text-muted-foreground">Role</p>
              <p class="font-medium text-foreground capitalize">{{ auth.user?.role?.toLowerCase() || 'Candidate' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Plan -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-credit-card-outline" />
            Your Plan
          </h3>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-display text-lg font-bold text-primary">{{ auth.user?.plan?.name || 'Free' }}</p>
              <p class="text-sm text-muted-foreground">{{ auth.user?.plan ? `€${auth.user.plan.price} — one time payment` : 'Free forever' }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">Active</span>
          </div>
          <div v-if="auth.user?.plan" class="mt-3 pt-3 border-t border-border space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Employee applications used</span>
              <span class="font-semibold tabular-nums text-foreground">{{ auth.user?.profile?.applicationLimitUsed ?? 0 }} / {{ auth.user.plan.applicationLimit }}</span>
            </div>
            <div class="w-full h-2 rounded-full overflow-hidden bg-secondary">
              <div
                class="h-full rounded-full transition-all bg-primary"
                :style="`width: ${Math.min(100, ((auth.user?.profile?.applicationLimitUsed ?? 0) / auth.user.plan.applicationLimit) * 100)}%`"
              />
            </div>
          </div>
          <p v-if="!auth.user?.plan" class="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
            <router-link to="/pricing" class="text-primary hover:underline">Upgrade to get an assigned employee →</router-link>
          </p>
        </div>
      </div>

      <!-- CV Usage -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-chart-bar" />
            CV Usage
          </h3>
        </div>
        <div class="px-6 py-4 space-y-1.5">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">CV Builds used</span>
            <span class="font-semibold tabular-nums text-foreground">{{ cvCount }} / {{ cvLimit }}</span>
          </div>
          <div class="w-full h-2 rounded-full overflow-hidden bg-secondary">
            <div
              class="h-full rounded-full transition-all"
              :class="cvPct >= 100 ? 'bg-destructive' : cvPct >= 70 ? 'bg-yellow-400' : 'bg-primary'"
              :style="`width: ${Math.min(100, cvPct)}%`"
            />
          </div>
          <p class="text-xs text-muted-foreground">{{ Math.max(0, cvLimit - cvCount) }} builds remaining</p>
          <p v-if="!auth.user?.plan" class="text-xs text-muted-foreground border-t border-border pt-3">
            Limits reset on plan upgrade.
            <router-link to="/pricing" class="text-primary hover:underline">Upgrade to remove limits →</router-link>
          </p>
          <p v-else class="text-xs text-muted-foreground border-t border-border pt-3">
            {{ auth.user.plan.name }} plan active.
          </p>
        </div>
      </div>
      <!-- Onboarding status -->
      <div v-if="!onboardingCompleted" class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-clock-outline text-yellow-500" /> Onboarding Profile
          </h3>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted-foreground">Complete your onboarding to help us find the best jobs for you.</p>
            <router-link to="/candidate/onboarding" class="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Complete Now</router-link>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Settings tab ── -->
    <template v-else-if="activeTab === 'settings'">
      <!-- Profile info -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground">Profile Information</h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">First Name</label>
              <input v-model="profileForm.firstName" class="input-field" placeholder="First name" />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Last Name</label>
              <input v-model="profileForm.lastName" class="input-field" placeholder="Last name" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Email</label>
            <input v-model="profileForm.email" type="email" class="input-field" placeholder="you@example.com" />
          </div>
          <p v-if="profileError" class="text-sm text-destructive">{{ profileError }}</p>
          <div class="flex items-center gap-3">
            <button
              @click="saveProfile"
              :disabled="savingProfile"
              class="h-9 px-4 rounded-full text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 bg-primary text-primary-foreground"
            >
              {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
            <span v-if="profileSaved" class="flex items-center gap-1 text-sm text-green-500">
              <span class="mdi mdi-check-circle" /> Saved
            </span>
          </div>
        </div>
      </div>

      <!-- Additional profile fields -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground">Contact & Social</h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Phone</label>
              <input v-model="profileForm.phone" class="input-field" placeholder="+49 171 3109942" />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground block mb-1.5">Location</label>
              <input v-model="profileForm.location" class="input-field" placeholder="Berlin, Germany" />
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">LinkedIn</label>
            <input v-model="profileForm.linkedinUrl" class="input-field" placeholder="https://linkedin.com/in/yourname" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Portfolio / Website</label>
            <input v-model="profileForm.portfolioUrl" class="input-field" placeholder="https://yourwebsite.com" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Bio</label>
            <textarea v-model="profileForm.bio" rows="3" class="input-field resize-none" placeholder="A short bio about yourself..." />
          </div>
        </div>
      </div>

      <!-- Change password -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground">Change Password</h3>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Current Password</label>
            <input v-model="pwForm.current" type="password" class="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">New Password</label>
            <input v-model="pwForm.next" type="password" class="input-field" placeholder="••••••••" />
          </div>
          <div>
            <label class="text-sm font-medium text-foreground block mb-1.5">Confirm New Password</label>
            <input v-model="pwForm.confirm" type="password" class="input-field" placeholder="••••••••" />
          </div>
          <p v-if="pwError" class="text-sm text-destructive">{{ pwError }}</p>
          <div class="flex items-center gap-3">
            <button
              @click="savePassword"
              :disabled="!pwForm.current || !pwForm.next || !pwForm.confirm || savingPassword"
              class="h-9 px-4 rounded-full text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 bg-primary text-primary-foreground"
            >
              {{ savingPassword ? 'Updating...' : 'Update Password' }}
            </button>
            <span v-if="pwSaved" class="flex items-center gap-1 text-sm text-green-500">
              <span class="mdi mdi-check-circle" /> Password updated
            </span>
          </div>
        </div>
      </div>



      <!-- Privacy -->
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground">Privacy & Security</h3>
        </div>
        <div class="px-6 py-4">
          <div class="flex items-start gap-3 p-4 rounded-lg bg-secondary">
            <span class="mdi mdi-shield-lock-outline text-xl text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p class="text-sm font-medium text-foreground">Your data is secure</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                All personal data is encrypted and stored securely. You can request a full data export or account deletion at any time by contacting support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Onboarding tab ── -->
    <template v-else-if="activeTab === 'onboarding'">
      <template v-if="!onboardingCompleted">
        <div class="rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <span class="mdi mdi-clipboard-check-outline text-4xl text-muted-foreground/20" />
          <p class="text-sm font-medium text-foreground">Onboarding not completed yet</p>
          <p class="text-xs text-muted-foreground">Complete onboarding to unlock your full profile.</p>
          <router-link to="/candidate/onboarding" class="inline-flex items-center h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 mt-2">Complete Now</router-link>
        </div>
      </template>

      <template v-else>
        <!-- Application Account -->
        <div v-if="prof?.dummyEmail" class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-key-outline" /> Application Account
            </h3>
          </div>
          <div class="px-6 py-4 space-y-3">
            <p class="text-xs text-muted-foreground">Your advisor uses these credentials to apply on your behalf.</p>
            <div class="rounded-lg border border-border bg-secondary/40 p-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Email</span>
                <span class="font-mono text-xs font-medium text-foreground">{{ prof.dummyEmail }}</span>
              </div>
              <div v-if="prof.dummyPassword" class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Password</span>
                <span class="font-mono text-xs font-medium text-foreground">{{ prof.dummyPassword }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-muted-foreground">Preferred Language</span>
                <span class="font-medium text-foreground">{{ prof.preferredLanguage === 'de' ? 'Deutsch' : 'English' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Signup Info -->
        <div v-if="prof?.marketingData" class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-information-outline" /> Signup Info
            </h3>
          </div>
          <div class="px-6 py-4 space-y-2">
            <div v-if="prof.marketingData.industry" class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Industry</span>
              <span class="font-medium text-foreground">{{ prof.marketingData.industry }}</span>
            </div>
            <div v-if="prof.marketingData.targetCountry" class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Target Country</span>
              <span class="font-medium text-foreground">{{ prof.marketingData.targetCountry }}</span>
            </div>
            <div v-if="prof.marketingData.howHeard" class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">How you heard about us</span>
              <span class="font-medium text-foreground">{{ prof.marketingData.howHeard }}</span>
            </div>
          </div>
        </div>

        <!-- All onboarding answers -->
        <div v-for="section in onboardingSections" :key="section.title" class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="text-xs font-semibold text-primary uppercase tracking-widest">{{ section.title }}</h3>
          </div>
          <div class="px-6 py-4">
            <div class="grid grid-cols-2 gap-x-6 gap-y-3">
              <div v-for="field in section.fields" :key="field.label">
                <p class="text-xs text-muted-foreground">{{ field.label }}</p>
                <p class="text-sm font-medium text-foreground">{{ field.value || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Uploaded Documents -->
        <div class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-file-document-outline" /> Uploaded Documents
            </h3>
          </div>
          <div class="px-6 py-4">
            <div v-if="onboardingDocs.length === 0" class="text-sm text-muted-foreground text-center py-4">No documents uploaded during onboarding.</div>
            <div v-else class="space-y-2">
              <div v-for="doc in onboardingDocs" :key="doc.id" class="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
                <span class="mdi mdi-file-document-outline text-lg text-primary shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foreground truncate">{{ doc.title }}</p>
                  <p class="text-[10px] text-muted-foreground">{{ doc.style ? doc.style + ' · ' : '' }}{{ formatDate(doc.createdAt) }}</p>
                </div>
                <router-link :to="`/candidate/cv?edit=${doc.id}`" class="text-xs text-primary hover:underline shrink-0">Open</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Base Cover Letter -->
        <div v-if="prof?.baseCoverLetter" class="rounded-xl border border-border bg-card">
          <div class="px-6 py-4 border-b border-border">
            <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <span class="mdi mdi-text-box-outline" /> Base Cover Letter
            </h3>
          </div>
          <div class="px-6 py-4">
            <p class="text-sm text-foreground whitespace-pre-wrap font-mono">{{ prof.baseCoverLetter }}</p>
          </div>
        </div>

        <div v-if="!prof?.onboardingData && onboardingDocs.length === 0 && !prof?.baseCoverLetter" class="rounded-xl border border-border bg-card p-6 text-center">
          <span class="mdi mdi-clipboard-check-outline text-4xl text-muted-foreground/20" />
          <p class="text-sm text-muted-foreground mt-2">No onboarding data found.</p>
        </div>
      </template>
    </template>

    <!-- ── Activity tab ── -->
    <template v-else-if="activeTab === 'activity'">
      <div class="rounded-xl border border-border bg-card">
        <div class="px-6 py-4 border-b border-border">
          <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <span class="mdi mdi-clipboard-list-outline text-primary" />
            My Activity
          </h3>
        </div>

        <div v-if="loadingActivity" class="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <span class="mdi mdi-loading mdi-spin text-3xl opacity-40" />
          <p class="text-sm">Loading activity...</p>
        </div>

        <div v-else-if="activityItems.length === 0" class="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <span class="mdi mdi-clipboard-list-outline text-4xl opacity-20" />
          <p class="text-sm">No activity recorded yet.</p>
        </div>

        <div v-else class="divide-y" style="border-color: hsl(196 40% 22% / 0.5);">
          <div
            v-for="item in activityItems"
            :key="item.id"
            class="flex items-start gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors"
          >
            <span class="mdi text-base text-muted-foreground shrink-0 mt-0.5" :class="item.icon" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground">{{ item.label }}</p>
              <p class="text-xs text-muted-foreground">{{ item.sub }}</p>
            </div>
            <span class="text-[10px] text-muted-foreground/60 shrink-0 whitespace-nowrap pt-0.5">{{ item.date }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

type TabId = 'profile' | 'settings' | 'onboarding' | 'activity';
const activeTab = ref<TabId>('profile');

const tabs = [
  { id: 'profile' as TabId, label: 'Profile' },
  { id: 'settings' as TabId, label: 'Settings' },
  { id: 'onboarding' as TabId, label: 'Onboarding' },
  { id: 'activity' as TabId, label: 'Activity' },
];

// ── Derived display values ──
const fullName = computed(() => {
  const p = auth.user?.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName} ${p.lastName}`.trim();
  return auth.user?.email?.split('@')[0] || 'User';
});

const initials = computed(() => {
  const p = auth.user?.profile;
  if (p?.firstName && p?.lastName) return `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
  if (p?.firstName) return p.firstName.slice(0, 2).toUpperCase();
  return (auth.user?.email || 'U').slice(0, 2).toUpperCase();
});

const memberSince = computed(() => {
  if (!auth.user?.createdAt) return '—';
  return new Date(auth.user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
});

// ── Onboarding ──
const onboardingCompleted = computed(() => auth.user?.profile?.onboardingCompleted ?? false);

// Fetch uploaded CVs for onboarding tab
const onboardingDocs = ref<any[]>([]);
watch(activeTab, async (tab) => {
  if (tab !== 'onboarding' || onboardingDocs.value.length > 0) return;
  try {
    const { data } = await api.get('/cvs');
    onboardingDocs.value = (data.data || []).slice(0, 10);
  } catch { /* ignore */ }
});

const prof = computed(() => auth.user?.profile as any);

const onboardingSections = computed(() => {
  const o = prof.value?.onboardingData;
  if (!o) return [];
  return [
    { title: 'Personal Details', fields: [
      { label: 'Application Email', value: o.applicationEmail },
      { label: 'Phone', value: o.phone },
      { label: 'LinkedIn', value: o.linkedin },
      { label: 'Date of Birth', value: o.dob },
      { label: 'Place of Birth', value: o.placeOfBirth },
      { label: 'Address', value: o.address },
    ]},
    { title: 'Professional Background', fields: [
      { label: 'Job Title', value: o.currentJobTitle },
      { label: 'Employer', value: o.currentEmployer },
      { label: 'Field', value: o.currentField },
      { label: 'Years of Experience', value: o.yearsExperience },
      { label: 'Current Salary', value: o.currentSalary },
      { label: 'Worked in Germany', value: o.workedInGermany },
      { label: 'Notice Period', value: o.noticePeriod },
      { label: 'Highest Study', value: o.highestStudy },
      { label: 'Degree', value: o.degreeTitle },
      { label: 'University', value: o.university },
    ]},
    { title: 'Skills & Career Goals', fields: [
      { label: 'Top Skills', value: o.topSkills },
      { label: 'Certifications', value: o.certifications },
      { label: 'Career Goal', value: o.careerGoal },
      { label: 'Target Roles', value: o.targetRoles },
      { label: 'Target Industries', value: o.targetIndustries },
      { label: 'Employment Type', value: o.employmentType },
      { label: 'Preferred Location', value: o.preferredLocation },
      { label: 'Open to Relocation', value: o.openToRelocation },
      { label: 'Salary Range', value: o.preferredSalary },
      { label: 'Target Companies', value: o.targetCompanies },
      { label: 'Career Change', value: o.openToCareerChange },
    ]},
    { title: 'Final Details', fields: [
      { label: 'German Level', value: o.germanLevel },
      { label: 'Driving License', value: o.drivingLicense },
      { label: 'Transition Motivation', value: o.transitionMotivation },
      { label: 'Training Needs', value: o.trainingNeeds },
      { label: 'How Heard', value: o.howHeard },
      { label: 'Additional Info', value: o.additionalInfo },
    ]},
  ].filter(s => s.fields.some(f => f.value));
});

// ── CV usage ──
const cvLimit = computed(() => auth.user?.usage?.cvCreationLimit ?? 10);
const cvCount = computed(() => auth.user?.usage?.cvCreationsUsed ?? 0);
const cvPct = computed(() => (cvCount.value / cvLimit.value) * 100);

// ── Settings form ──
const profileForm = ref({
  firstName: auth.user?.profile?.firstName || '',
  lastName: auth.user?.profile?.lastName || '',
  email: auth.user?.email || '',
  phone: auth.user?.profile?.phone || '',
  location: auth.user?.profile?.location || '',
  bio: auth.user?.profile?.bio || '',
  linkedinUrl: auth.user?.profile?.linkedinUrl || '',
  portfolioUrl: auth.user?.profile?.portfolioUrl || '',
});
const profileSaved = ref(false);
const profileError = ref('');
const savingProfile = ref(false);

// Sync form when user data loads
watch(() => auth.user, (u) => {
  if (!u) return;
  profileForm.value.email = u.email;
  profileForm.value.firstName = u.profile?.firstName || '';
  profileForm.value.lastName = u.profile?.lastName || '';
  profileForm.value.phone = u.profile?.phone || '';
  profileForm.value.location = u.profile?.location || '';
  profileForm.value.bio = u.profile?.bio || '';
  profileForm.value.linkedinUrl = u.profile?.linkedinUrl || '';
  profileForm.value.portfolioUrl = u.profile?.portfolioUrl || '';
}, { immediate: true });

async function saveProfile() {
  profileError.value = '';
  savingProfile.value = true;
  try {
    await api.put('/profile', {
      firstName: profileForm.value.firstName.trim(),
      lastName: profileForm.value.lastName.trim(),
      phone: profileForm.value.phone.trim() || undefined,
      location: profileForm.value.location.trim() || undefined,
      bio: profileForm.value.bio.trim() || undefined,
      linkedinUrl: profileForm.value.linkedinUrl.trim() || undefined,
      portfolioUrl: profileForm.value.portfolioUrl.trim() || undefined,
    });
    await auth.fetchMe();
    profileSaved.value = true;
    setTimeout(() => { profileSaved.value = false; }, 3000);
  } catch (e: any) {
    profileError.value = e?.response?.data?.error || 'Failed to save profile.';
  } finally {
    savingProfile.value = false;
  }
}

const pwForm = ref({ current: '', next: '', confirm: '' });
const pwError = ref('');
const pwSaved = ref(false);
const savingPassword = ref(false);

async function savePassword() {
  pwError.value = '';
  if (pwForm.value.next.length < 8) { pwError.value = 'New password must be at least 8 characters.'; return; }
  if (pwForm.value.next !== pwForm.value.confirm) { pwError.value = 'Passwords do not match.'; return; }
  savingPassword.value = true;
  try {
    await auth.changePassword(pwForm.value.current, pwForm.value.next);
    pwForm.value = { current: '', next: '', confirm: '' };
    pwSaved.value = true;
    setTimeout(() => { pwSaved.value = false; }, 3000);
  } catch (e: any) {
    pwError.value = e?.response?.data?.error || 'Failed to update password.';
  } finally {
    savingPassword.value = false;
  }
}

// ── Activity tab ──
interface ActivityItem { id: string; icon: string; label: string; sub: string; date: string; }
const activityItems = ref<ActivityItem[]>([]);
const loadingActivity = ref(false);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const CATEGORY_ICONS: Record<string, string> = {
  account: 'mdi-account-outline',
  onboarding: 'mdi-clipboard-check-outline',
  cv: 'mdi-file-document-outline',
  application: 'mdi-briefcase-outline',
  plan: 'mdi-star-outline',
  profile: 'mdi-account-cog-outline',
};

watch(activeTab, async (tab) => {
  if (tab !== 'activity' || activityItems.value.length > 0) return;
  loadingActivity.value = true;
  try {
    const { data } = await api.get('/activity');
    activityItems.value = (data.data || []).map((item: any) => ({
      id: item.id,
      icon: CATEGORY_ICONS[item.category] || 'mdi-circle-outline',
      label: item.action,
      sub: item.detail || item.category,
      date: formatDate(item.createdAt),
    }));
  } catch {
    activityItems.value = [];
  } finally {
    loadingActivity.value = false;
  }
});
</script>
