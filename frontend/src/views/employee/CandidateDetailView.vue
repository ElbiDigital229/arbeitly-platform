<template>
  <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
    <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading...</span>
  </div>

  <div v-else-if="!candidate" class="text-center py-16 text-muted-foreground">
    <p>Candidate not found.</p>
    <router-link to="/employee/candidates" class="text-primary hover:underline text-sm mt-2 inline-block">← Back</router-link>
  </div>

  <div v-else class="max-w-5xl space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <router-link to="/employee/candidates" class="h-8 w-8 rounded-lg flex items-center justify-center border border-border hover:bg-secondary/50 text-muted-foreground">
        <span class="mdi mdi-arrow-left text-sm" />
      </router-link>
      <div class="flex items-center gap-3 flex-1">
        <div class="h-12 w-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg shrink-0">
          {{ initials }}
        </div>
        <div>
          <h1 class="font-display text-xl font-bold text-foreground">{{ fullName }}</h1>
          <p class="text-sm text-muted-foreground">{{ candidate.email }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="activeTab === tab.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'">
        {{ tab.label }}
      </button>
    </div>

    <!-- ═══════════ Profile Tab ═══════════ -->
    <template v-if="activeTab === 'profile'">
      <div class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 class="font-display text-base font-semibold text-foreground">Personal Information</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><p class="text-xs text-muted-foreground">Name</p><p class="font-medium text-foreground">{{ fullName }}</p></div>
          <div><p class="text-xs text-muted-foreground">Email</p><p class="font-medium text-foreground">{{ candidate.email }}</p></div>
          <div><p class="text-xs text-muted-foreground">Phone</p><p class="font-medium text-foreground">{{ candidate.profile?.phone || '—' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Location</p><p class="font-medium text-foreground">{{ candidate.profile?.location || '—' }}</p></div>
          <div v-if="candidate.profile?.linkedinUrl"><p class="text-xs text-muted-foreground">LinkedIn</p><p class="font-medium text-primary truncate">{{ candidate.profile.linkedinUrl }}</p></div>
          <div><p class="text-xs text-muted-foreground">Onboarding</p><p class="font-medium" :class="candidate.profile?.onboardingCompleted ? 'text-green-400' : 'text-yellow-400'">{{ candidate.profile?.onboardingCompleted ? 'Completed' : 'Pending' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Language</p><p class="font-medium text-foreground">{{ candidate.profile?.preferredLanguage === 'en' ? 'English' : 'Deutsch' }}</p></div>
        </div>
      </div>

      <!-- Dummy Credentials -->
      <div v-if="candidate.profile?.dummyEmail || candidate.profile?.dummyPassword" class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 class="font-display text-base font-semibold text-foreground flex items-center gap-2">
          <span class="mdi mdi-key-variant text-primary" /> Application Credentials
        </h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs text-muted-foreground">Dummy Email</p>
            <p class="font-medium text-foreground font-mono">{{ candidate.profile.dummyEmail || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-muted-foreground">Dummy Password</p>
            <div class="flex items-center gap-2">
              <p class="font-medium text-foreground font-mono">{{ showPassword ? candidate.profile.dummyPassword : '••••••••' }}</p>
              <button @click="showPassword = !showPassword" class="text-muted-foreground hover:text-foreground">
                <span class="mdi text-sm" :class="showPassword ? 'mdi-eye-off' : 'mdi-eye'" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ Onboarding Tab ═══════════ -->
    <template v-if="activeTab === 'onboarding'">
      <div v-if="!onboarding" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-clipboard-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-muted-foreground mt-3">Onboarding not completed yet.</p>
      </div>
      <div v-else class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 class="font-display text-base font-semibold text-foreground">Onboarding Responses</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div><p class="text-xs text-muted-foreground">First Name</p><p class="font-medium text-foreground">{{ onboarding.firstName || '—' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Last Name</p><p class="font-medium text-foreground">{{ onboarding.lastName || '—' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Phone</p><p class="font-medium text-foreground">{{ onboarding.phone || '—' }}</p></div>
          <div><p class="text-xs text-muted-foreground">Location</p><p class="font-medium text-foreground">{{ onboarding.location || '—' }}</p></div>
        </div>
        <div v-if="onboarding.bio">
          <p class="text-xs text-muted-foreground mb-1">Bio</p>
          <p class="text-sm text-foreground">{{ onboarding.bio }}</p>
        </div>
        <div v-if="onboarding.baseCoverLetter">
          <p class="text-xs text-muted-foreground mb-1">Base Cover Letter</p>
          <pre class="text-xs text-foreground whitespace-pre-wrap font-mono p-3 rounded-lg bg-secondary/30">{{ onboarding.baseCoverLetter }}</pre>
        </div>
        <div v-if="onboarding.dummyEmail || onboarding.dummyPassword" class="border-t border-border pt-4">
          <h4 class="text-sm font-semibold text-foreground mb-2">Application Credentials</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><p class="text-xs text-muted-foreground">Dummy Email</p><p class="font-medium text-foreground font-mono">{{ onboarding.dummyEmail || '—' }}</p></div>
            <div><p class="text-xs text-muted-foreground">Dummy Password</p><p class="font-medium text-foreground font-mono">{{ onboarding.dummyPassword || '—' }}</p></div>
          </div>
        </div>
        <div v-if="onboarding.preferredLanguage" class="border-t border-border pt-4">
          <p class="text-xs text-muted-foreground">Preferred Language</p>
          <p class="text-sm font-medium text-foreground">{{ onboarding.preferredLanguage === 'en' ? 'English' : 'Deutsch' }}</p>
        </div>
      </div>
    </template>

    <!-- ═══════════ CV Tab ═══════════ -->
    <template v-if="activeTab === 'cv'">
      <div v-if="cvs.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-file-document-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-muted-foreground mt-3">No CVs uploaded yet.</p>
      </div>
      <template v-else>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <select v-model="selectedCvId" class="h-9 rounded-lg bg-secondary border-none text-sm text-foreground px-3 outline-none">
              <option v-for="cv in cvs" :key="cv.id" :value="cv.id">
                {{ cv.title || cv.originalName || 'CV' }}{{ cv.isBase ? ' (Base)' : '' }}{{ cv.parentType ? ` — ${cv.parentType}` : '' }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button @click="enhanceCv" :disabled="enhancingCv" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {{ enhancingCv ? 'Enhancing...' : 'Enhance with Arbeitly' }}
            </button>
          </div>
        </div>

        <!-- CV rendered preview -->
        <div v-if="selectedCv?.htmlContent || selectedCvRenderedHtml" class="rounded-xl border border-border bg-white overflow-hidden">
          <iframe
            ref="cvPreviewFrame"
            class="w-full border-0"
            style="min-height: 600px; max-height: 80vh;"
            :srcdoc="selectedCvRenderedHtml"
          />
        </div>
        <!-- Fallback: structured view from parsedData -->
        <div v-else-if="selectedCv?.parsedData" class="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 class="font-display text-base font-semibold text-foreground">{{ parsedPersonal?.name || 'CV Content' }}</h3>
          <p v-if="parsedPersonal?.email || parsedPersonal?.phone" class="text-xs text-muted-foreground">
            {{ [parsedPersonal?.email, parsedPersonal?.phone, parsedPersonal?.location].filter(Boolean).join(' · ') }}
          </p>
          <div v-if="parsedSummary" class="space-y-1">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</h4>
            <p class="text-sm text-foreground">{{ parsedSummary }}</p>
          </div>
          <div v-if="parsedExperience?.length" class="space-y-2">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</h4>
            <div v-for="(exp, i) in parsedExperience" :key="i" class="space-y-0.5">
              <p class="text-sm font-medium text-foreground">{{ exp.title }} — {{ exp.company }}</p>
              <p class="text-xs text-muted-foreground">{{ exp.dates }}</p>
              <p class="text-xs text-foreground whitespace-pre-wrap">{{ exp.description }}</p>
            </div>
          </div>
          <div v-if="parsedEducation?.length" class="space-y-2">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Education</h4>
            <div v-for="(edu, i) in parsedEducation" :key="i" class="space-y-0.5">
              <p class="text-sm font-medium text-foreground">{{ edu.degree }} — {{ edu.institution }}</p>
              <p class="text-xs text-muted-foreground">{{ edu.dates }}</p>
            </div>
          </div>
          <div v-if="parsedSkills?.length" class="space-y-1">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</h4>
            <p class="text-sm text-foreground">{{ parsedSkills.join(', ') }}</p>
          </div>
        </div>
        <div v-else class="rounded-xl border border-border bg-card p-6">
          <p class="text-sm text-muted-foreground">No parsed content available for this CV.</p>
        </div>

        <!-- Enhancement result -->
        <div v-if="cvEnhanceResult" class="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-display text-base font-semibold text-foreground">Enhanced CV</h3>
            <div class="flex gap-2">
              <button @click="saveCvVersion" class="h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground">Save as Version</button>
              <button @click="cvEnhanceResult = null" class="h-8 px-3 rounded-lg text-xs font-medium bg-secondary text-foreground">Dismiss</button>
            </div>
          </div>
          <pre class="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[40vh] overflow-y-auto">{{ cvEnhanceResult }}</pre>
        </div>

        <!-- Custom prompt -->
        <div class="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Custom Enhancement</h4>
          <div class="flex gap-2">
            <input v-model="cvCustomPrompt" class="input-field flex-1" placeholder="e.g. Make it more concise, focus on leadership..." />
            <button @click="enhanceCvCustom" :disabled="!cvCustomPrompt || enhancingCv" class="h-9 px-4 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50">
              Run
            </button>
          </div>
        </div>

        <!-- Version tree -->
        <div v-if="cvVersions.length > 0" class="rounded-xl border border-border bg-card p-4 space-y-2">
          <h4 class="text-sm font-semibold text-foreground">Versions & Variants</h4>
          <div v-for="v in cvVersions" :key="v.id" class="space-y-1">
            <button @click="selectedCvId = v.id" class="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-secondary/40" :class="selectedCvId === v.id ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground'">
              <span class="mdi mdi-file-tree" /> {{ v.title || 'Version' }} <span class="text-[10px] opacity-60">{{ v.parentType }}</span>
            </button>
            <div v-if="v.children?.length" class="pl-6 space-y-1">
              <button v-for="c in v.children" :key="c.id" @click="selectedCvId = c.id" class="flex items-center gap-2 w-full text-left px-2 py-1 rounded-lg text-xs hover:bg-secondary/40" :class="selectedCvId === c.id ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground'">
                <span class="mdi mdi-subdirectory-arrow-right" /> {{ c.title || 'Variant' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>

    <!-- ═══════════ Cover Letter Tab ═══════════ -->
    <template v-if="activeTab === 'cl'">
      <div v-if="coverLetters.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-file-edit-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-muted-foreground mt-3">No cover letters yet.</p>
      </div>
      <template v-else>
        <div class="flex items-center justify-between">
          <select v-model="selectedClId" class="h-9 rounded-lg bg-secondary border-none text-sm text-foreground px-3 outline-none">
            <option v-for="cl in coverLetters" :key="cl.id" :value="cl.id">
              {{ cl.title }}{{ cl.isBase ? ' (Base)' : '' }}{{ cl.parentType ? ` — ${cl.parentType}` : '' }}
            </option>
          </select>
          <button @click="enhanceCl" :disabled="enhancingCl" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {{ enhancingCl ? 'Enhancing...' : 'Enhance with Arbeitly' }}
          </button>
        </div>

        <div class="rounded-xl border border-border bg-card p-6">
          <pre class="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[60vh] overflow-y-auto">{{ selectedCl?.content || 'No content.' }}</pre>
        </div>

        <div v-if="clEnhanceResult" class="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-display text-base font-semibold text-foreground">Enhanced Cover Letter</h3>
            <div class="flex gap-2">
              <button @click="saveClVersion" class="h-8 px-3 rounded-lg text-xs font-medium bg-primary text-primary-foreground">Save as Version</button>
              <button @click="clEnhanceResult = null" class="h-8 px-3 rounded-lg text-xs font-medium bg-secondary text-foreground">Dismiss</button>
            </div>
          </div>
          <pre class="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[40vh] overflow-y-auto">{{ clEnhanceResult }}</pre>
        </div>

        <div class="rounded-xl border border-border bg-card p-4 space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Custom Enhancement</h4>
          <div class="flex gap-2">
            <input v-model="clCustomPrompt" class="input-field flex-1" placeholder="e.g. Make it more formal, emphasize teamwork..." />
            <button @click="enhanceClCustom" :disabled="!clCustomPrompt || enhancingCl" class="h-9 px-4 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50">
              Run
            </button>
          </div>
        </div>
      </template>
    </template>

    <!-- ═══════════ FAQ Tab ═══════════ -->
    <template v-if="activeTab === 'faq'">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">{{ faqItems.length }} FAQ item{{ faqItems.length !== 1 ? 's' : '' }}</p>
        <button @click="showAddFaq = true" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          <span class="mdi mdi-plus" /> Add FAQ
        </button>
      </div>

      <div v-if="faqItems.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-help-circle-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-foreground mt-3">No FAQ items yet</p>
        <p class="text-xs text-muted-foreground mt-1">Create FAQ items for this candidate's interview prep.</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="item in faqItems" :key="item.id" class="rounded-xl border border-border bg-card p-4 space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span v-if="item.category" class="rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">{{ item.category }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-medium" :class="item.isApproved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'">
                  {{ item.isApproved ? 'Approved' : 'Pending' }}
                </span>
              </div>
              <p class="text-sm font-medium text-foreground">{{ item.question }}</p>
              <p class="text-xs text-muted-foreground whitespace-pre-wrap">{{ item.answer }}</p>
            </div>
            <button @click="deleteFaqItem(item.id)" class="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive shrink-0">
              <span class="mdi mdi-trash-can-outline text-sm" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add FAQ dialog -->
      <div v-if="showAddFaq" class="modal-overlay">
        <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-md space-y-4">
          <h3 class="font-display text-lg font-bold text-foreground">Add FAQ Item</h3>
          <div class="space-y-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Category</label><input v-model="newFaq.category" class="input-field" placeholder="e.g. Interview, Technical, General" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Question *</label><input v-model="newFaq.question" class="input-field" placeholder="What is your greatest strength?" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Answer *</label><textarea v-model="newFaq.answer" rows="4" class="input-field resize-none" placeholder="Prepared answer..." /></div>
          </div>
          <div class="flex gap-2 justify-end">
            <button @click="showAddFaq = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
            <button @click="submitFaq" :disabled="!newFaq.question || !newFaq.answer || addingFaq"
              class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
              {{ addingFaq ? 'Adding...' : 'Add FAQ' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ Applications Tab ═══════════ -->
    <template v-if="activeTab === 'applications'">
      <!-- View toggle + Add -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <p class="text-sm text-muted-foreground">{{ applications.length }} application{{ applications.length !== 1 ? 's' : '' }}</p>
          <div class="flex items-center gap-1 ml-4 rounded-lg border border-border p-0.5">
            <button @click="appView = 'list'" class="px-2 py-1 rounded text-xs" :class="appView === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground'">
              <span class="mdi mdi-format-list-bulleted" /> List
            </button>
            <button @click="appView = 'kanban'" class="px-2 py-1 rounded text-xs" :class="appView === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground'">
              <span class="mdi mdi-view-column-outline" /> Kanban
            </button>
          </div>
        </div>
        <button @click="showAddApp = true" class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90">
          <span class="mdi mdi-plus" /> Add Application
        </button>
      </div>

      <!-- List view -->
      <template v-if="appView === 'list'">
        <div v-if="applications.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
          <span class="mdi mdi-briefcase-outline text-5xl text-muted-foreground/20" />
          <p class="text-sm text-foreground mt-3">No applications yet</p>
        </div>
        <div v-else class="space-y-2">
          <div v-for="app in applications" :key="app.id" class="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-medium text-foreground">{{ app.jobTitle }}</p>
                <span :class="statusClass(app.status)" class="rounded-full px-2 py-0.5 text-[10px] font-medium">{{ app.status.replace('_', ' ') }}</span>
                <span v-if="app.source === 'platform'" class="rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">Arbeitly</span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">{{ app.companyName }}{{ app.salary ? ` · ${app.salary}` : '' }}</p>
            </div>
            <select :value="app.status" @change="updateAppStatus(app.id, ($event.target as HTMLSelectElement).value)"
              class="h-7 rounded-md bg-secondary border-none text-xs text-foreground px-2 outline-none">
              <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
            </select>
            <button @click="deleteApp(app.id)" class="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-destructive">
              <span class="mdi mdi-trash-can-outline text-sm" />
            </button>
          </div>
        </div>
      </template>

      <!-- Kanban view -->
      <template v-if="appView === 'kanban'">
        <div class="flex gap-3 overflow-x-auto pb-4">
          <div v-for="col in statuses" :key="col" class="min-w-[220px] flex-1 space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <span :class="statusDotClass(col)" class="h-2 w-2 rounded-full" />
              <p class="text-xs font-semibold text-muted-foreground uppercase">{{ col.replace('_', ' ') }}</p>
              <span class="text-[10px] text-muted-foreground tabular-nums">({{ kanbanCols[col]?.length || 0 }})</span>
            </div>
            <div v-for="app in (kanbanCols[col] || [])" :key="app.id"
              class="rounded-lg border border-border bg-card p-3 space-y-1 cursor-pointer hover:border-primary/30 transition-colors"
              draggable="true" @dragstart="dragApp = app" @dragover.prevent @drop="moveApp(app.id, col)">
              <p class="text-xs font-medium text-foreground">{{ app.jobTitle }}</p>
              <p class="text-[10px] text-muted-foreground">{{ app.companyName }}</p>
            </div>
            <div class="h-16 border-2 border-dashed border-border/50 rounded-lg" @dragover.prevent @drop="dropToCol(col)" />
          </div>
        </div>
      </template>

      <!-- Add dialog -->
      <div v-if="showAddApp" class="modal-overlay">
        <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-md space-y-4">
          <h3 class="font-display text-lg font-bold text-foreground">Add Application</h3>
          <div class="space-y-3">
            <div><label class="text-sm font-medium text-foreground block mb-1">Job Title *</label><input v-model="newApp.jobTitle" class="input-field" placeholder="Software Engineer" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Company *</label><input v-model="newApp.companyName" class="input-field" placeholder="Acme GmbH" /></div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Job URL</label><input v-model="newApp.jobUrl" class="input-field" placeholder="https://..." /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="text-sm font-medium text-foreground block mb-1">Status</label><select v-model="newApp.status" class="input-field"><option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option></select></div>
              <div><label class="text-sm font-medium text-foreground block mb-1">Salary</label><input v-model="newApp.salary" class="input-field" placeholder="€60,000" /></div>
            </div>
            <div><label class="text-sm font-medium text-foreground block mb-1">Notes</label><textarea v-model="newApp.notes" rows="2" class="input-field resize-none" /></div>
          </div>
          <div class="flex gap-2 justify-end">
            <button @click="showAddApp = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
            <button @click="submitNewApp" :disabled="!newApp.jobTitle || !newApp.companyName || addingApp"
              class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
              {{ addingApp ? 'Adding...' : 'Add Application' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';

const store = useEmployeeStore();
const route = useRoute();
const candidateId = route.params.id as string;

const loading = ref(true);
const candidate = ref<any>(null);
const applications = ref<any[]>([]);
const activeTab = ref('profile');
const showAddApp = ref(false);
const addingApp = ref(false);
const appView = ref<'list' | 'kanban'>('list');
const dragApp = ref<any>(null);
const showPassword = ref(false);

// Onboarding
const onboarding = ref<any>(null);

// CV state
const cvs = ref<any[]>([]);
const selectedCvId = ref('');
const cvVersions = ref<any[]>([]);
const enhancingCv = ref(false);
const cvEnhanceResult = ref<string | null>(null);
const cvCustomPrompt = ref('');

// CL state
const coverLetters = ref<any[]>([]);
const selectedClId = ref('');
const enhancingCl = ref(false);
const clEnhanceResult = ref<string | null>(null);
const clCustomPrompt = ref('');

// FAQ state
const faqItems = ref<any[]>([]);
const showAddFaq = ref(false);
const addingFaq = ref(false);
const newFaq = ref({ question: '', answer: '', category: '' });

const statuses = ['TO_APPLY', 'APPLIED', 'IN_PROGRESS', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'FAILED'];
const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'cv', label: 'CV' },
  { id: 'cl', label: 'Cover Letter' },
  { id: 'faq', label: 'FAQ' },
  { id: 'applications', label: 'Applications' },
];

const newApp = ref({ jobTitle: '', companyName: '', jobUrl: '', status: 'TO_APPLY', salary: '', notes: '' });

const fullName = computed(() => {
  const p = candidate.value?.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return candidate.value?.email?.split('@')[0] || '';
});

const initials = computed(() => fullName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase());

const selectedCv = computed(() => cvs.value.find(c => c.id === selectedCvId.value));
const selectedCl = computed(() => coverLetters.value.find(c => c.id === selectedClId.value));

// CV preview helpers
const cvPreviewFrame = ref<HTMLIFrameElement | null>(null);
const selectedCvRenderedHtml = computed(() => {
  const cv = selectedCv.value;
  if (!cv) return '';
  if (cv.htmlContent) {
    const style = cv.style || 'modern';
    const CSS: Record<string, string> = {
      modern: `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:40px 48px}h1{font-size:2rem;font-weight:700;margin:0 0 4px;color:#0f172a}h2{font-size:.9rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:4px;margin:20px 0 8px}p,li{font-size:.88rem;line-height:1.65;color:#334155;margin:3px 0}ul{padding-left:18px}strong{color:#0f172a}.contact{font-size:.82rem;color:#64748b;margin:4px 0 20px}`,
      classic: `body{font-family:Georgia,serif;color:#1a1a1a;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:48px 56px}h1{font-size:1.9rem;font-weight:700;margin:0 0 4px;border-bottom:3px double #1a1a1a;padding-bottom:8px}h2{font-size:.9rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:20px 0 6px;color:#1a1a1a}p,li{font-size:.9rem;line-height:1.7;color:#2d2d2d;margin:3px 0}ul{padding-left:20px}.contact{font-size:.82rem;color:#555;margin:4px 0 20px}`,
      minimal: `body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#222;margin:0;padding:0}.w{max-width:760px;margin:0 auto;padding:44px 52px}h1{font-size:1.8rem;font-weight:300;letter-spacing:.04em;margin:0 0 4px}h2{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#888;margin:24px 0 6px}p,li{font-size:.87rem;line-height:1.6;color:#444;margin:3px 0}ul{padding-left:16px}.contact{font-size:.8rem;color:#888;margin:4px 0 20px}`,
    };
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}${CSS[style] || CSS.modern}</style></head><body><div class="w">${cv.htmlContent}</div></body></html>`;
  }
  return '';
});
const parsedData = computed(() => {
  const cv = selectedCv.value;
  if (!cv?.parsedData) return null;
  return typeof cv.parsedData === 'string' ? JSON.parse(cv.parsedData) : cv.parsedData;
});
const parsedPersonal = computed(() => parsedData.value?.personal);
const parsedSummary = computed(() => parsedData.value?.summary);
const parsedExperience = computed(() => parsedData.value?.experience);
const parsedEducation = computed(() => parsedData.value?.education);
const parsedSkills = computed(() => parsedData.value?.skills);

const kanbanCols = computed(() => {
  const cols: Record<string, any[]> = {};
  for (const s of statuses) cols[s] = [];
  for (const app of applications.value) {
    if (cols[app.status]) cols[app.status].push(app);
  }
  return cols;
});

const headers = computed(() => store.getAuthHeaders());

function statusClass(s: string) {
  const map: Record<string, string> = {
    TO_APPLY: 'bg-muted text-muted-foreground',
    APPLIED: 'bg-blue-500/10 text-blue-400',
    IN_PROGRESS: 'bg-cyan-500/10 text-cyan-400',
    INTERVIEW: 'bg-yellow-500/10 text-yellow-400',
    OFFER: 'bg-purple-500/10 text-purple-400',
    ACCEPTED: 'bg-green-500/10 text-green-400',
    REJECTED: 'bg-destructive/10 text-destructive',
    FAILED: 'bg-orange-500/10 text-orange-400',
  };
  return map[s] || '';
}

function statusDotClass(s: string) {
  const map: Record<string, string> = {
    TO_APPLY: 'bg-muted-foreground',
    APPLIED: 'bg-blue-400',
    IN_PROGRESS: 'bg-cyan-400',
    INTERVIEW: 'bg-yellow-400',
    OFFER: 'bg-purple-400',
    ACCEPTED: 'bg-green-400',
    REJECTED: 'bg-destructive',
    FAILED: 'bg-orange-400',
  };
  return map[s] || 'bg-muted-foreground';
}

onMounted(async () => {
  try {
    const [cRes, aRes] = await Promise.all([
      api.get(`/employee/candidates/${candidateId}`, { headers: headers.value }),
      api.get(`/employee/candidates/${candidateId}/applications`, { headers: headers.value }),
    ]);
    candidate.value = cRes.data.data;
    applications.value = aRes.data.data || [];
  } catch (err) {
    console.error('Failed to load candidate:', err);
  } finally {
    loading.value = false;
  }
});

// Lazy-load tab data
watch(activeTab, async (tab) => {
  if (tab === 'onboarding' && !onboarding.value) {
    try {
      const { data } = await api.get(`/employee/candidates/${candidateId}/onboarding`, { headers: headers.value });
      onboarding.value = data.data;
    } catch { /* no onboarding */ }
  }
  if (tab === 'cv' && cvs.value.length === 0) {
    try {
      const { data } = await api.get(`/employee/candidates/${candidateId}/cvs`, { headers: headers.value });
      cvs.value = data.data || [];
      if (cvs.value.length > 0) {
        const base = cvs.value.find((c: any) => c.isBase) || cvs.value[0];
        selectedCvId.value = base.id;
        // Load version tree
        const { data: tree } = await api.get(`/employee/candidates/${candidateId}/cvs/${base.id}/tree`, { headers: headers.value });
        cvVersions.value = tree.data || [];
      }
    } catch { /* no cvs */ }
  }
  if (tab === 'faq' && faqItems.value.length === 0) {
    try {
      const { data } = await api.get(`/employee/candidates/${candidateId}/faq`, { headers: headers.value });
      faqItems.value = data.data || [];
    } catch { /* no faq */ }
  }
  if (tab === 'cl' && coverLetters.value.length === 0) {
    try {
      const { data } = await api.get(`/employee/candidates/${candidateId}/cover-letters`, { headers: headers.value });
      coverLetters.value = data.data || [];
      if (coverLetters.value.length > 0) {
        const base = coverLetters.value.find((c: any) => c.isBase) || coverLetters.value[0];
        selectedClId.value = base.id;
      }
    } catch { /* no cls */ }
  }
}, { immediate: false });

// CV actions
async function enhanceCv() {
  if (!selectedCvId.value) return;
  enhancingCv.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cvs/${selectedCvId.value}/enhance`, {}, { headers: headers.value });
    cvEnhanceResult.value = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
  } catch (e: any) { alert(e?.response?.data?.error || 'Enhancement failed.'); }
  finally { enhancingCv.value = false; }
}

async function enhanceCvCustom() {
  if (!selectedCvId.value || !cvCustomPrompt.value) return;
  enhancingCv.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cvs/${selectedCvId.value}/enhance`, { customPrompt: cvCustomPrompt.value }, { headers: headers.value });
    cvEnhanceResult.value = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
    cvCustomPrompt.value = '';
  } catch (e: any) { alert(e?.response?.data?.error || 'Enhancement failed.'); }
  finally { enhancingCv.value = false; }
}

async function saveCvVersion() {
  try {
    await api.post(`/employee/candidates/${candidateId}/cvs/${selectedCvId.value}/version`, { title: 'Enhanced Version', content: cvEnhanceResult.value }, { headers: headers.value });
    cvEnhanceResult.value = null;
    // Refresh
    const { data } = await api.get(`/employee/candidates/${candidateId}/cvs`, { headers: headers.value });
    cvs.value = data.data || [];
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to save version.'); }
}

// CL actions
async function enhanceCl() {
  if (!selectedClId.value) return;
  enhancingCl.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}/enhance`, {}, { headers: headers.value });
    clEnhanceResult.value = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
  } catch (e: any) { alert(e?.response?.data?.error || 'Enhancement failed.'); }
  finally { enhancingCl.value = false; }
}

async function enhanceClCustom() {
  if (!selectedClId.value || !clCustomPrompt.value) return;
  enhancingCl.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}/enhance`, { customPrompt: clCustomPrompt.value }, { headers: headers.value });
    clEnhanceResult.value = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
    clCustomPrompt.value = '';
  } catch (e: any) { alert(e?.response?.data?.error || 'Enhancement failed.'); }
  finally { enhancingCl.value = false; }
}

async function saveClVersion() {
  try {
    await api.post(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}/version`, { title: 'Enhanced Version', content: clEnhanceResult.value }, { headers: headers.value });
    clEnhanceResult.value = null;
    const { data } = await api.get(`/employee/candidates/${candidateId}/cover-letters`, { headers: headers.value });
    coverLetters.value = data.data || [];
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to save version.'); }
}

// FAQ actions
async function submitFaq() {
  addingFaq.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/faq`, newFaq.value, { headers: headers.value });
    faqItems.value.unshift(data.data);
    showAddFaq.value = false;
    newFaq.value = { question: '', answer: '', category: '' };
  } catch (err) { console.error('Failed to add FAQ:', err); }
  finally { addingFaq.value = false; }
}

async function deleteFaqItem(faqId: string) {
  try {
    await api.delete(`/employee/candidates/${candidateId}/faq/${faqId}`, { headers: headers.value });
    faqItems.value = faqItems.value.filter(f => f.id !== faqId);
  } catch (err) { console.error('Failed to delete FAQ:', err); }
}

// Application actions
async function submitNewApp() {
  addingApp.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/applications`, newApp.value, { headers: headers.value });
    applications.value.unshift(data.data);
    showAddApp.value = false;
    newApp.value = { jobTitle: '', companyName: '', jobUrl: '', status: 'TO_APPLY', salary: '', notes: '' };
  } catch (err) { console.error('Failed to add application:', err); }
  finally { addingApp.value = false; }
}

async function updateAppStatus(appId: string, status: string) {
  try {
    await api.put(`/employee/candidates/${candidateId}/applications/${appId}`, { status }, { headers: headers.value });
    const app = applications.value.find(a => a.id === appId);
    if (app) app.status = status;
  } catch (err) { console.error('Failed to update:', err); }
}

async function deleteApp(appId: string) {
  try {
    await api.delete(`/employee/candidates/${candidateId}/applications/${appId}`, { headers: headers.value });
    applications.value = applications.value.filter(a => a.id !== appId);
  } catch (err) { console.error('Failed to delete:', err); }
}

function dropToCol(status: string) {
  if (dragApp.value) {
    updateAppStatus(dragApp.value.id, status);
    dragApp.value = null;
  }
}

function moveApp(_appId: string, _col: string) {
  // handled by dropToCol
}
</script>
