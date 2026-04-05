<template>
  <!-- EXTRACTING -->
  <div v-if="step === 'extracting'" class="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-6">
    <div class="max-w-md w-full space-y-8 text-center">
      <!-- Icon -->
      <div class="flex justify-center">
        <div class="h-20 w-20 rounded-2xl flex items-center justify-center" :class="extractError ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'">
          <span v-if="extractError" class="mdi mdi-alert-circle-outline text-4xl text-destructive" />
          <span v-else class="mdi mdi-file-search-outline text-4xl text-primary animate-pulse" />
        </div>
      </div>

      <!-- Title + current step -->
      <div>
        <h2 class="text-xl font-bold font-display mb-2 text-foreground">
          {{ extractError ? 'Extraction Failed' : 'Extracting CV Data' }}
        </h2>
        <p v-if="extractError" class="text-sm text-destructive">{{ extractError }}</p>
        <p v-else class="text-sm text-primary font-medium">{{ EXTRACT_STEPS[Math.min(extractStep, EXTRACT_STEPS.length - 1)] }}</p>
      </div>

      <!-- Progress bar -->
      <div v-if="!extractError" class="space-y-2">
        <div class="w-full h-2 rounded-full overflow-hidden bg-secondary">
          <div
            class="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
            :style="`width: ${Math.min(95, ((extractStep + 1) / EXTRACT_STEPS.length) * 100)}%`"
          />
        </div>
        <p class="text-xs text-muted-foreground">{{ Math.min(95, Math.round(((extractStep + 1) / EXTRACT_STEPS.length) * 100)) }}% complete</p>
      </div>

      <!-- Completed steps (compact) -->
      <div v-if="!extractError && extractStep > 0" class="glass rounded-xl p-4">
        <div class="flex flex-wrap gap-2 justify-center">
          <span
            v-for="i in Math.min(extractStep, EXTRACT_STEPS.length - 1)"
            :key="i"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success"
          >
            <span class="mdi mdi-check text-xs" />
            {{ EXTRACT_STEPS[i - 1].replace('…', '') }}
          </span>
        </div>
      </div>

      <!-- Tip -->
      <div v-if="!extractError && currentTip" class="rounded-lg bg-secondary/60 px-4 py-3">
        <p class="text-xs text-muted-foreground italic transition-opacity duration-500">{{ currentTip }}</p>
      </div>

      <!-- Error actions -->
      <div v-if="extractError" class="flex justify-center gap-3">
        <button @click="extractError = ''; step = 'landing'" class="px-4 py-2 rounded-full text-sm font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors">
          Go Back
        </button>
        <button @click="extractError = ''; cvFileInput?.click()" class="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Try Again
        </button>
      </div>
    </div>
  </div>

  <!-- TEMPLATE PICKER -->
  <div v-else-if="step === 'template'" class="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-6">
    <div class="w-full max-w-2xl space-y-8">
      <StepIndicator :steps="['Template','Language','Fill in Details']" :current="0" />
      <div>
        <h1 class="text-2xl font-bold font-display mb-1 text-foreground">Choose a Template</h1>
        <p class="text-sm text-muted-foreground">You can change this at any time in the editor.</p>
      </div>

      <!-- Photo row -->
      <div class="glass rounded-xl p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-12 w-12 rounded-full border border-border bg-secondary overflow-hidden flex items-center justify-center shrink-0">
              <img v-if="editorData.photoDataUrl" :src="editorData.photoDataUrl" class="h-full w-full object-cover" alt="Profile" />
              <span v-else class="text-[10px] text-muted-foreground">No photo</span>
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">Profile photo (optional)</p>
              <p class="text-xs text-muted-foreground">Appears in the CV header and PDF export.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button @click="photoTemplateInput?.click()" class="h-8 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Upload</button>
            <button v-if="editorData.photoDataUrl" @click="editorData.photoDataUrl = ''" class="h-8 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">Remove</button>
          </div>
        </div>
        <input ref="photoTemplateInput" type="file" accept="image/*" class="hidden" @change="onPhotoSelect" />
      </div>

      <div class="grid grid-cols-3 gap-4">
        <button
          v-for="tpl in TEMPLATES"
          :key="tpl.style"
          @click="editorData.style = tpl.style; step = 'language'"
          :class="['rounded-xl border-2 overflow-hidden text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', editorData.style === tpl.style ? 'border-primary ring-2 ring-primary/20' : 'border-border']"
        >
          <TemplateMiniPreview :style="tpl.style" />
          <div class="px-3 py-2.5 border-t border-white/[0.06] bg-card">
            <p class="text-sm font-semibold text-foreground">{{ tpl.label }}</p>
            <p class="text-xs mt-0.5 text-muted-foreground">{{ tpl.desc }}</p>
          </div>
        </button>
      </div>
      <div class="flex justify-between pt-2">
        <button @click="step = 'landing'" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span class="mdi mdi-arrow-left" />Back
        </button>
      </div>
    </div>
  </div>

  <!-- LANGUAGE PICKER -->
  <div v-else-if="step === 'language'" class="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] p-6">
    <div class="w-full max-w-md space-y-8">
      <StepIndicator :steps="['Template','Language','Fill in Details']" :current="1" :completed="[0]" />
      <div>
        <h1 class="text-2xl font-bold font-display mb-1 text-foreground">Choose Language</h1>
        <p class="text-sm text-muted-foreground">Select the language for your CV.</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <button
          v-for="lang in ['EN','DE']"
          :key="lang"
          @click="editorData.language = lang as 'EN'|'DE'"
          class="rounded-xl border-2 p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="editorData.language === lang ? 'border-primary bg-primary/5' : 'border-border'"
        >
          <div class="text-3xl mb-2">{{ lang === 'EN' ? '🇺🇸' : '🇩🇪' }}</div>
          <p class="text-base font-semibold text-foreground">{{ lang === 'EN' ? 'English' : 'German' }}</p>
          <p class="text-xs mt-0.5 text-muted-foreground">{{ lang === 'EN' ? 'For international roles' : 'Für deutsche Stellen' }}</p>
        </button>
      </div>
      <div class="flex justify-between pt-2">
        <button @click="step = 'template'" class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span class="mdi mdi-arrow-left" />Back
        </button>
        <button @click="step = 'editor'" class="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Continue <span class="mdi mdi-arrow-right" />
        </button>
      </div>
    </div>
  </div>

  <!-- EDITOR (split layout) -->
  <div v-else-if="step === 'editor'" class="flex h-[calc(100vh-48px)]">
    <!-- Left: form -->
    <div class="flex flex-col border-r border-border shrink-0 w-full md:w-[480px] bg-[hsl(196,89%,10%)]">
      <!-- Toolbar -->
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border shrink-0">
        <button @click="step = 'landing'" class="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span class="mdi mdi-arrow-left text-sm" />Back
        </button>
        <div class="flex-1" />
        <!-- Style tabs -->
        <div class="flex items-center rounded-lg p-0.5 gap-0.5 bg-secondary">
          <button
            v-for="s in ['modern','classic','minimal']"
            :key="s"
            @click="editorData.style = s as CvStyle"
            :class="['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', editorData.style === s ? 'bg-primary text-white' : 'text-muted-foreground']"
          >{{ s.charAt(0).toUpperCase() + s.slice(1) }}</button>
        </div>
        <!-- Lang tabs -->
        <div class="flex gap-1">
          <button
            v-for="lang in ['EN','DE']"
            :key="lang"
            @click="editorData.language = lang as 'EN'|'DE'"
            class="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="editorData.language === lang ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'"
          >
            <span class="mdi mdi-translate text-xs" />{{ lang }}
          </button>
        </div>
        <div v-if="isSyncing" class="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span class="mdi mdi-loading mdi-spin text-xs" />Saving…
        </div>
      </div>

      <!-- Scrollable form -->
      <div class="flex-1 overflow-y-auto p-5 space-y-5">
        <!-- CV Name -->
        <div>
          <label class="text-xs block mb-1.5 text-muted-foreground">CV Name</label>
          <input v-model="editorData.versionName" placeholder="e.g. My CV – Software Engineer" class="input-field" />
        </div>

        <!-- Personal Info -->
        <div class="glass rounded-xl p-4 space-y-3">
          <p class="text-xs font-semibold text-muted-foreground">Personal Info</p>
          <!-- Photo row -->
          <div class="flex items-center gap-3">
            <div class="h-12 w-12 rounded-full border border-border bg-secondary overflow-hidden flex items-center justify-center shrink-0">
              <img v-if="editorData.photoDataUrl" :src="editorData.photoDataUrl" class="h-full w-full object-cover" alt="Profile" />
              <span v-else class="text-[10px] text-muted-foreground">No photo</span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <button @click="photoEditorInput?.click()" class="h-7 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Upload photo</button>
                <button v-if="editorData.photoDataUrl" @click="editorData.photoDataUrl = ''" class="h-7 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10">Remove</button>
              </div>
              <p class="text-[10px] text-muted-foreground">JPG/PNG. Will be resized for PDF export.</p>
            </div>
            <input ref="photoEditorInput" type="file" accept="image/*" class="hidden" @change="onPhotoSelect" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <label class="text-xs block mb-1 text-foreground">Full Name</label>
              <input v-model="editorData.fullName" placeholder="Anna Müller" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Email</label>
              <input v-model="editorData.email" placeholder="anna@example.com" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Phone</label>
              <input v-model="editorData.phone" placeholder="+49 123 456 789" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Location</label>
              <input v-model="editorData.location" placeholder="Berlin, Germany" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Nationality</label>
              <input v-model="editorData.nationality" placeholder="e.g. German" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">LinkedIn</label>
              <input v-model="editorData.linkedin" placeholder="linkedin.com/in/anna" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Website</label>
              <input v-model="editorData.website" placeholder="anna.com" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">GitHub</label>
              <input v-model="editorData.github" placeholder="github.com/anna" class="input-field" />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Portfolio</label>
              <input v-model="editorData.portfolio" placeholder="anna.dev" class="input-field" />
            </div>
          </div>
        </div>

        <!-- Sections (draggable order) -->
        <template v-for="sectionKey in editorData.sectionOrder" :key="sectionKey">
          <!-- Summary -->
          <div
            v-if="sectionKey === 'summary'"
            class="glass rounded-xl p-4 space-y-2 cursor-move"
            draggable="true"
            @dragstart="dragStart(sectionKey)"
            @dragover.prevent
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center gap-2">
              <span class="mdi mdi-drag-vertical text-sm shrink-0 text-muted-foreground" />
              <p class="text-xs font-semibold text-muted-foreground">Summary</p>
            </div>
            <textarea
              v-model="editorData.summary"
              placeholder="A short professional summary..."
              rows="4"
              class="input-field resize-none"
            />
          </div>

          <!-- Experience -->
          <div
            v-else-if="sectionKey === 'experience'"
            class="glass rounded-xl p-4 space-y-3"
            draggable="true"
            @dragstart="dragStart(sectionKey)"
            @dragover.prevent
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-sm shrink-0 text-muted-foreground" />
                <p class="text-xs font-semibold text-muted-foreground">Work Experience</p>
              </div>
              <button @click="addExp" class="flex items-center gap-1 h-7 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span class="mdi mdi-plus text-xs" />Add
              </button>
            </div>
            <p v-if="editorData.experience.length === 0" class="text-xs italic text-muted-foreground">No experience yet. Click Add to start.</p>
            <div v-for="(exp, i) in editorData.experience" :key="exp.id" class="rounded-lg p-3 space-y-2 border border-white/5 bg-white/[0.02]">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Experience {{ i + 1 }}</span>
                <button @click="removeExp(i)" class="h-6 w-6 rounded flex items-center justify-center hover:bg-white/5">
                  <span class="mdi mdi-trash-can-outline text-xs text-destructive" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <input v-model="exp.role" placeholder="Job Title" class="input-field input-field-sm" />
                <input v-model="exp.company" placeholder="Company" class="input-field input-field-sm" />
                <input v-model="exp.period" placeholder="Period (e.g. Jan 2022 – Present)" class="input-field input-field-sm col-span-2" />
              </div>
              <textarea v-model="exp.description" placeholder="Key responsibilities..." rows="3" class="input-field resize-none" />
            </div>
          </div>

          <!-- Education -->
          <div
            v-else-if="sectionKey === 'education'"
            class="glass rounded-xl p-4 space-y-3"
            draggable="true"
            @dragstart="dragStart(sectionKey)"
            @dragover.prevent
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-sm shrink-0 text-muted-foreground" />
                <p class="text-xs font-semibold text-muted-foreground">Education</p>
              </div>
              <button @click="addEdu" class="flex items-center gap-1 h-7 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span class="mdi mdi-plus text-xs" />Add
              </button>
            </div>
            <p v-if="editorData.education.length === 0" class="text-xs italic text-muted-foreground">No education yet. Click Add to start.</p>
            <div v-for="(edu, i) in editorData.education" :key="edu.id" class="rounded-lg p-3 space-y-2 border border-white/5 bg-white/[0.02]">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-muted-foreground">Education {{ i + 1 }}</span>
                <button @click="removeEdu(i)" class="h-6 w-6 rounded flex items-center justify-center hover:bg-white/5">
                  <span class="mdi mdi-trash-can-outline text-xs text-destructive" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <input v-model="edu.degree" placeholder="Degree / Certification" class="input-field input-field-sm" />
                <input v-model="edu.institution" placeholder="Institution" class="input-field input-field-sm" />
                <input v-model="edu.period" placeholder="Period (e.g. 2018 – 2022)" class="input-field input-field-sm col-span-2" />
              </div>
              <textarea v-model="edu.details" placeholder="Details (GPA, courses, awards...)" rows="2" class="input-field resize-none" />
            </div>
          </div>

          <!-- Skills -->
          <div
            v-else-if="sectionKey === 'skills'"
            class="rounded-xl border border-border p-4 space-y-2"
            draggable="true"
            @dragstart="dragStart(sectionKey)"
            @dragover.prevent
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center gap-2">
              <span class="mdi mdi-drag-vertical text-sm shrink-0 text-muted-foreground" />
              <p class="text-xs font-semibold text-muted-foreground">Skills</p>
            </div>
            <textarea
              v-model="editorData.skills"
              placeholder="React, TypeScript, Node.js, SQL, Agile..."
              rows="3"
              class="input-field resize-none"
            />
            <p class="text-[10px] text-muted-foreground">Comma or newline separated</p>
          </div>

          <!-- Custom section -->
          <div
            v-else-if="sectionKey.startsWith('custom:')"
            class="glass rounded-xl p-4 space-y-3"
            draggable="true"
            @dragstart="dragStart(sectionKey)"
            @dragover.prevent
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-sm shrink-0 text-muted-foreground" />
                <p class="text-xs font-semibold text-muted-foreground">Custom section</p>
              </div>
              <button @click="removeCustomSection(sectionKey)" class="h-7 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10">Remove</button>
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Heading</label>
              <input
                :value="getCustomSection(sectionKey)?.heading || ''"
                @input="updateCustomSection(sectionKey, 'heading', ($event.target as HTMLInputElement).value)"
                placeholder="e.g. Certifications"
                class="input-field"
              />
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Text</label>
              <textarea
                :value="getCustomSection(sectionKey)?.text || ''"
                @input="updateCustomSection(sectionKey, 'text', ($event.target as HTMLTextAreaElement).value)"
                placeholder="Write something..."
                rows="4"
                class="input-field resize-none"
              />
            </div>
          </div>
        </template>

        <!-- Add section picker -->
        <div class="space-y-2">
          <button
            @click="addSectionOpen = !addSectionOpen"
            class="flex items-center gap-1 h-8 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span class="mdi mdi-plus text-xs" />Add section
          </button>
          <div v-if="addSectionOpen" class="rounded-lg border border-border bg-white/[0.02] p-3 space-y-2">
            <p class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quick add</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="name in PREDEFINED_SECTIONS"
                :key="name"
                @click="addCustomSection(name)"
                class="text-xs px-2.5 py-1 rounded-full border border-border text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
              >{{ name }}</button>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <div class="h-px flex-1 bg-border" />
              <span class="text-[10px] text-muted-foreground">or</span>
              <div class="h-px flex-1 bg-border" />
            </div>
            <button @click="addCustomSection('')" class="w-full flex items-center justify-center gap-1 h-7 rounded-lg text-xs text-muted-foreground hover:bg-secondary/50">
              <span class="mdi mdi-plus text-xs" />Blank section
            </button>
          </div>
        </div>

        <!-- Signature -->
        <div class="glass rounded-xl p-4 space-y-3">
          <p class="text-xs font-semibold text-muted-foreground">Signature</p>
          <p class="text-[11px] leading-relaxed text-muted-foreground">Optional — appears at the bottom of your CV (common in German-style CVs).</p>
          <!-- Signature image upload -->
          <div class="flex items-center gap-3">
            <div class="h-12 w-24 rounded border border-border bg-secondary overflow-hidden flex items-center justify-center shrink-0">
              <img v-if="editorData.signatureDataUrl" :src="editorData.signatureDataUrl" class="h-full w-full object-contain" alt="Signature" />
              <span v-else class="text-[10px] text-muted-foreground">No signature</span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <button @click="signatureInput?.click()" class="h-7 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Upload signature</button>
                <button v-if="editorData.signatureDataUrl" @click="editorData.signatureDataUrl = ''" class="h-7 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10">Remove</button>
              </div>
              <p class="text-[10px] text-muted-foreground">PNG/JPG of your handwritten signature.</p>
            </div>
            <input ref="signatureInput" type="file" accept="image/*" class="hidden" @change="onSignatureSelect" />
          </div>
          <!-- Name (read from personal info) -->
          <div>
            <label class="text-xs block mb-1 text-foreground">Name</label>
            <input :value="editorData.fullName" disabled class="input-field opacity-60" />
          </div>
          <!-- Place & Date -->
          <div>
            <label class="text-xs block mb-1 text-foreground">Place & Date</label>
            <input v-model="editorData.signaturePlaceDate" placeholder="Nuremberg, March 2024" class="input-field" />
          </div>
        </div>

        <div class="h-4" />
      </div>

      <!-- Footer -->
      <div class="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
        <button
          @click="handleExportPdf"
          :disabled="isExporting"
          class="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <span class="mdi text-sm" :class="isExporting ? 'mdi-loading mdi-spin' : 'mdi-download'" />
          {{ isExporting ? 'Exporting...' : 'Export PDF' }}
        </button>
        <div class="flex-1" />
        <button
          @click="saveDialogOpen = true; saveName = editorData.versionName || 'My CV'"
          class="flex items-center gap-1.5 h-9 px-5 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Save CV
        </button>
      </div>
    </div>

    <!-- Right: live preview -->
    <div class="hidden md:flex flex-1 flex-col overflow-hidden bg-white/[0.02]">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border shrink-0 bg-black/50">
        <span class="mdi mdi-eye-outline text-sm text-muted-foreground" />
        <span class="text-xs font-medium text-muted-foreground">Live Preview</span>
        <span class="ml-auto text-[10px] text-white/30">Updates as you type</span>
      </div>
      <div class="flex-1 overflow-hidden p-4">
        <iframe
          ref="previewIframe"
          class="w-full h-full rounded-lg shadow-lg border border-white/5 bg-white"
          title="CV Preview"
        />
      </div>
    </div>

    <!-- Save dialog -->
    <div
      v-if="saveDialogOpen"
      class="modal-overlay"
      @click.self="saveDialogOpen = false"
    >
      <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 class="text-base font-bold font-display text-foreground">Save CV</h2>
        <div>
          <label class="text-xs font-medium block mb-1.5 text-foreground">CV Name</label>
          <input v-model="saveName" placeholder="e.g. Software Engineer – Modern" autofocus class="input-field" />
        </div>
        <div class="flex justify-end gap-2">
          <button @click="saveDialogOpen = false" class="h-9 px-4 rounded-lg text-sm border border-border text-muted-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Cancel</button>
          <button
            @click="handleSaveVersion"
            :disabled="!saveName.trim()"
            class="h-9 px-5 rounded-lg text-sm font-medium disabled:opacity-50 bg-primary text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >Save CV</button>
        </div>
      </div>
    </div>
  </div>

  <!-- LANDING -->
  <div v-else class="p-6 max-w-4xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold font-display text-foreground">My CV</h1>
      <p class="text-sm mt-1 text-muted-foreground">Build, upload, and export your CV in three professional templates.</p>
    </div>

    <!-- Entry cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        @click="cvFileInput?.click()"
        class="group rounded-xl border-2 border-dashed border-border bg-card p-6 text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div class="h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-primary/10 border border-primary/20">
          <span class="mdi mdi-upload text-xl text-primary" />
        </div>
        <p class="text-sm font-semibold text-foreground">Upload Existing CV</p>
        <p class="text-xs mt-1 text-muted-foreground">Upload a PDF or Word file. We'll extract your info and fill the editor automatically.</p>
      </button>

      <button
        @click="startCreate"
        class="group rounded-xl border-2 border-dashed border-border bg-card p-6 text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div class="h-10 w-10 rounded-xl flex items-center justify-center mb-3 bg-secondary border border-border">
          <span class="mdi mdi-plus text-xl text-muted-foreground" />
        </div>
        <p class="text-sm font-semibold text-foreground">Create from Scratch</p>
        <p class="text-xs mt-1 text-muted-foreground">Use our multi-step wizard to build a professional CV with live preview.</p>
      </button>
    </div>
    <input ref="cvFileInput" type="file" accept=".pdf,.doc,.docx,.txt" class="hidden" @change="onCvFileSelect" />

    <!-- Saved CVs -->
    <div v-if="cvVersions.length > 0" class="space-y-3">
      <h2 class="text-sm font-semibold text-foreground">Saved CVs</h2>
      <div
        v-for="v in cvVersions"
        :key="v.id"
        class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card transition-colors"
      >
        <span class="mdi mdi-file-document-outline text-lg shrink-0 text-primary" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-medium text-foreground">{{ v.name }}</p>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{{ v.style }}</span>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full"
              :class="v.language === 'DE' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'"
            >{{ v.language }}</span>
          </div>
          <p class="text-xs mt-0.5 text-muted-foreground">{{ formatDate(v.createdAt) }}</p>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click="openCvVersion(v)" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span class="mdi mdi-pencil-outline text-sm text-muted-foreground" />
          </button>
          <button @click="deleteCvVersion(v.id)" class="h-7 w-7 rounded flex items-center justify-center hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive">
            <span class="mdi mdi-trash-can-outline text-sm text-destructive" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import StepIndicator from '../../components/StepIndicator.vue';
