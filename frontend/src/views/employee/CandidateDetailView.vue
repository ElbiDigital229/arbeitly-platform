<template>
  <div v-if="loading" class="flex items-center justify-center py-16 text-muted-foreground">
    <span class="mdi mdi-loading mdi-spin text-2xl mr-2" /><span class="text-sm">Loading...</span>
  </div>

  <div v-else-if="!candidate" class="text-center py-16 text-muted-foreground">
    <p>Candidate not found.</p>
    <router-link to="/employee/candidates" class="text-primary hover:underline text-sm mt-2 inline-block">← Back</router-link>
  </div>

  <div v-else class="space-y-6">
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
      <div v-else class="space-y-4">
        <div v-for="group in onboardingGroups.filter(g => g.fields.some(f => onboardingValue(f.key)))" :key="group.title" class="rounded-xl border border-border bg-card p-6 space-y-4">
          <div class="flex items-center gap-2">
            <span class="mdi text-primary" :class="group.icon" />
            <h3 class="font-display text-base font-semibold text-foreground">{{ group.title }}</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div v-for="f in group.fields.filter(f => onboardingValue(f.key))" :key="f.key" :class="f.full ? 'md:col-span-2' : ''">
              <p class="text-xs text-muted-foreground">{{ f.label }}</p>
              <p v-if="f.mono" class="font-medium text-foreground font-mono break-all">{{ onboardingValue(f.key) }}</p>
              <pre v-else-if="f.pre" class="text-sm text-foreground whitespace-pre-wrap mt-1 p-3 rounded-lg bg-secondary/30">{{ onboardingValue(f.key) }}</pre>
              <p v-else class="font-medium text-foreground whitespace-pre-wrap">{{ onboardingValue(f.key) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════ CV Tab ═══════════ -->
    <template v-if="activeTab === 'cv'">
      <div class="-mx-6 -mb-6">
        <CVBuilderView :candidate-id="candidateId" />
      </div>
    </template>

    <!-- ═══════════ Cover Letter Tab ═══════════ -->
    <template v-if="activeTab === 'cl'">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <select v-if="coverLetters.length > 0" v-model="selectedClId" class="h-9 rounded-lg bg-secondary border-none text-sm text-foreground px-3 outline-none min-w-0">
            <option v-for="cl in coverLetters" :key="cl.id" :value="cl.id">
              {{ cl.title }}{{ cl.isBase ? ' (Base)' : '' }}{{ cl.parentType ? ` — ${cl.parentType}` : '' }}
            </option>
          </select>
          <button @click="startNewCl" class="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">
            <span class="mdi mdi-plus" /> New
          </button>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="selectedCl && clDirty" @click="saveCurrentCl" :disabled="savingCl" class="h-9 px-3 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 disabled:opacity-50">
            <span class="mdi mdi-content-save-outline mr-1" />{{ savingCl ? 'Saving…' : 'Save' }}
          </button>
          <button v-if="selectedCl" @click="enhanceCl" :disabled="enhancingCl" class="h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <span class="mdi mr-1" :class="enhancingCl ? 'mdi-loading mdi-spin' : 'mdi-creation'" />
            {{ enhancingCl ? 'Enhancing…' : 'Enhance with Arbeitly' }}
          </button>
        </div>
      </div>

      <div v-if="coverLetters.length === 0 && !creatingCl" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-file-edit-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-muted-foreground mt-3">No cover letters yet.</p>
        <button @click="startNewCl" class="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground">
          <span class="mdi mdi-plus" /> Create cover letter
        </button>
      </div>

      <div v-if="creatingCl" class="rounded-xl border border-border bg-card p-4 space-y-3">
        <input v-model="newClTitle" placeholder="Cover letter title" class="input-field w-full" />
        <textarea v-model="newClContent" rows="10" placeholder="Cover letter content..." class="input-field w-full resize-y font-mono text-sm" />
        <div class="flex justify-end gap-2">
          <button @click="creatingCl = false" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-foreground">Cancel</button>
          <button @click="submitNewCl" :disabled="!newClTitle || !newClContent || savingCl" class="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50">
            {{ savingCl ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </div>

      <template v-else-if="selectedCl">
        <div class="rounded-xl border border-border bg-card p-3">
          <textarea
            v-model="clEditContent"
            @input="clDirty = true"
            rows="18"
            class="w-full bg-transparent border-none outline-none font-mono text-sm text-foreground resize-y leading-relaxed"
            placeholder="Cover letter content..."
          />
        </div>

        <div v-if="clEnhanceResult" class="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-display text-base font-semibold text-foreground">Enhanced Cover Letter</h3>
            <div class="flex gap-2">
              <button @click="applyEnhancedToEditor" class="h-8 px-3 rounded-lg text-xs font-medium border border-border text-foreground">Apply to editor</button>
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

    <!-- ═══════════ Files Tab ═══════════ -->
    <template v-if="activeTab === 'files'">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">{{ files.length }} file{{ files.length !== 1 ? 's' : '' }}</p>
        <label class="flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
          <span class="mdi" :class="uploadingFile ? 'mdi-loading mdi-spin' : 'mdi-upload'" />
          {{ uploadingFile ? 'Uploading…' : 'Upload File' }}
          <input type="file" class="hidden" @change="onFileSelected" :disabled="uploadingFile" />
        </label>
      </div>

      <div v-if="files.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-folder-outline text-5xl text-muted-foreground/20" />
        <p class="text-sm text-foreground mt-3">No files yet</p>
        <p class="text-xs text-muted-foreground mt-1">Upload any document for this candidate (passport, certificates, references, etc.)</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="f in files" :key="f.id" class="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
          <span class="mdi text-2xl text-primary shrink-0" :class="fileIcon(f.mimetype)" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ f.filename }}</p>
            <p class="text-[11px] text-muted-foreground">{{ formatBytes(f.size) }} · {{ formatFileDate(f.createdAt) }}</p>
          </div>
          <button @click="downloadFile(f)" class="h-8 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60">
            <span class="mdi mdi-download text-xs mr-1" /> Download
          </button>
          <button @click="deleteFile(f.id)" class="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive">
            <span class="mdi mdi-trash-can-outline text-sm" />
          </button>
        </div>
      </div>
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

    <!-- ═══════════ Pipeline Tab ═══════════ -->
    <template v-if="activeTab === 'pipeline'">
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">
          {{ pipeline.length }} job{{ pipeline.length !== 1 ? 's' : '' }} queued — tailored CV + cover letter auto-generated when added.
        </p>
        <button @click="loadPipeline" class="h-8 px-3 rounded-md text-xs font-medium border border-border text-foreground hover:bg-white/5 flex items-center gap-1.5">
          <span class="mdi mdi-refresh text-sm" /> Refresh
        </button>
      </div>

      <div v-if="pipelineLoading" class="text-sm text-muted-foreground">Loading…</div>

      <div v-else-if="!pipeline.length" class="rounded-xl border border-border bg-card p-12 text-center">
        <span class="mdi mdi-timer-sand-empty text-5xl text-muted-foreground/20" />
        <p class="text-sm text-foreground mt-3">No jobs in pipeline</p>
        <p class="text-xs text-muted-foreground mt-1">Add a job from Job Discovery to start building tailored applications.</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="item in pipeline" :key="item.id" class="rounded-xl border border-border bg-card p-4">
          <div class="flex items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-medium text-foreground">{{ item.job.title }}</p>
                <span :class="['rounded-full px-2 py-0.5 text-[10px] font-semibold', pipelineStatusClasses(item.status)]">
                  {{ pipelineStatusLabel(item.status) }}
                </span>
                <span v-if="item.relevanceScore != null" class="text-[10px] text-muted-foreground">
                  Match {{ Math.round(item.relevanceScore) }}%
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ item.job.company }}<span v-if="item.job.location"> · {{ item.job.location }}</span>
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-if="item.generatedCv" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">
                  <span class="mdi mdi-file-document-outline" /> Tailored CV
                </span>
                <span v-if="item.generatedCl" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">
                  <span class="mdi mdi-email-outline" /> Tailored CL
                </span>
                <a v-if="item.application?.jobUrl || item.job.url" :href="item.application?.jobUrl || item.job.url" target="_blank" rel="noopener"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground hover:text-foreground">
                  <span class="mdi mdi-open-in-new" /> Job posting
                </a>
              </div>
            </div>
            <div class="shrink-0 flex flex-col items-end gap-1">
              <button
                v-if="item.status === 'READY' || item.status === 'CV_GENERATED'"
                @click="markApplied(item)"
                :disabled="applyingId === item.id"
                class="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <span class="mdi mdi-send" />
                {{ applyingId === item.id ? 'Applying…' : 'Mark as applied' }}
              </button>
              <span v-else-if="item.status === 'APPLIED' && item.appliedAt" class="text-[10px] text-muted-foreground">
                {{ new Date(item.appliedAt).toLocaleDateString() }}
              </span>
            </div>
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
import CVBuilderView from '../candidate/CVBuilderView.vue';

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

