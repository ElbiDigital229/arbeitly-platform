<template>
  <div v-if="auth.user?.profile?.onboardingCompleted" class="max-w-2xl space-y-6 p-6">
    <div class="flex items-center justify-between">
      <div><h1 class="font-display text-2xl font-bold text-foreground">Onboarding Answers</h1><p class="text-sm text-muted-foreground mt-0.5">Submitted and locked.</p></div>
      <router-link to="/candidate/profile" class="h-9 px-4 rounded-full text-sm font-medium bg-secondary text-foreground flex items-center gap-1.5 hover:bg-secondary/80"><span class="mdi mdi-arrow-left text-sm" /> Back</router-link>
    </div>
    <div v-for="section in readOnlySections" :key="section.title" class="rounded-xl border border-border bg-card">
      <div class="px-6 py-4 border-b border-border"><h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2"><span class="mdi" :class="section.icon" /> {{ section.title }}</h3></div>
      <div class="px-6 py-4 grid grid-cols-2 gap-4"><div v-for="f in section.fields" :key="f.label"><p class="text-xs text-muted-foreground">{{ f.label }}</p><p class="text-sm font-medium text-foreground">{{ f.value || '—' }}</p></div></div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-background">
    <div class="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10">
      <div class="container mx-auto px-6 h-14 flex items-center justify-between">
        <img src="../../assets/logo.png" alt="Arbeitly" class="h-7" />
        <span class="text-xs text-muted-foreground">Step {{ step + 1 }} of 5</span>
      </div>
    </div>
    <div class="container mx-auto px-6 py-10 max-w-2xl">
      <div class="mb-10">
        <!-- Circles + lines row -->
        <div class="flex items-center">
          <template v-for="(s, i) in STEPS" :key="i">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
              :class="step > i ? 'bg-primary text-primary-foreground' : step === i ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'">
              <span v-if="step > i" class="mdi mdi-check" /><span v-else>{{ i + 1 }}</span>
            </div>
            <div v-if="i < STEPS.length - 1" class="flex-1 h-px mx-2" :class="step > i ? 'bg-primary' : 'bg-border'" />
          </template>
        </div>
        <!-- Labels row -->
        <div class="flex mt-2">
          <template v-for="(s, i) in STEPS" :key="'l'+i">
            <div class="w-8 shrink-0 text-center" :style="i === 0 ? '' : ''">
              <span class="text-[10px] font-medium leading-tight hidden sm:block" :class="step === i ? 'text-primary' : 'text-muted-foreground'" style="width: 80px; margin-left: -24px; display: inline-block; text-align: center;">{{ s.title }}</span>
            </div>
            <div v-if="i < STEPS.length - 1" class="flex-1" />
          </template>
        </div>
      </div>
      <div class="mb-8"><h1 class="font-display text-3xl font-bold text-foreground">{{ STEPS[step].title }}</h1><p class="mt-1 text-muted-foreground">{{ STEPS[step].desc }}</p></div>
      <div v-if="errors.length" class="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><p class="font-semibold mb-1">Please fill in all required fields:</p><ul class="list-disc list-inside space-y-0.5"><li v-for="e in errors" :key="e">{{ e }}</li></ul></div>

      <!-- STEP 1 -->
      <template v-if="step === 0">
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Basic Information</h3><div class="space-y-4">
          <div class="grid grid-cols-2 gap-4"><div><label class="text-sm text-foreground mb-1.5 block">First Name <span class="text-destructive">*</span></label><input v-model="d.firstName" class="input-field" placeholder="Max" /></div><div><label class="text-sm text-foreground mb-1.5 block">Last Name <span class="text-destructive">*</span></label><input v-model="d.lastName" class="input-field" placeholder="Müller" /></div></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Email for Applications <span class="text-destructive">*</span></label><input v-model="d.applicationEmail" type="email" class="input-field" placeholder="max@example.com" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Phone Number <span class="text-destructive">*</span></label><input v-model="d.phone" class="input-field" placeholder="+49 170 1234567" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">LinkedIn Profile URL</label><input v-model="d.linkedin" class="input-field" placeholder="https://linkedin.com/in/yourprofile" /></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Personal Information</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Date of Birth <span class="text-destructive">*</span></label><input v-model="d.dob" type="date" class="input-field" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Place of Birth <span class="text-destructive">*</span></label><input v-model="d.placeOfBirth" class="input-field" placeholder="Berlin, Germany" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Address <span class="text-destructive">*</span></label><input v-model="d.address" class="input-field" placeholder="Musterstraße 12, 10115 Berlin" /></div>
        </div></div>
      </template>

      <!-- STEP 2 -->
      <template v-if="step === 1">
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Work Experience</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Current / Last Job Title <span class="text-destructive">*</span></label><input v-model="d.currentJobTitle" class="input-field" placeholder="e.g. Software Engineer" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Current / Last Employer <span class="text-destructive">*</span></label><input v-model="d.currentEmployer" class="input-field" placeholder="e.g. Siemens AG" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Current Field <span class="text-destructive">*</span></label><input v-model="d.currentField" class="input-field" placeholder="e.g. Software Development" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm text-foreground mb-1.5 block">Years of Experience <span class="text-destructive">*</span></label><select v-model="d.yearsExperience" class="input-field"><option value="">Select…</option><option v-for="v in ['Less than 1 year','1–2 years','3–5 years','6–10 years','10+ years']" :key="v" :value="v">{{ v }}</option></select></div>
            <div><label class="text-sm text-foreground mb-1.5 block">Current Salary (€)</label><input v-model="d.currentSalary" class="input-field" placeholder="e.g. 60,000" /></div>
          </div>
          <div><label class="text-sm text-foreground mb-1.5 block">Worked in Germany? <span class="text-destructive">*</span></label><select v-model="d.workedInGermany" class="input-field"><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option><option value="currently">Currently working there</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Notice Period <span class="text-destructive">*</span></label><select v-model="d.noticePeriod" class="input-field"><option value="">Select…</option><option v-for="v in ['Immediately available','2 weeks','1 month','2 months','3 months','3+ months']" :key="v" :value="v">{{ v }}</option></select></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Education</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Highest Level of Study <span class="text-destructive">*</span></label><select v-model="d.highestStudy" class="input-field"><option value="">Select…</option><option v-for="v in ['High School','Vocational Training (Ausbildung)','Bachelor\'s Degree','Master\'s Degree','PhD / Doctorate','Other']" :key="v" :value="v">{{ v }}</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Degree Title</label><input v-model="d.degreeTitle" class="input-field" placeholder="e.g. B.Sc. Computer Science" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">University <span class="text-destructive">*</span></label><input v-model="d.university" class="input-field" placeholder="e.g. TU Berlin" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">University Location</label><input v-model="d.universityLocation" class="input-field" placeholder="e.g. Berlin, Germany" /></div>
        </div></div>
      </template>

      <!-- STEP 3 -->
      <template v-if="step === 2">
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Skills</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Your Top 5 Skills <span class="text-destructive">*</span></label><textarea v-model="d.topSkills" rows="3" class="input-field resize-none" placeholder="e.g. React, TypeScript, Project Management, Data Analysis, Communication" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Relevant Certifications</label><textarea v-model="d.certifications" rows="2" class="input-field resize-none" placeholder="e.g. AWS Certified Developer, PMP…" /></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Career Goals</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Primary Career Goal <span class="text-destructive">*</span></label><select v-model="d.careerGoal" class="input-field"><option value="">Select…</option><option v-for="v in ['Get a higher salary','Change industries','Get promoted','Move to Germany','Work remotely','Find more stability','Other']" :key="v" :value="v">{{ v }}</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Target Job Titles / Roles <span class="text-destructive">*</span></label><textarea v-model="d.targetRoles" rows="2" class="input-field resize-none" placeholder="e.g. Senior Frontend Developer, Product Manager…" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Target Industries <span class="text-destructive">*</span></label><textarea v-model="d.targetIndustries" rows="2" class="input-field resize-none" placeholder="e.g. FinTech, Automotive, Healthcare…" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Type of Employment <span class="text-destructive">*</span></label><select v-model="d.employmentType" class="input-field"><option value="">Select…</option><option v-for="v in ['Full-time','Part-time','Contract / Freelance','Internship','Working Student']" :key="v" :value="v">{{ v }}</option></select></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Location Preferences</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Preferred Job Location <span class="text-destructive">*</span></label><input v-model="d.preferredLocation" class="input-field" placeholder="e.g. Berlin, Munich, Remote" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Open to Relocation? <span class="text-destructive">*</span></label><select v-model="d.openToRelocation" class="input-field"><option value="">Select…</option><option value="yes">Yes — open to anywhere</option><option value="specific">Yes — specific cities only</option><option value="no">No</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Preferred Salary Range <span class="text-destructive">*</span></label><select v-model="d.preferredSalary" class="input-field"><option value="">Select…</option><option v-for="v in ['Under €30k','€30k–€45k','€45k–€60k','€60k–€80k','€80k–€100k','€100k+']" :key="v" :value="v">{{ v }}</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Target Companies</label><textarea v-model="d.targetCompanies" rows="2" class="input-field resize-none" placeholder="e.g. Zalando, SAP, BMW Group…" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Open to a career change?</label><select v-model="d.openToCareerChange" class="input-field"><option value="">Select…</option><option value="yes">Yes</option><option value="no">No, staying in my field</option><option value="maybe">Open to it</option></select></div>
        </div></div>
      </template>

      <!-- STEP 4 -->
      <template v-if="step === 3">
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Language & Credentials</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">German Language Level <span class="text-destructive">*</span></label><select v-model="d.germanLevel" class="input-field"><option value="">Select…</option><option v-for="v in ['None','A1 – Beginner','A2 – Elementary','B1 – Intermediate','B2 – Upper Intermediate','C1 – Advanced','C2 – Proficient / Native']" :key="v" :value="v">{{ v }}</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Driving License? <span class="text-destructive">*</span></label><select v-model="d.drivingLicense" class="input-field"><option value="">Select…</option><option value="yes">Yes</option><option value="no">No</option></select></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Additional Information</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">What motivates this change?</label><textarea v-model="d.transitionMotivation" rows="2" class="input-field resize-none" placeholder="Tell us what's driving the change…" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Additional training needs?</label><textarea v-model="d.trainingNeeds" rows="2" class="input-field resize-none" placeholder="e.g. data science bootcamp…" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">How did you hear about us? <span class="text-destructive">*</span></label><select v-model="d.howHeard" class="input-field"><option value="">Select…</option><option v-for="v in ['Google / Search','LinkedIn','Instagram','Friend / Referral','Job Board','ChatGPT','Other AI','Other']" :key="v" :value="v">{{ v }}</option></select></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Anything else?</label><textarea v-model="d.additionalInfo" rows="3" class="input-field resize-none" placeholder="Any additional context…" /></div>
        </div></div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Documents</h3><div class="space-y-4">
          <label class="flex items-center gap-3 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors group bg-[hsl(196_89%_9%)]">
            <span class="mdi mdi-upload text-xl text-muted-foreground group-hover:text-primary transition-colors" />
            <div><p class="text-sm font-medium text-foreground">Click to upload CV</p><p class="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p></div>
            <input type="file" accept=".pdf,.docx,.doc" class="hidden" @change="handleFileSelect" />
          </label>
          <div v-if="cvFile" class="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
            <span class="mdi mdi-file-document-outline text-lg text-primary" />
            <p class="text-sm font-medium text-foreground truncate flex-1">{{ cvFile.name }}</p>
            <span v-if="uploading" class="mdi mdi-loading mdi-spin text-primary" />
            <span v-if="cvUploaded" class="mdi mdi-check-circle text-green-500 text-lg" />
          </div>
        </div></div>
      </template>

      <!-- STEP 5 -->
      <template v-if="step === 4">
        <div class="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-4 mb-6">
          <span class="mdi mdi-shield-check text-2xl text-primary shrink-0 mt-0.5" />
          <div class="space-y-1.5">
            <p class="text-sm font-semibold text-foreground">Create a dedicated job application account</p>
            <p class="text-sm text-muted-foreground">We need a separate email and password — not your personal ones.</p>
            <ul class="text-xs text-muted-foreground list-disc list-inside space-y-0.5 pt-1">
              <li>Do <strong>not</strong> use your personal email</li>
              <li>Create something like <span class="font-mono text-primary">yourname.jobs@gmail.com</span></li>
              <li>Your recruiter will use this to apply on your behalf</li>
            </ul>
          </div>
        </div>
        <div class="mb-6"><h3 class="text-xs font-semibold text-primary uppercase tracking-widest mb-4">Account Details</h3><div class="space-y-4">
          <div><label class="text-sm text-foreground mb-1.5 block">Job Application Email <span class="text-destructive">*</span></label><input v-model="d.dummyEmail" type="email" class="input-field" placeholder="e.g. max.muller.jobs@gmail.com" /></div>
          <div><label class="text-sm text-foreground mb-1.5 block">Password <span class="text-destructive">*</span></label>
            <div class="relative"><input v-model="d.dummyPassword" :type="showPass ? 'text' : 'password'" class="input-field pr-10" placeholder="Create a strong password" /><button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><span class="mdi text-sm" :class="showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" /></button></div>
          </div>
        </div></div>
        <label class="flex items-start gap-3 rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors">
          <input type="checkbox" v-model="authorized" class="mt-0.5 shrink-0 h-4 w-4 accent-primary" />
          <span class="text-sm text-muted-foreground leading-relaxed">I acknowledge that I have created this email address solely for job application purposes and I <strong class="text-foreground">authorize Arbeitly and my assigned recruiter</strong> to use these credentials to apply for jobs on my behalf. I understand I can revoke this authorization at any time.</span>
        </label>
      </template>

      <!-- Nav -->
      <div class="flex justify-between mt-8">
        <button v-if="step > 0" @click="back" class="h-10 px-5 rounded-full text-sm font-medium bg-secondary text-foreground flex items-center gap-1.5 hover:bg-secondary/80"><span class="mdi mdi-chevron-left" /> Back</button><div v-else />
        <button v-if="step < 4" @click="next" class="h-10 px-6 rounded-full text-sm font-medium bg-primary text-primary-foreground flex items-center gap-1.5 hover:opacity-90">Continue <span class="mdi mdi-chevron-right" /></button>
        <button v-else @click="submit" :disabled="saving || !authorized" class="h-10 px-6 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">{{ saving ? 'Completing...' : 'Complete Onboarding' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const profile = computed(() => auth.user?.profile);
const STEPS = [
  { title: 'Personal Details', desc: 'Let us know who you are' },
  { title: 'Professional Background', desc: 'Tell us about your experience' },
  { title: 'Skills & Career Goals', desc: 'What are you aiming for?' },
  { title: 'Final Details', desc: 'Almost done — a few last things' },
  { title: 'Job Application Account', desc: 'Create a dedicated email account for applying' },
];
const step = ref(0);
const errors = ref<string[]>([]);
const saving = ref(false);
const uploading = ref(false);
const cvFile = ref<File | null>(null);
const cvUploaded = ref(false);
const authorized = ref(false);
const showPass = ref(false);
const d = ref({
  firstName: auth.user?.profile?.firstName || '', lastName: auth.user?.profile?.lastName || '',
  applicationEmail: '', phone: auth.user?.profile?.phone || '', linkedin: auth.user?.profile?.linkedinUrl || '',
  dob: '', placeOfBirth: '', address: '',
  currentJobTitle: '', currentEmployer: '', currentField: '', yearsExperience: '',
  currentSalary: '', workedInGermany: '', noticePeriod: '', highestStudy: '',
  degreeTitle: '', university: '', universityLocation: '',
  topSkills: '', certifications: '', careerGoal: '', targetRoles: '',
  targetIndustries: '', employmentType: '', preferredLocation: '',
  openToRelocation: '', preferredSalary: '', targetCompanies: '', openToCareerChange: '',
  germanLevel: '', drivingLicense: '', transitionMotivation: '', trainingNeeds: '',
  howHeard: '', additionalInfo: '',
  dummyEmail: '', dummyPassword: '', preferredLanguage: 'en', baseCoverLetter: '',
});
const REQ: Record<number, { key: string; label: string }[]> = {
  0: [{ key: 'firstName', label: 'First Name' },{ key: 'lastName', label: 'Last Name' },{ key: 'applicationEmail', label: 'Email' },{ key: 'phone', label: 'Phone' },{ key: 'dob', label: 'Date of Birth' },{ key: 'placeOfBirth', label: 'Place of Birth' },{ key: 'address', label: 'Address' }],
  1: [{ key: 'currentJobTitle', label: 'Job Title' },{ key: 'currentEmployer', label: 'Employer' },{ key: 'currentField', label: 'Field' },{ key: 'yearsExperience', label: 'Years of Experience' },{ key: 'workedInGermany', label: 'Worked in Germany' },{ key: 'noticePeriod', label: 'Notice Period' },{ key: 'highestStudy', label: 'Highest Study' },{ key: 'university', label: 'University' }],
  2: [{ key: 'topSkills', label: 'Top Skills' },{ key: 'careerGoal', label: 'Career Goal' },{ key: 'targetRoles', label: 'Target Roles' },{ key: 'targetIndustries', label: 'Industries' },{ key: 'employmentType', label: 'Employment Type' },{ key: 'preferredLocation', label: 'Location' },{ key: 'openToRelocation', label: 'Relocation' },{ key: 'preferredSalary', label: 'Salary' }],
  3: [{ key: 'germanLevel', label: 'German Level' },{ key: 'drivingLicense', label: 'Driving License' },{ key: 'howHeard', label: 'How heard' }],
  4: [],
};
function validate() {
  const m: string[] = [];
  (REQ[step.value] || []).forEach(({ key, label }) => { if (!(d.value as any)[key]?.toString().trim()) m.push(label); });
  if (step.value === 4) { if (!d.value.dummyEmail.trim()) m.push('Email'); if (!d.value.dummyPassword.trim()) m.push('Password'); if (!authorized.value) m.push('Authorization'); }
  errors.value = m; return m.length === 0;
}
function next() { if (validate()) { errors.value = []; step.value++; window.scrollTo(0, 0); } }
function back() { errors.value = []; step.value--; window.scrollTo(0, 0); }
function handleFileSelect(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { cvFile.value = f; cvUploaded.value = false; uploadCV(); } }
async function uploadCV() {
  if (!cvFile.value) return; uploading.value = true;
  try { const fd = new FormData(); fd.append('file', cvFile.value); fd.append('title', cvFile.value.name.replace(/\.[^.]+$/, '') || 'CV'); await api.post('/cvs', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }); cvUploaded.value = true; } catch { /* non-blocking */ } finally { uploading.value = false; }
}
async function submit() {
  if (!validate()) return; saving.value = true;
  try { await api.post('/onboarding', d.value); await auth.fetchMe(); router.push('/candidate/applications'); } catch (e: any) { errors.value = [e?.response?.data?.error || 'Failed']; } finally { saving.value = false; }
}
const readOnlySections = computed(() => {
  const p = profile.value as any; if (!p) return [];
  return [
    { title: 'Personal', icon: 'mdi-account-outline', fields: [{ label: 'Name', value: `${p.firstName} ${p.lastName}`.trim() },{ label: 'Phone', value: p.phone },{ label: 'Location', value: p.location }] },
    { title: 'Credentials', icon: 'mdi-key-outline', fields: [{ label: 'Dummy Email', value: p.dummyEmail },{ label: 'Language', value: p.preferredLanguage === 'de' ? 'Deutsch' : 'English' }] },
  ];
});
</script>