import TemplateMiniPreview from '../../components/TemplateMiniPreview.vue';

// ── Types ────────────────────────────────────────────────────────────────────
type CvStyle = 'modern' | 'classic' | 'minimal';
type Language = 'EN' | 'DE';
type Step = 'landing' | 'extracting' | 'template' | 'language' | 'editor';
type CvSectionKey = 'summary' | 'experience' | 'education' | 'skills' | `custom:${string}`;

interface ExpItem { id: string; company: string; role: string; period: string; description: string; }
interface EduItem { id: string; institution: string; degree: string; period: string; details: string; }
interface CustomSection { id: string; heading: string; text: string; }
interface EditorData {
  versionName: string; style: CvStyle; language: Language;
  photoDataUrl: string;
  sectionOrder: CvSectionKey[];
  customSections: CustomSection[];
  fullName: string; email: string; phone: string; location: string; nationality: string; linkedin: string; website: string; github: string; portfolio: string;
  signaturePlaceDate: string; signatureDataUrl: string;
  summary: string; experience: ExpItem[]; education: EduItem[]; skills: string;
}
interface CvVersion { id: string; name: string; label: string; content: string; createdAt: string; style: CvStyle; language: Language; }

// ── Constants ─────────────────────────────────────────────────────────────────
const EXTRACT_STEPS = [
  'Reading document…',
  'Extracting text from PDF…',
  'Identifying personal information…',
  'Reading professional summary…',
  'Parsing work experience…',
  'Analysing job responsibilities…',
  'Parsing education history…',
  'Extracting certifications…',
  'Identifying technical skills…',
  'Parsing language proficiencies…',
  'Detecting leadership roles…',
  'Extracting interests & hobbies…',
  'Validating extracted data…',
  'Building CV structure…',
  'Finalising CV data…',
];