const LANG_LABEL: Record<string, string> = { en: 'English', de: 'Deutsch' };

const COUNTRY_NAMES: Record<string, string> = { DE: 'Germany', AT: 'Austria', CH: 'Switzerland', FR: 'France', NL: 'Netherlands', BE: 'Belgium', LU: 'Luxembourg', IT: 'Italy', ES: 'Spain', PT: 'Portugal', IE: 'Ireland', GB: 'United Kingdom', DK: 'Denmark', SE: 'Sweden', NO: 'Norway', FI: 'Finland', PL: 'Poland', CZ: 'Czechia', SK: 'Slovakia', HU: 'Hungary', RO: 'Romania', BG: 'Bulgaria', GR: 'Greece', HR: 'Croatia', US: 'United States', CA: 'Canada', AU: 'Australia', JP: 'Japan', SG: 'Singapore', IN: 'India', AE: 'UAE', SA: 'Saudi Arabia', TR: 'Turkey', ZA: 'South Africa', BR: 'Brazil', MX: 'Mexico', CN: 'China', KR: 'South Korea' };
const WORK_MODE_LABEL: Record<string, string> = { remote: 'Remote only', hybrid: 'Hybrid', onsite: 'On-site', any: 'Open to any' };
const RELOC_LABEL: Record<string, string> = { no: 'No', within_country: 'Within country', abroad: 'Out of country', anywhere: 'Anywhere' };
const VISA_LABEL: Record<string, string> = { no: 'No sponsorship needed', now: 'Needs sponsorship now', future: 'Will need in future' };
const AVAIL_LABEL: Record<string, string> = { immediate: 'Immediately', '2_weeks': 'Within 2 weeks', '1_month': '1 month notice', '2_months': '2 months notice', '3_months': '3 months notice', flexible: 'Flexible' };

const onboardingGroups = [
  {
    title: 'Personal',
    icon: 'mdi-account-outline',
    fields: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'location', label: 'Location' },
      { key: 'linkedinUrl', label: 'LinkedIn', mono: true, full: true },
      { key: 'portfolioUrl', label: 'Portfolio', mono: true, full: true },
      { key: 'preferredLanguage', label: 'Preferred Language' },
      { key: 'bio', label: 'Bio', full: true, pre: true },
    ],
  },
  {
    title: 'Current Role & Experience',
    icon: 'mdi-briefcase-outline',
    fields: [
      { key: 'currentRole', label: 'Current Role' },
      { key: 'currentRoleIdOther', label: 'Role (typed)', help: true },
      { key: '_yearsExperience', label: 'Years of Experience' },
      { key: 'switchCurrentRole', label: 'Willing to Switch Role' },
      { key: 'switchCareerPath', label: 'Switch Career Path' },
    ],
  },
  {
    title: 'Skills',
    icon: 'mdi-wrench-outline',
    fields: [
      { key: 'skills', label: 'Skills', full: true },
      { key: 'skillIdsOther', label: 'Other Skills (typed)', full: true, help: true },
      { key: 'skillsToHighlight', label: 'Skills to Highlight', full: true, pre: true },
    ],
  },
  {
    title: 'Goals',
    icon: 'mdi-target',
    fields: [
      { key: 'targetRoles', label: 'Target Roles', full: true },
      { key: 'targetRoleIdsOther', label: 'Other Roles (typed)', full: true, help: true },
      { key: 'targetIndustries', label: 'Target Industries', full: true },
      { key: 'targetIndustryIdsOther', label: 'Other Industries (typed)', full: true, help: true },
      { key: 'careerGoal', label: 'Primary Career Goal' },
    ],
  },
  {
    title: 'Location & Mobility',
    icon: 'mdi-map-marker-outline',
    fields: [
      { key: '_baseLocation', label: 'Based In' },
      { key: 'workMode', label: 'Work Mode' },
      { key: 'relocationScope', label: 'Relocation Scope' },
      { key: 'acceptedCities', label: 'Relocation Cities', full: true },
      { key: 'relocationFactors', label: 'Relocation Factors', full: true },
    ],
  },
  {
    title: 'Compensation & Availability',
    icon: 'mdi-cash-multiple',
    fields: [
      { key: '_salary', label: 'Expected Salary' },
      { key: 'benefitsExpectations', label: 'Benefits', full: true, pre: true },
      { key: 'availability', label: 'Availability' },
    ],
  },
  {
    title: 'Legal & Languages',
    icon: 'mdi-earth',
    fields: [
      { key: 'visaSponsorship', label: 'Visa Sponsorship' },
      { key: 'workAuth', label: 'Work Authorization', full: true },
      { key: 'candidateLanguages', label: 'Languages', full: true },
    ],
  },
  {
    title: 'Application Credentials',
    icon: 'mdi-key-outline',
    fields: [
      { key: 'dummyEmail', label: 'Dummy Email', mono: true },
      { key: 'dummyPassword', label: 'Dummy Password', mono: true },
    ],
  },
  {
    title: 'Base Cover Letter',
    icon: 'mdi-file-document-outline',
    fields: [
      { key: 'baseCoverLetter', label: 'Base Cover Letter', full: true, pre: true },
    ],
  },
];