const EXTRACT_TIPS = [
  'Tip: A well-structured CV increases your chances by 40%.',
  'Tip: Keep your CV to 2 pages max for best results.',
  'Did you know? Recruiters spend an average of 7 seconds on a CV.',
  'Tip: Quantify achievements — numbers stand out to recruiters.',
  'Tip: Tailor your CV to each job for the best match.',
  'Tip: Use action verbs like "led", "designed", "achieved".',
  'Fun fact: The word "résumé" comes from French, meaning "summary".',
  'Tip: Always include your LinkedIn profile on your CV.',
  'Tip: ATS systems scan for keywords — match the job description.',
];

const TEMPLATES = [
  { style: 'modern' as CvStyle, label: 'Modern', desc: 'Clean with blue accents' },
  { style: 'classic' as CvStyle, label: 'Classic', desc: 'Elegant serif style' },
  { style: 'minimal' as CvStyle, label: 'Minimal', desc: 'Understated & spacious' },
];

const PREDEFINED_SECTIONS = [
  'Courses & Certifications', 'Projects', 'Publications', 'Presentations & Talks',
  'Thesis & Research', 'Awards & Honours', 'Volunteer Work', 'Languages', 'References',
];

// ── CSS for CV styles ─────────────────────────────────────────────────────────
const CSS: Record<CvStyle, string> = {
  modern: `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:40px 48px}h1{font-size:2rem;font-weight:700;margin:0 0 4px;color:#0f172a}h2{font-size:.9rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:4px;margin:20px 0 8px}p,li{font-size:.88rem;line-height:1.65;color:#334155;margin:3px 0}ul{padding-left:18px}strong{color:#0f172a}.contact{font-size:.82rem;color:#64748b;margin:4px 0 20px}`,
  classic: `body{font-family:Georgia,serif;color:#1a1a1a;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:48px 56px}h1{font-size:1.9rem;font-weight:700;margin:0 0 4px;border-bottom:3px double #1a1a1a;padding-bottom:8px}h2{font-size:.9rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:20px 0 6px;color:#1a1a1a}p,li{font-size:.9rem;line-height:1.7;color:#2d2d2d;margin:3px 0}ul{padding-left:20px}.contact{font-size:.82rem;color:#555;margin:4px 0 20px}`,
  minimal: `body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#222;margin:0;padding:0}.w{max-width:760px;margin:0 auto;padding:44px 52px}h1{font-size:1.8rem;font-weight:300;letter-spacing:.04em;margin:0 0 4px}h2{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#888;margin:24px 0 6px}p,li{font-size:.87rem;line-height:1.6;color:#444;margin:3px 0}ul{padding-left:16px}hr{border:none;border-top:1px solid #e5e5e5;margin:12px 0}.contact{font-size:.8rem;color:#888;margin:4px 0 20px}`,
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  EN: { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills' },
  DE: { summary: 'Profil', experience: 'Berufserfahrung', education: 'Ausbildung', skills: 'Kenntnisse' },
};

function escapeHtml(s: string) {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function isHtml(s: string) { return /<[a-z][\s\S]*>/i.test(s); }

function editorToHtml(d: EditorData): string {
  const t = SECTION_LABELS[d.language] ?? SECTION_LABELS.EN;
  const contact = [d.email, d.phone, d.location, d.nationality ? `Nationality: ${d.nationality}` : '', d.linkedin, d.website, d.github, d.portfolio].filter(Boolean).join(' · ');
  const photo = d.photoDataUrl?.trim()
    ? `<img data-role="profile-photo" src="${d.photoDataUrl.trim()}" alt="Profile photo" style="width:96px;height:96px;border-radius:4px;object-fit:cover;border:2px solid rgba(148,163,184,.5)" />`
    : '';
  const header = photo
    ? `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px"><div style="flex:1;min-width:0"><h1>${escapeHtml(d.fullName || 'Your Name')}</h1>${contact ? `<p class="contact">${escapeHtml(contact)}</p>` : ''}</div><div style="flex:0 0 auto;margin-top:4px">${photo}</div></div>`
    : `<h1>${escapeHtml(d.fullName || 'Your Name')}</h1>${contact ? `<p class="contact">${escapeHtml(contact)}</p>` : ''}`;

  const exp = d.experience.filter(e => e.company || e.role).map(e => {
    const lines = e.description.split('\n').map(l => l.trim()).filter(Boolean);
    const desc = lines.length > 1
      ? `<ul style="margin:4px 0;padding-left:18px">${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
      : lines[0] ? `<p style="margin:4px 0">${escapeHtml(lines[0])}</p>` : '';
    return `<div style="margin-bottom:10px"><strong>${e.role || ''}${e.company ? ` — ${e.company}` : ''}</strong>${e.period ? `<br><span style="font-size:.8em;opacity:.7">${e.period}</span>` : ''}${desc}</div>`;
  }).join('');

  const edu = d.education.filter(e => e.institution || e.degree).map(e => {
    const detailLines = (e.details ?? '').split('\n').map(l => l.trim()).filter(Boolean);
    const detailHtml = detailLines.length ? `<ul style="margin:4px 0;padding-left:18px">${detailLines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>` : '';
    return `<div style="margin-bottom:8px"><strong>${e.degree || ''}${e.institution ? ` — ${e.institution}` : ''}</strong>${e.period ? `<br><span style="font-size:.8em;opacity:.7">${e.period}</span>` : ''}${detailHtml}</div>`;
  }).join('');

  const skills = d.skills.trim()
    ? `<p>${d.skills.split(/[,\n]/).map(s => s.trim()).filter(Boolean).map(s => escapeHtml(s)).join(', ')}</p>`
    : '';

  const sections: Record<string, string> = {
    summary: `<section data-cv-section="summary">${d.summary ? `<h2>${t.summary}</h2>${isHtml(d.summary) ? d.summary : `<p>${d.summary.replace(/\n/g,'<br>')}</p>`}` : ''}</section>`,
    experience: `<section data-cv-section="experience">${exp ? `<h2>${t.experience}</h2>${exp}` : ''}</section>`,
    education: `<section data-cv-section="education">${edu ? `<h2>${t.education}</h2>${edu}` : ''}</section>`,
    skills: `<section data-cv-section="skills">${skills ? `<h2>${t.skills}</h2>${skills}` : ''}</section>`,
  };

  for (const cs of d.customSections ?? []) {
    const key = `custom:${cs.id}`;
    const heading = escapeHtml(cs.heading?.trim() || 'Section');
    const rawText = cs.text ?? '';
    const renderedText = rawText.trim() ? (isHtml(rawText) ? rawText : `<p>${escapeHtml(rawText).replace(/\n/g,'<br>')}</p>`) : '';
    sections[key] = `<section data-cv-section="${key}"><h2>${heading}</h2>${renderedText}</section>`;
  }

  const order = (d.sectionOrder?.length ? d.sectionOrder : ['summary','experience','education','skills']).filter(k => k in sections);
  const rendered = order.map(k => sections[k]).join('');

  const sigImg = d.signatureDataUrl?.trim()
    ? `<img data-role="signature-image" src="${d.signatureDataUrl.trim()}" alt="Signature" style="height:48px;object-fit:contain;margin:8px 0 4px" />`
    : '';
  const signatureBlock = (d.signaturePlaceDate || d.signatureDataUrl)
    ? `<div data-role="signature-block" style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(148,163,184,.3)">${sigImg}<p style="font-size:.82rem;color:#334155;margin:0 0 4px">${escapeHtml(d.fullName || '')}</p>${d.signaturePlaceDate ? `<p style="font-size:.8rem;color:#64748b;margin:0">${escapeHtml(d.signaturePlaceDate)}</p>` : ''}</div>`
    : '';

  return `${header}${rendered}${signatureBlock}`;
}

function buildHtml(content: string, style: CvStyle) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}${CSS[style]}</style></head><body><div class="w">${content}</div></body></html>`;
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return iso; }
}

const route = useRoute();

// ── State ─────────────────────────────────────────────────────────────────────
const step = ref<Step>('landing');
const extractStep = ref(0);
const extractError = ref('');
const currentTip = ref('');
const isSyncing = ref(false);
const isExporting = ref(false);
const addSectionOpen = ref(false);
const saveDialogOpen = ref(false);
const saveName = ref('');
const editingVersionId = ref<string | null>(null);
const dragKey = ref<string>('');

const cvVersions = ref<CvVersion[]>([]);

const emptyEditor = (): EditorData => ({
  versionName: 'My CV', style: 'modern', language: 'EN',
  photoDataUrl: '',
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  customSections: [],
  fullName: '', email: '', phone: '', location: '', nationality: '', linkedin: '', website: '', github: '', portfolio: '',
  signaturePlaceDate: '', signatureDataUrl: '',
  summary: '', experience: [], education: [], skills: '',
});

const editorData = reactive<EditorData>(emptyEditor());

// ── Template refs ─────────────────────────────────────────────────────────────
const previewIframe = ref<HTMLIFrameElement | null>(null);
const cvFileInput = ref<HTMLInputElement | null>(null);
const photoTemplateInput = ref<HTMLInputElement | null>(null);
const photoEditorInput = ref<HTMLInputElement | null>(null);
const signatureInput = ref<HTMLInputElement | null>(null);

// ── Live preview update ───────────────────────────────────────────────────────
const previewHtml = computed(() => buildHtml(editorToHtml(editorData), editorData.style));

watch(previewHtml, async (html) => {
  if (step.value !== 'editor') return;
  await nextTick();
  if (!previewIframe.value) return;
  const doc = previewIframe.value.contentDocument;
  if (doc) { doc.open(); doc.write(html); doc.close(); }
});

watch(step, async (s) => {
  if (s !== 'editor') return;
  await nextTick();
  if (!previewIframe.value) return;
  const doc = previewIframe.value.contentDocument;
  if (doc) { doc.open(); doc.write(previewHtml.value); doc.close(); }
});

// ── Experience / Education helpers ────────────────────────────────────────────
function addExp() {
  editorData.experience.push({ id: `exp_${Date.now()}`, company: '', role: '', period: '', description: '' });
}
function removeExp(i: number) { editorData.experience.splice(i, 1); }
function addEdu() {
  editorData.education.push({ id: `edu_${Date.now()}`, institution: '', degree: '', period: '', details: '' });
}
function removeEdu(i: number) { editorData.education.splice(i, 1); }

// ── Custom sections ───────────────────────────────────────────────────────────
function getCustomSection(sectionKey: string) {
  const id = sectionKey.slice('custom:'.length);
  return editorData.customSections.find(x => x.id === id);
}
function updateCustomSection(sectionKey: string, field: 'heading' | 'text', value: string) {
  const id = sectionKey.slice('custom:'.length);
  const cs = editorData.customSections.find(x => x.id === id);
  if (cs) cs[field] = value;
}
function removeCustomSection(sectionKey: string) {
  const id = sectionKey.slice('custom:'.length);
  editorData.sectionOrder = editorData.sectionOrder.filter(k => k !== sectionKey) as CvSectionKey[];
  editorData.customSections = editorData.customSections.filter(x => x.id !== id);
}
function addCustomSection(heading: string) {
  const id = `sec_${Date.now()}`;
  const key = `custom:${id}` as CvSectionKey;
  editorData.customSections.push({ id, heading, text: '' });
  editorData.sectionOrder.push(key);
  addSectionOpen.value = false;
}

// ── Drag & drop section reorder ───────────────────────────────────────────────
function dragStart(key: string) { dragKey.value = key; }
function dragDrop(toKey: string) {
  const from = dragKey.value;
  if (!from || from === toKey) return;
  const order = [...editorData.sectionOrder];
  const fromIdx = order.indexOf(from as CvSectionKey);
  const toIdx = order.indexOf(toKey as CvSectionKey);
  if (fromIdx < 0 || toIdx < 0) return;
  const [picked] = order.splice(fromIdx, 1);
  order.splice(toIdx, 0, picked);
  editorData.sectionOrder = order;
}

// ── Photo ─────────────────────────────────────────────────────────────────────
function onPhotoSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  (e.target as HTMLInputElement).value = '';
  const blobUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const max = 320;
    const ratio = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
    const w = Math.round((img.width || 1) * ratio);
    const h = Math.round((img.height || 1) * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    editorData.photoDataUrl = canvas.toDataURL('image/jpeg', 0.86);
    URL.revokeObjectURL(blobUrl);
  };
  img.src = blobUrl;
}

// ── Signature ────────────────────────────────────────────────────────────────
function onSignatureSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  (e.target as HTMLInputElement).value = '';
  const blobUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const maxW = 280;
    const maxH = 100;
    const ratio = Math.min(1, maxW / (img.width || 1), maxH / (img.height || 1));
    const w = Math.round((img.width || 1) * ratio);
    const h = Math.round((img.height || 1) * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    editorData.signatureDataUrl = canvas.toDataURL('image/png');
    URL.revokeObjectURL(blobUrl);
  };
  img.src = blobUrl;
}

// ── CV file upload ────────────────────────────────────────────────────────────
async function onCvFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  (e.target as HTMLInputElement).value = '';

  Object.assign(editorData, emptyEditor());
  step.value = 'extracting';
  extractStep.value = 0;
  extractError.value = '';

  // Start the progress animation — slow enough to cover the full API wait
  let s = 0;
  const interval = setInterval(() => {
    if (s < EXTRACT_STEPS.length - 2) {
      s++;
      extractStep.value = s;
    }
  }, 2000);

  // Rotate tips
  currentTip.value = EXTRACT_TIPS[Math.floor(Math.random() * EXTRACT_TIPS.length)];
  const tipInterval = setInterval(() => {
    currentTip.value = EXTRACT_TIPS[Math.floor(Math.random() * EXTRACT_TIPS.length)];
  }, 5000);

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^.]+$/, '') || 'My CV');

    const { data } = await axios.post('/api/cvs', formData);
    const cv = data.data;
    const parsed = cv?.parsedData;
    // Track the backend CV id so subsequent saves update the same record
    if (cv?.id) {
      editingVersionId.value = cv.id;
      cvVersions.value.push({
        id: cv.id,
        name: cv.title,
        label: cv.title,
        content: cv.htmlContent || '',
        createdAt: cv.createdAt,
        style: cv.style || 'modern',
        language: cv.language || 'EN',
      });
    }

    // Complete the progress animation
    clearInterval(interval); clearInterval(tipInterval);
    extractStep.value = EXTRACT_STEPS.length - 1;

    if (parsed) {
      const p = parsed.personal || parsed;
      const customSections: CustomSection[] = [];
      const sectionOrder: CvSectionKey[] = ['summary', 'experience', 'education', 'skills'];

      // Certifications → custom section
      if (parsed.certifications?.length) {
        const id = `sec_certs_${Date.now()}`;
        customSections.push({
          id,
          heading: 'Certifications',
          text: parsed.certifications.map((c: any) =>
            [c.name, c.institution, c.dates, c.details].filter(Boolean).join(' — ')
          ).join('\n'),
        });
        sectionOrder.push(`custom:${id}` as CvSectionKey);
      }

      // Languages → custom section
      if (parsed.languages?.length) {
        const id = `sec_langs_${Date.now()}`;
        customSections.push({
          id,
          heading: 'Languages',
          text: parsed.languages.map((l: any) =>
            l.level ? `${l.language} (${l.level})` : l.language
          ).join(', '),
        });
        sectionOrder.push(`custom:${id}` as CvSectionKey);
      }

      // Leadership → custom section
      if (parsed.leadership?.length) {
        const id = `sec_lead_${Date.now()}`;
        customSections.push({
          id,
          heading: 'Leadership',
          text: parsed.leadership.map((l: any) =>
            [l.title, l.organization, l.dates, l.description].filter(Boolean).join(' — ')
          ).join('\n'),
        });
        sectionOrder.push(`custom:${id}` as CvSectionKey);
      }

      // Interests → custom section
      if (parsed.interests) {
        const id = `sec_int_${Date.now()}`;
        customSections.push({ id, heading: 'Interests', text: parsed.interests });
        sectionOrder.push(`custom:${id}` as CvSectionKey);
      }

      // Additional info → custom section
      if (parsed.additional_information) {
        const id = `sec_add_${Date.now()}`;
        customSections.push({ id, heading: 'Additional Information', text: parsed.additional_information });
        sectionOrder.push(`custom:${id}` as CvSectionKey);
      }

      Object.assign(editorData, {
        ...emptyEditor(),
        sectionOrder,
        customSections,
        photoDataUrl: parsed.photoDataUrl || '',
        fullName: p.name || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        nationality: p.nationality || '',
        linkedin: p.linkedin || '',
        website: p.website || '',
        github: p.github || '',
        portfolio: p.portfolio || '',
        summary: parsed.summary || '',
        skills: Array.isArray(parsed.skills) ? parsed.skills.join(', ') : (parsed.skills || ''),
        experience: (parsed.experience || []).map((exp: any) => ({
          id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          company: exp.company || '',
          role: exp.title || '',
          period: exp.dates || '',
          description: exp.description || '',
        })),
        education: (parsed.education || []).map((edu: any) => ({
          id: `edu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          period: edu.dates || '',
          details: [edu.gpa ? `GPA: ${edu.gpa}` : '', edu.courses ? `Courses: ${edu.courses}` : '', edu.awards ? `Awards: ${edu.awards}` : '', edu.details || ''].filter(Boolean).join('\n'),
        })),
      });
    }

    await new Promise(r => setTimeout(r, 500));
    step.value = 'template';
  } catch (err: any) {
    clearInterval(interval); clearInterval(tipInterval);
    const msg = err?.response?.data?.error || err?.message || 'Unknown error';
    console.error('CV upload/parse failed:', msg);
    extractError.value = msg;
    extractStep.value = EXTRACT_STEPS.length - 1;
  }
}