function onboardingValue(key: string): string {
  const ob = onboarding.value;
  if (!ob) return '';

  // Computed / derived keys
  if (key === '_yearsExperience') {
    const mn = ob.yearsExperienceMin; const mx = ob.yearsExperienceMax;
    if (mn == null && mx == null) return '';
    return `${mn ?? '?'} – ${mx ?? '?'} years`;
  }
  if (key === '_baseLocation') {
    const country = COUNTRY_NAMES[ob.baseCountry] ?? ob.baseCountry;
    const parts = [ob.baseCity, country].filter(Boolean);
    return parts.join(', ') || '';
  }
  if (key === '_salary') {
    if (!ob.salaryMin && !ob.salaryMax) return '';
    const cur = ob.salaryCurrency || 'EUR';
    return `${ob.salaryMin ?? '?'} – ${ob.salaryMax ?? '?'} ${cur}`;
  }

  const v = ob[key] ?? ob.onboardingData?.[key];
  if (v == null || v === '') return '';

  // Label lookups
  if (key === 'preferredLanguage') return LANG_LABEL[v] ?? String(v);
  if (key === 'workMode') return WORK_MODE_LABEL[v] ?? String(v);
  if (key === 'relocationScope') return RELOC_LABEL[v] ?? String(v);
  if (key === 'visaSponsorship') return VISA_LABEL[v] ?? String(v);
  if (key === 'availability') return AVAIL_LABEL[v] ?? String(v);

  // Arrays (skills, roles, industries, cities, workAuth, relocationFactors)
  if (Array.isArray(v)) {
    if (v.length === 0) return '';
    // candidateLanguages [{language, level}]
    if (key === 'candidateLanguages') {
      return v.map((l: any) => `${l.language || '?'} (${l.level || '?'})`).join(', ');
    }
    return v.join(', ');
  }

  if (typeof v === 'boolean') return v ? 'Yes' : 'No';

  return String(v);
}

// CL state
const coverLetters = ref<any[]>([]);
const selectedClId = ref('');
const enhancingCl = ref(false);
const clEnhanceResult = ref<string | null>(null);
const clCustomPrompt = ref('');
const clEditContent = ref('');
const clDirty = ref(false);
const savingCl = ref(false);
const creatingCl = ref(false);
const newClTitle = ref('');
const newClContent = ref('');

// Files state
const files = ref<any[]>([]);
const uploadingFile = ref(false);

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
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'applications', label: 'Applications' },
  { id: 'files', label: 'Files' },
];

const pipeline = ref<any[]>([]);
const pipelineLoading = ref(false);
const applyingId = ref<string | null>(null);

async function loadPipeline() {
  pipelineLoading.value = true;
  try {
    const { data } = await api.get(`/employee/candidates/${candidateId}/queue`, { headers: headers.value });
    pipeline.value = data.data || [];
  } catch (err) {
    console.error('Failed to load pipeline:', err);
  } finally {
    pipelineLoading.value = false;
  }
}

async function markApplied(item: any) {
  const jobUrl = window.prompt('Job posting URL (optional, leave blank to skip):', item.application?.jobUrl || item.job?.url || '') || undefined;
  applyingId.value = item.id;
  try {
    await api.post(`/employee/queue/${item.id}/apply`, jobUrl ? { jobUrl } : {}, { headers: headers.value });
    await loadPipeline();
    // Also refresh applications list since the linked app is now APPLIED
    const aRes = await api.get(`/employee/candidates/${candidateId}/applications`, { headers: headers.value });
    applications.value = aRes.data.data || [];
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to mark applied');
  } finally {
    applyingId.value = null;
  }
}

function pipelineStatusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Tailoring…',
    NO_BASE_CV: 'Needs base CV',
    CV_FAILED: 'Tailoring failed',
    CV_GENERATED: 'CV ready',
    READY: 'Ready to apply',
    APPLIED: 'Applied',
  };
  return map[s] || s;
}

function pipelineStatusClasses(s: string) {
  if (s === 'APPLIED') return 'bg-green-500/15 text-green-500 border border-green-500/25';
  if (s === 'READY') return 'bg-primary/15 text-primary border border-primary/25';
  if (s === 'CV_GENERATED') return 'bg-blue-500/15 text-blue-400 border border-blue-500/25';
  if (s === 'NO_BASE_CV' || s === 'CV_FAILED') return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
  return 'bg-secondary text-muted-foreground border border-border';
}

const newApp = ref({ jobTitle: '', companyName: '', jobUrl: '', status: 'TO_APPLY', salary: '', notes: '' });

const fullName = computed(() => {
  const p = candidate.value?.profile;
  if (p?.firstName || p?.lastName) return `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return candidate.value?.email?.split('@')[0] || '';
});

const initials = computed(() => fullName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase());

const selectedCl = computed(() => coverLetters.value.find(c => c.id === selectedClId.value));

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
  if (tab === 'pipeline') {
    await loadPipeline();
  }
  if (tab === 'files' && files.value.length === 0) {
    try {
      const { data } = await api.get(`/employee/candidates/${candidateId}/files`, { headers: headers.value });
      files.value = data.data || [];
    } catch { /* no files */ }
  }
}, { immediate: false });

// Sync CL editor when selection changes
watch(selectedClId, (id) => {
  const cl = coverLetters.value.find(c => c.id === id);
  clEditContent.value = cl?.content || '';
  clDirty.value = false;
  clEnhanceResult.value = null;
});

// CL actions
async function enhanceCl() {
  if (!selectedClId.value) return;
  enhancingCl.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}/enhance`, {}, { headers: headers.value, timeout: 180000 });
    clEnhanceResult.value = typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2);
  } catch (e: any) { alert(e?.response?.data?.error || 'Enhancement failed.'); }
  finally { enhancingCl.value = false; }
}

async function enhanceClCustom() {
  if (!selectedClId.value || !clCustomPrompt.value) return;
  enhancingCl.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}/enhance`, { customPrompt: clCustomPrompt.value }, { headers: headers.value, timeout: 180000 });
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

async function saveCurrentCl() {
  if (!selectedClId.value) return;
  savingCl.value = true;
  try {
    await api.put(`/employee/candidates/${candidateId}/cover-letters/${selectedClId.value}`, { content: clEditContent.value }, { headers: headers.value });
    const cl = coverLetters.value.find(c => c.id === selectedClId.value);
    if (cl) cl.content = clEditContent.value;
    clDirty.value = false;
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to save.'); }
  finally { savingCl.value = false; }
}

function applyEnhancedToEditor() {
  if (clEnhanceResult.value) {
    clEditContent.value = clEnhanceResult.value;
    clDirty.value = true;
    clEnhanceResult.value = null;
  }
}

function startNewCl() {
  newClTitle.value = '';
  newClContent.value = '';
  creatingCl.value = true;
}

async function submitNewCl() {
  savingCl.value = true;
  try {
    const { data } = await api.post(`/employee/candidates/${candidateId}/cover-letters`, { title: newClTitle.value, content: newClContent.value }, { headers: headers.value });
    coverLetters.value.unshift(data.data);
    selectedClId.value = data.data.id;
    creatingCl.value = false;
  } catch (e: any) { alert(e?.response?.data?.error || 'Failed to create.'); }
  finally { savingCl.value = false; }
}

// Files actions
async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  uploadingFile.value = true;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post(`/employee/candidates/${candidateId}/files`, fd, {
      headers: { ...headers.value, 'Content-Type': 'multipart/form-data' },
    });
    files.value.unshift(data.data);
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Upload failed.');
  } finally {
    uploadingFile.value = false;
    input.value = '';
  }
}

async function downloadFile(f: any) {
  try {
    const response = await api.get(`/employee/candidates/${candidateId}/files/${f.id}/download`, {
      headers: headers.value,
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: f.mimetype });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Download failed:', err);
  }
}

async function deleteFile(fileId: string) {
  if (!confirm('Delete this file?')) return;
  try {
    await api.delete(`/employee/candidates/${candidateId}/files/${fileId}`, { headers: headers.value });
    files.value = files.value.filter(f => f.id !== fileId);
  } catch (err) {
    console.error('Delete failed:', err);
  }
}

function fileIcon(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'mdi-image-outline';
  if (mimetype === 'application/pdf') return 'mdi-file-pdf-box';
  if (mimetype.includes('word')) return 'mdi-file-word-box';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'mdi-file-excel-box';
  if (mimetype.startsWith('video/')) return 'mdi-file-video-outline';
  if (mimetype.startsWith('audio/')) return 'mdi-file-music-outline';
  return 'mdi-file-outline';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatFileDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
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