// ── Export PDF ────────────────────────────────────────────────────────────────
async function handleExportPdf() {
  isExporting.value = true;
  try {
    const contentHtml = editorToHtml(editorData);
    const filename = `${(editorData.fullName || 'CV').replace(/[^a-z0-9_\- ]+/gi, '_')}.pdf`;

    const response = await axios.post('/api/cvs/export', {
      contentHtml,
      style: editorData.style,
      filename,
    }, { responseType: 'blob' });

    // Download the blob
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    isExporting.value = false;
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function startCreate() {
  Object.assign(editorData, emptyEditor());
  editingVersionId.value = null;
  step.value = 'template';
}

async function handleSaveVersion() {
  const name = saveName.value.trim() || editorData.versionName || 'My CV';
  const content = editorToHtml(editorData);
  const editorState = { ...editorData };

  try {
    if (editingVersionId.value) {
      await axios.put(`/api/cvs/${editingVersionId.value}`, {
        title: name,
        editorData: editorState,
        htmlContent: content,
        style: editorData.style,
        language: editorData.language,
      });
      const v = cvVersions.value.find(v => v.id === editingVersionId.value);
      if (v) { v.name = name; v.label = name; v.content = content; v.style = editorData.style; v.language = editorData.language; }
    } else {
      const { data } = await axios.post('/api/cvs/create', {
        title: name,
        editorData: editorState,
        htmlContent: content,
        style: editorData.style,
        language: editorData.language,
      });
      const cv = data.data;
      editingVersionId.value = cv.id;
      cvVersions.value.push({
        id: cv.id,
        name, label: name, content,
        createdAt: cv.createdAt,
        style: editorData.style,
        language: editorData.language,
      });
    }
  } catch (err) {
    console.error('Failed to save CV:', err);
  }

  saveDialogOpen.value = false;
  saveName.value = '';
  step.value = 'landing';
}

async function openCvVersion(v: CvVersion) {
  try {
    const { data } = await axios.get(`/api/cvs/${v.id}`);
    const cv = data.data;
    if (cv.editorData) {
      Object.assign(editorData, {
        ...emptyEditor(),
        ...cv.editorData,
        versionName: cv.title,
      });
    } else {
      Object.assign(editorData, {
        ...emptyEditor(),
        versionName: cv.title,
        style: cv.style || v.style || 'modern',
        language: cv.language || v.language || 'EN',
      });
    }
    editingVersionId.value = v.id;
    step.value = 'editor';
  } catch (err) {
    console.error('Failed to load CV:', err);
  }
}

async function deleteCvVersion(id: string) {
  try {
    await axios.delete(`/api/cvs/${id}`);
    cvVersions.value = cvVersions.value.filter(v => v.id !== id);
  } catch (err) {
    console.error('Failed to delete CV:', err);
  }
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/cvs');
    cvVersions.value = (data.data || []).map((cv: any) => ({
      id: cv.id,
      name: cv.title,
      label: cv.title,
      content: cv.htmlContent || '',
      createdAt: cv.createdAt,
      style: cv.style || 'modern',
      language: cv.language || 'EN',
    }));
  } catch (err) {
    console.error('Failed to load CVs:', err);
  }

  // Open a specific CV if ?edit=ID is in the URL
  const editId = route.query.edit as string | undefined;
  if (editId) {
    const v = cvVersions.value.find(v => v.id === editId);
    if (v) await openCvVersion(v);
  }
});
</script>
