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
          @click="editorData.displayLanguage = lang as 'EN'|'DE'"
          class="rounded-xl border-2 p-6 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="editorData.displayLanguage === lang ? 'border-primary bg-primary/5' : 'border-border'"
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
  <div v-else-if="step === 'editor'" :class="['flex', isEmployeeMode ? 'h-[calc(100vh-220px)] min-h-[640px]' : 'h-[calc(100vh-48px)]']">
    <!-- Left: form -->
    <div class="flex flex-col border-r border-border shrink-0 w-full md:w-[480px] bg-[hsl(196,89%,10%)]">
      <!-- Toolbar -->
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-border shrink-0">
        <button @click="step = 'landing'" class="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span class="mdi mdi-arrow-left text-sm" />Back
        </button>
        <button
          v-if="isEmployeeMode && editingVersionId"
          @click="enhanceWithArbeitly"
          :disabled="enhancing"
          class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span class="mdi text-sm" :class="enhancing ? 'mdi-loading mdi-spin' : 'mdi-creation'" />
          {{ enhancing ? 'Enhancing…' : 'Enhance with Arbeitly' }}
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
            @click="editorData.displayLanguage = lang as 'EN'|'DE'"
            class="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="editorData.displayLanguage === lang ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'"
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

        <!-- Design controls -->
        <div class="glass rounded-xl p-4 space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-muted-foreground">Design</p>
            <button
              @click="resetDesign"
              class="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              title="Reset to template defaults"
            >Reset</button>
          </div>

          <!-- Font size -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-foreground/80">Font size</label>
              <span class="text-[10px] tabular-nums text-muted-foreground">{{ (editorData.bodyPt ?? DEFAULT_BODY_PT).toFixed(1) }}pt</span>
            </div>
            <input
              type="range"
              min="6"
              max="12"
              step="0.5"
              :value="editorData.bodyPt ?? DEFAULT_BODY_PT"
              @input="editorData.bodyPt = parseFloat(($event.target as HTMLInputElement).value)"
              class="w-full accent-primary"
            />
          </div>

          <!-- Line height -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-foreground/80">Line spacing</label>
              <span class="text-[10px] tabular-nums text-muted-foreground">{{ (editorData.lineHeight ?? DEFAULT_LINE_HEIGHT).toFixed(2) }}</span>
            </div>
            <input
              type="range"
              min="1"
              max="2"
              step="0.05"
              :value="editorData.lineHeight ?? DEFAULT_LINE_HEIGHT"
              @input="editorData.lineHeight = parseFloat(($event.target as HTMLInputElement).value)"
              class="w-full accent-primary"
            />
          </div>

          <!-- Margin -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-foreground/80">Page margin</label>
              <span class="text-[10px] tabular-nums text-muted-foreground">{{ editorData.marginMm ?? DEFAULT_MARGIN_MM }}mm</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              :value="editorData.marginMm ?? DEFAULT_MARGIN_MM"
              @input="editorData.marginMm = parseInt(($event.target as HTMLInputElement).value, 10)"
              class="w-full accent-primary"
            />
          </div>

          <!-- Theme color -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-foreground/80">Theme color</label>
              <span class="text-[10px] tabular-nums text-muted-foreground">{{ editorData.themeColor ?? DEFAULT_THEME_COLORS[editorData.style] }}</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="editorData.themeColor ?? DEFAULT_THEME_COLORS[editorData.style]"
                @input="editorData.themeColor = ($event.target as HTMLInputElement).value"
                class="h-7 w-10 rounded border border-border bg-transparent cursor-pointer"
              />
              <div class="flex items-center gap-1">
                <button
                  v-for="c in PRESET_THEME_COLORS"
                  :key="c"
                  @click="editorData.themeColor = c"
                  :style="`background:${c}`"
                  class="h-5 w-5 rounded-full border border-white/20 hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  :title="c"
                />
              </div>
            </div>
          </div>
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

          <div>
            <label class="text-xs block mb-1 text-foreground">Full Name</label>
            <input v-model="editorData.fullName" placeholder="Anna Müller" class="input-field" />
          </div>
          <p class="text-[10px] text-muted-foreground mt-2 mb-1">Drag to reorder contact fields in the CV header</p>
          <div class="space-y-1.5">
            <div
              v-for="cKey in editorData.contactOrder"
              :key="cKey"
              :class="['flex items-center gap-2 transition-all duration-150', contactDragOverKey === cKey && contactDragKey !== cKey ? 'ring-1 ring-primary/40 rounded-lg' : '', contactDragKey === cKey ? 'opacity-50' : '']"
              draggable="true"
              @dragstart="contactDragStart(cKey, $event)"
              @dragover="contactDragOver(cKey, $event)"
              @dragleave="contactDragLeave"
              @dragend="contactDragEnd"
              @drop="contactDragDrop(cKey)"
            >
              <span class="mdi mdi-drag-vertical text-sm shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
              <label class="text-xs w-20 shrink-0 text-foreground">{{ CONTACT_FIELDS[cKey]?.label }}</label>
              <input
                v-model="(editorData as any)[CONTACT_FIELDS[cKey]?.model]"
                :placeholder="CONTACT_FIELDS[cKey]?.placeholder"
                class="input-field flex-1"
              />
            </div>
          </div>
        </div>

        <!-- Sections (draggable order) -->
        <template v-for="sectionKey in editorData.sectionOrder" :key="sectionKey">
          <!-- Summary -->
          <div
            v-if="sectionKey === 'summary'"
            :class="['glass rounded-xl p-4 space-y-2 cursor-move transition-all duration-150', dragOverKey === sectionKey && dragKey !== sectionKey ? 'ring-2 ring-primary/40 scale-[1.01]' : '', dragKey === sectionKey ? 'opacity-50' : '']"
            draggable="true"
            @dragstart="dragStart(sectionKey, $event)"
            @dragover="dragOver(sectionKey, $event)"
            @dragleave="dragLeave"
            @dragend="dragEnd"
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center gap-2">
              <span class="mdi mdi-drag-vertical text-base shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
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
            :class="['glass rounded-xl p-4 space-y-3 cursor-move transition-all duration-150', dragOverKey === sectionKey && dragKey !== sectionKey ? 'ring-2 ring-primary/40 scale-[1.01]' : '', dragKey === sectionKey ? 'opacity-50' : '']"
            draggable="true"
            @dragstart="dragStart(sectionKey, $event)"
            @dragover="dragOver(sectionKey, $event)"
            @dragleave="dragLeave"
            @dragend="dragEnd"
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-base shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
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
            :class="['glass rounded-xl p-4 space-y-3 cursor-move transition-all duration-150', dragOverKey === sectionKey && dragKey !== sectionKey ? 'ring-2 ring-primary/40 scale-[1.01]' : '', dragKey === sectionKey ? 'opacity-50' : '']"
            draggable="true"
            @dragstart="dragStart(sectionKey, $event)"
            @dragover="dragOver(sectionKey, $event)"
            @dragleave="dragLeave"
            @dragend="dragEnd"
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-base shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
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
            :class="['rounded-xl border border-border p-4 space-y-2 cursor-move transition-all duration-150', dragOverKey === sectionKey && dragKey !== sectionKey ? 'ring-2 ring-primary/40 scale-[1.01]' : '', dragKey === sectionKey ? 'opacity-50' : '']"
            draggable="true"
            @dragstart="dragStart(sectionKey, $event)"
            @dragover="dragOver(sectionKey, $event)"
            @dragleave="dragLeave"
            @dragend="dragEnd"
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center gap-2">
              <span class="mdi mdi-drag-vertical text-base shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
              <p class="text-xs font-semibold text-muted-foreground">Skills</p>
            </div>
            <div>
              <label class="text-[10px] text-muted-foreground mb-1 block">Target role</label>
              <RolePicker v-model="editorData.roleId" :roles="taxonomyRoles" />
            </div>
            <div>
              <label class="text-[10px] text-muted-foreground mb-1 block">Tagged skills</label>
              <TagPicker v-model="editorData.skillIds" :options="taxonomySkills" placeholder="Add skills..." />
            </div>
            <textarea
              v-model="editorData.skills"
              placeholder="React, TypeScript, Node.js, SQL, Agile..."
              rows="3"
              class="input-field resize-none"
            />
            <p class="text-[10px] text-muted-foreground">Free-text fallback (comma or newline separated)</p>
          </div>

          <!-- Custom section -->
          <div
            v-else-if="sectionKey.startsWith('custom:')"
            :class="['glass rounded-xl p-4 space-y-3 cursor-move transition-all duration-150', dragOverKey === sectionKey && dragKey !== sectionKey ? 'ring-2 ring-primary/40 scale-[1.01]' : '', dragKey === sectionKey ? 'opacity-50' : '']"
            draggable="true"
            @dragstart="dragStart(sectionKey, $event)"
            @dragover="dragOver(sectionKey, $event)"
            @dragleave="dragLeave"
            @dragend="dragEnd"
            @drop="dragDrop(sectionKey)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-drag-vertical text-base shrink-0 text-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing" />
                <p class="text-xs font-semibold text-muted-foreground">{{ getCustomSection(sectionKey)?.heading || 'Custom section' }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button @click="addCustomEntry(sectionKey)" class="flex items-center gap-1 h-7 px-3 rounded-lg text-xs border border-border text-foreground hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span class="mdi mdi-plus text-xs" />Add
                </button>
                <button @click="removeCustomSection(sectionKey)" class="h-7 px-3 rounded-lg text-xs text-destructive hover:bg-destructive/10">Remove</button>
              </div>
            </div>
            <div>
              <label class="text-xs block mb-1 text-foreground">Section Heading</label>
              <input
                :value="getCustomSection(sectionKey)?.heading || ''"
                @input="updateCustomSection(sectionKey, 'heading', ($event.target as HTMLInputElement).value)"
                placeholder="e.g. Certifications, Projects, Awards"
                class="input-field"
              />
            </div>
            <!-- Entry-based content -->
            <template v-if="getCustomSection(sectionKey)?.entries?.length">
              <div v-for="(entry, ei) in getCustomSection(sectionKey)!.entries" :key="entry.id" class="rounded-lg p-3 space-y-2 border border-white/5 bg-white/[0.02]">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-muted-foreground">Entry {{ ei + 1 }}</span>
                  <button @click="removeCustomEntry(sectionKey, ei)" class="h-6 w-6 rounded flex items-center justify-center hover:bg-white/5">
                    <span class="mdi mdi-trash-can-outline text-xs text-destructive" />
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="entry.title" placeholder="Title / Name" class="input-field input-field-sm" />
                  <input v-model="entry.subtitle" placeholder="Organization / Location" class="input-field input-field-sm" />
                  <input v-model="entry.period" placeholder="Period (e.g. Jan 2022 – Present)" class="input-field input-field-sm col-span-2" />
                </div>
                <textarea v-model="entry.description" placeholder="Details (use new lines for bullets, **bold** for emphasis)..." rows="3" class="input-field resize-none" />
              </div>
            </template>
            <!-- Fallback: old text blob (if no entries but has text) -->
            <div v-else-if="getCustomSection(sectionKey)?.text">
              <label class="text-xs block mb-1 text-foreground">Text</label>
              <textarea
                :value="getCustomSection(sectionKey)?.text || ''"
                @input="updateCustomSection(sectionKey, 'text', ($event.target as HTMLTextAreaElement).value)"
                placeholder="Write something..."
                rows="4"
                class="input-field resize-none"
              />
            </div>
            <!-- Empty state -->
            <p v-else class="text-xs italic text-muted-foreground">No entries yet. Click Add to start.</p>
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
          @click="openSaveDialog"
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
        <span
          class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tabular-nums"
          :class="pageCount > 2 ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'"
          :title="pageCount > 2 ? 'CV exceeds 2 pages — consider reducing font/margin' : ''"
        >
          <span class="mdi mdi-file-document-outline text-xs" />
          Page {{ currentPage }} / {{ pageCount }}
        </span>
        <span class="ml-auto text-[10px] text-white/30">Updates as you type</span>
      </div>
      <div class="flex-1 overflow-hidden p-4 relative">
        <iframe
          ref="previewIframe"
          class="w-full h-full rounded-lg shadow-lg border border-white/5 bg-white"
          title="CV Preview"
        />
      </div>
    </div>

    <!-- Save dialog -->
    <SaveAsDialog
      v-model="saveDialogOpen"
      kind="cv"
      :versions="topLevelVersions"
      :initial-name="saveDialogInitialName"
      :initial-mode="saveDialogInitialMode"
      :initial-parent-id="saveDialogInitialParentId"
      @save="onSaveAs"
    />
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
              :class="v.displayLanguage === 'DE' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'"
            >{{ v.displayLanguage }}</span>
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
import api from '../../services/api';
import { useEmployeeStore } from '../../stores/employee';
import StepIndicator from '../../components/StepIndicator.vue';
import TemplateMiniPreview from '../../components/TemplateMiniPreview.vue';
import SaveAsDialog from '../../components/SaveAsDialog.vue';
import RolePicker from '../../components/RolePicker.vue';
import TagPicker from '../../components/TagPicker.vue';
import { useTaxonomy } from '../../composables/useTaxonomy';

const { roles: taxonomyRoles, skills: taxonomySkills, load: loadTaxonomy } = useTaxonomy();
loadTaxonomy();

const props = defineProps<{ candidateId?: string }>();
const employeeStore = useEmployeeStore();
const isEmployeeMode = computed(() => !!props.candidateId);
const apiBase = computed(() => isEmployeeMode.value ? `/employee/candidates/${props.candidateId}/cv-builder` : '/cvs');
const apiHeaders = computed(() => isEmployeeMode.value ? employeeStore.getAuthHeaders() : {});

// ── Types ────────────────────────────────────────────────────────────────────
type CvStyle = 'modern' | 'classic' | 'minimal';
type Language = 'EN' | 'DE';
type Step = 'landing' | 'extracting' | 'template' | 'language' | 'editor';
type CvSectionKey = 'summary' | 'experience' | 'education' | 'skills' | `custom:${string}`;

interface ExpItem { id: string; company: string; role: string; period: string; description: string; }
interface EduItem { id: string; institution: string; degree: string; period: string; details: string; }
interface CustomSectionEntry { id: string; title: string; subtitle: string; period: string; description: string; }
interface CustomSection { id: string; heading: string; text: string; entries: CustomSectionEntry[]; }
interface EditorData {
  versionName: string; style: CvStyle; displayLanguage: Language;
  photoDataUrl: string;
  sectionOrder: CvSectionKey[];
  customSections: CustomSection[];
  contactOrder: string[];
  fullName: string; email: string; phone: string; location: string; nationality: string; linkedin: string; linkedinUrl: string; website: string; github: string; portfolio: string;
  signaturePlaceDate: string; signatureDataUrl: string;
  summary: string; experience: ExpItem[]; education: EduItem[]; skills: string;
  roleId: string | null; skillIds: string[];
  // Design knobs (optional — defaults applied at render time for legacy CVs)
  bodyPt?: number;
  lineHeight?: number;
  marginMm?: number;
  themeColor?: string;
}
interface CvVersion { id: string; name: string; label: string; content: string; createdAt: string; style: CvStyle; displayLanguage: Language; parentType?: string | null; parentId?: string | null; }

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
  'Conferences & Trainings', 'Thesis & Research', 'Awards & Honours', 'Volunteer Work',
  'Languages', 'References', 'Research Interests', 'Professional Affiliations',
];

// ── CSS for CV styles ─────────────────────────────────────────────────────────
// The preview iframe uses an A4-shaped page (210mm wide) so what you see
// matches the Puppeteer PDF render. Knobs (font-pt, line-height, margin-mm,
// theme color) are honored in BOTH the preview and the export.
function buildCssForPreview(
  style: CvStyle,
  bodyPt: number,
  lineHeight: number,
  marginMm: number,
  themeColor: string,
): string {
  const h1Pt = +(bodyPt * 2.2).toFixed(1);
  const h2Pt = +(bodyPt * 0.95).toFixed(1);
  const smallPt = +(bodyPt * 0.88).toFixed(1);
  const h2margin = +(bodyPt * 1.4).toFixed(1);

  // A4 page box: 210mm wide. Inner content area = 210mm - 2*marginMm.
  // We render each "page" as a fixed-height div the iframe scrolls through.
  const pageCss =
    `html,body{background:#e5e7eb;margin:0;padding:0}` +
    `.cv-page{width:210mm;min-height:297mm;background:#fff;margin:8mm auto;` +
    `box-shadow:0 1px 6px rgba(0,0,0,.15);box-sizing:border-box;padding:${marginMm}mm}` +
    `.cv-page>.w{width:100%}`;

  const templates: Record<CvStyle, string> = {
    modern:
      `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e}` +
      `h1{font-size:${h1Pt}pt;font-weight:700;margin:0 0 2pt;color:#0f172a}` +
      `h2{font-size:${h2Pt}pt;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:${themeColor};border-bottom:1.5pt solid ${themeColor};padding-bottom:2pt;margin:${h2margin}pt 0 4pt}` +
      `p,li{font-size:${bodyPt}pt;line-height:${lineHeight};color:#334155;margin:1pt 0}` +
      `ul{padding-left:12pt;margin:1pt 0}strong{color:#0f172a;font-size:${bodyPt}pt}` +
      `.contact{font-size:${smallPt}pt;color:#64748b;margin:2pt 0 8pt}span{font-size:${smallPt}pt}`,
    classic:
      `body{font-family:Georgia,serif;color:#1a1a1a}` +
      `h1{font-size:${h1Pt}pt;font-weight:700;margin:0 0 2pt;border-bottom:2pt double ${themeColor};padding-bottom:4pt;color:${themeColor}}` +
      `h2{font-size:${h2Pt}pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:${h2margin}pt 0 4pt;color:${themeColor}}` +
      `p,li{font-size:${bodyPt}pt;line-height:${lineHeight};color:#2d2d2d;margin:1pt 0}` +
      `ul{padding-left:12pt;margin:1pt 0}strong{font-size:${bodyPt}pt}` +
      `.contact{font-size:${smallPt}pt;color:#555;margin:2pt 0 8pt}span{font-size:${smallPt}pt}`,
    minimal:
      `body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#222}` +
      `h1{font-size:${h1Pt}pt;font-weight:300;letter-spacing:.03em;margin:0 0 2pt;color:${themeColor}}` +
      `h2{font-size:${h2Pt}pt;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:${themeColor};margin:${h2margin}pt 0 4pt}` +
      `p,li{font-size:${bodyPt}pt;line-height:${lineHeight};color:#444;margin:1pt 0}` +
      `ul{padding-left:11pt;margin:1pt 0}hr{border:none;border-top:1pt solid #e5e5e5;margin:6pt 0}` +
      `strong{font-size:${bodyPt}pt}.contact{font-size:${smallPt}pt;color:#888;margin:2pt 0 8pt}span{font-size:${smallPt}pt}`,
  };

  return `*{box-sizing:border-box}${pageCss}${templates[style] || templates.modern}`;
}

const SECTION_LABELS: Record<string, Record<string, string>> = {
  EN: { summary: 'Summary', experience: 'Experience', education: 'Education', skills: 'Skills' },
  DE: { summary: 'Profil', experience: 'Berufserfahrung', education: 'Ausbildung', skills: 'Kenntnisse' },
};

function escapeHtml(s: string) {
  return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function isHtml(s: string) { return /<[a-z][\s\S]*>/i.test(s); }

function boldify(text: string): string {
  // Convert **text** markers to <strong> tags
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function editorToHtml(d: EditorData): string {
  const t = SECTION_LABELS[d.displayLanguage] ?? SECTION_LABELS.EN;
  const linkedinDisplay = d.linkedin
    ? ((d as any).linkedinUrl
      ? `<a href="${escapeHtml((d as any).linkedinUrl)}" style="color:inherit;text-decoration:underline">${escapeHtml(d.linkedin)}</a>`
      : escapeHtml(d.linkedin))
    : '';
  const cOrder = d.contactOrder?.length ? d.contactOrder : DEFAULT_CONTACT_ORDER;
  const contactParts: string[] = [];
  for (const key of cOrder) {
    if (key === 'linkedin' && linkedinDisplay) { contactParts.push(linkedinDisplay); continue; }
    if (key === 'nationality' && d.nationality) { contactParts.push(escapeHtml(`Nationality: ${d.nationality}`)); continue; }
    const val = (d as any)[key];
    if (val) contactParts.push(escapeHtml(val));
  }
  const contact = contactParts.join(' · ');
  const photo = d.photoDataUrl?.trim()
    ? `<img data-role="profile-photo" src="${d.photoDataUrl.trim()}" alt="Profile photo" style="width:96px;height:96px;border-radius:4px;object-fit:cover;border:2px solid rgba(148,163,184,.5)" />`
    : '';
  const header = photo
    ? `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px"><div style="flex:1;min-width:0"><h1>${escapeHtml(d.fullName || 'Your Name')}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}</div><div style="flex:0 0 auto;margin-top:4px">${photo}</div></div>`
    : `<h1>${escapeHtml(d.fullName || 'Your Name')}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}`;

  const exp = d.experience.filter(e => e.company || e.role).map(e => {
    const lines = e.description.split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
    const desc = lines.length > 1
      ? `<ul style="margin:4px 0;padding-left:18px">${lines.map(l => `<li>${boldify(escapeHtml(l))}</li>`).join('')}</ul>`
      : lines[0] ? `<p style="margin:4px 0">${boldify(escapeHtml(lines[0]))}</p>` : '';
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
    let body = '';
    if (cs.entries?.length) {
      body = cs.entries.filter(e => e.title || e.description).map(e => {
        const lines = e.description.split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
        const desc = lines.length > 1
          ? `<ul style="margin:4px 0;padding-left:18px">${lines.map(l => `<li>${boldify(escapeHtml(l))}</li>`).join('')}</ul>`
          : lines[0] ? `<p style="margin:4px 0">${boldify(escapeHtml(lines[0]))}</p>` : '';
        const titleLine = [e.title, e.subtitle].filter(Boolean).join(' — ');
        return `<div style="margin-bottom:10px">${titleLine ? `<strong>${escapeHtml(titleLine)}</strong>` : ''}${e.period ? `<br><span style="font-size:.8em;opacity:.7">${escapeHtml(e.period)}</span>` : ''}${desc}</div>`;
      }).join('');
    } else {
      const rawText = cs.text ?? '';
      body = rawText.trim() ? (isHtml(rawText) ? rawText : `<p>${boldify(escapeHtml(rawText)).replace(/\n/g,'<br>')}</p>`) : '';
    }
    sections[key] = `<section data-cv-section="${key}"><h2>${heading}</h2>${body}</section>`;
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

function buildHtml(content: string, d: EditorData) {
  const css = buildCssForPreview(
    d.style,
    d.bodyPt ?? DEFAULT_BODY_PT,
    d.lineHeight ?? DEFAULT_LINE_HEIGHT,
    d.marginMm ?? DEFAULT_MARGIN_MM,
    d.themeColor ?? DEFAULT_THEME_COLORS[d.style] ?? DEFAULT_THEME_COLORS.modern,
  );
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${css}</style></head><body><div class="cv-page"><div class="w">${content}</div></div></body></html>`;
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
const enhancing = ref(false);
const addSectionOpen = ref(false);
const saveDialogOpen = ref(false);
const saveDialogInitialName = ref('');
const saveDialogInitialMode = ref<'version' | 'variant'>('version');
const saveDialogInitialParentId = ref<string | null>(null);
const editingVersionId = ref<string | null>(null);
const dragKey = ref<string>('');
const dragOverKey = ref<string>('');
const contactDragKey = ref<string>('');
const contactDragOverKey = ref<string>('');

const cvVersions = ref<CvVersion[]>([]);

const topLevelVersions = computed(() =>
  cvVersions.value
    .filter(v => !v.parentType)
    .map(v => ({ id: v.id, title: v.label || v.name }))
);

const DEFAULT_CONTACT_ORDER = ['email','phone','location','nationality','linkedin','website','github','portfolio'];

const CONTACT_FIELDS: Record<string, { label: string; model: keyof EditorData; placeholder: string }> = {
  email:       { label: 'Email',       model: 'email',       placeholder: 'anna@example.com' },
  phone:       { label: 'Phone',       model: 'phone',       placeholder: '+49 123 456 789' },
  location:    { label: 'Location',    model: 'location',    placeholder: 'Berlin, Germany' },
  nationality: { label: 'Nationality', model: 'nationality', placeholder: 'e.g. German' },
  linkedin:    { label: 'LinkedIn',    model: 'linkedin',    placeholder: 'linkedin.com/in/anna' },
  website:     { label: 'Website',     model: 'website',     placeholder: 'anna.com' },
  github:      { label: 'GitHub',      model: 'github',      placeholder: 'github.com/anna' },
  portfolio:   { label: 'Portfolio',   model: 'portfolio',   placeholder: 'anna.dev' },
};

// Default design knob values — match the previous hardcoded preview CSS
const DEFAULT_BODY_PT = 8.5;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_MARGIN_MM = 10;
const DEFAULT_THEME_COLORS: Record<CvStyle, string> = {
  modern: '#0ea5e9',
  classic: '#1a1a1a',
  minimal: '#888888',
};
const PRESET_THEME_COLORS = ['#0ea5e9', '#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0d9488', '#1a1a1a', '#888888'];

function resetDesign() {
  editorData.bodyPt = DEFAULT_BODY_PT;
  editorData.lineHeight = DEFAULT_LINE_HEIGHT;
  editorData.marginMm = DEFAULT_MARGIN_MM;
  editorData.themeColor = DEFAULT_THEME_COLORS[editorData.style];
}

const emptyEditor = (): EditorData => ({
  versionName: 'My CV', style: 'modern', displayLanguage: 'EN',
  photoDataUrl: '',
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  customSections: [],
  contactOrder: [...DEFAULT_CONTACT_ORDER],
  fullName: '', email: '', phone: '', location: '', nationality: '', linkedin: '', linkedinUrl: '', website: '', github: '', portfolio: '',
  signaturePlaceDate: '', signatureDataUrl: '',
  summary: '', experience: [], education: [], skills: '',
  roleId: null, skillIds: [],
  bodyPt: DEFAULT_BODY_PT,
  lineHeight: DEFAULT_LINE_HEIGHT,
  marginMm: DEFAULT_MARGIN_MM,
  themeColor: DEFAULT_THEME_COLORS.modern,
});

const editorData = reactive<EditorData>(emptyEditor());

// ── Template refs ─────────────────────────────────────────────────────────────
const previewIframe = ref<HTMLIFrameElement | null>(null);
const cvFileInput = ref<HTMLInputElement | null>(null);
const photoTemplateInput = ref<HTMLInputElement | null>(null);
const photoEditorInput = ref<HTMLInputElement | null>(null);
const signatureInput = ref<HTMLInputElement | null>(null);

// ── Live preview update ───────────────────────────────────────────────────────
const previewHtml = computed(() => buildHtml(editorToHtml(editorData), editorData));

// Page count + current page indicator. We render the CV inside a fixed-width
// (210mm) page container styled like A4; measuring scrollHeight / pageHeight
// gives us a close-enough page count. Not byte-perfect with Puppeteer's @page
// breaks, but matches within ~1 line on real CVs.
const pageCount = ref(1);
const currentPage = ref(1);

function measurePages() {
  const iframe = previewIframe.value;
  if (!iframe) return;
  const doc = iframe.contentDocument;
  if (!doc?.body) return;
  // Mirror Puppeteer's actual pagination:
  //   PDF page = A4 (297mm) with @page top/bottom margin = marginMm each.
  //   Usable content area per page = 297 − 2 × marginMm.
  // Measure the inner .w element (no padding/min-height) for the true content
  // height, then divide by usable area. This matches Puppeteer within ~1 line.
  const wEl = doc.querySelector('.cv-page > .w') as HTMLElement | null;
  if (!wEl) return;
  const pxPerMm = 96 / 25.4;
  const margin = editorData.marginMm ?? DEFAULT_MARGIN_MM;
  const usablePerPagePx = Math.max(1, (297 - 2 * margin) * pxPerMm);
  const contentHeightPx = wEl.scrollHeight;
  const total = Math.max(1, Math.ceil(contentHeightPx / usablePerPagePx));
  pageCount.value = total;
  // Current page from iframe scroll. The visible .cv-page box is 297mm tall
  // with an 8mm top/bottom outer margin, so step = 313mm in the scroll
  // viewport. Falls back gracefully on small content.
  const win = iframe.contentWindow;
  if (win) {
    const stepPx = (297 + 16) * pxPerMm;
    const scrollTop = win.scrollY || doc.documentElement.scrollTop || 0;
    currentPage.value = Math.min(total, Math.max(1, Math.floor(scrollTop / stepPx) + 1));
  }
}

function attachIframeScrollListener() {
  const iframe = previewIframe.value;
  if (!iframe) return;
  const win = iframe.contentWindow;
  if (!win) return;
  win.addEventListener('scroll', measurePages, { passive: true });
}

async function writePreviewToIframe(html: string) {
  if (!previewIframe.value) return;
  const doc = previewIframe.value.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  // Wait a tick for layout
  await nextTick();
  // Re-attach scroll listener (lost on doc.open) and measure
  attachIframeScrollListener();
  measurePages();
}

watch(previewHtml, async (html) => {
  if (step.value !== 'editor') return;
  await nextTick();
  await writePreviewToIframe(html);
});

watch(step, async (s) => {
  if (s !== 'editor') return;
  await nextTick();
  await writePreviewToIframe(previewHtml.value);
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
  editorData.customSections.push({ id, heading, text: '', entries: [] });
  editorData.sectionOrder.push(key);
  addSectionOpen.value = false;
}

function addCustomEntry(sectionKey: string) {
  const id = sectionKey.slice('custom:'.length);
  const cs = editorData.customSections.find(x => x.id === id);
  if (cs) cs.entries.push({ id: `entry_${Date.now()}`, title: '', subtitle: '', period: '', description: '' });
}
function removeCustomEntry(sectionKey: string, entryIdx: number) {
  const id = sectionKey.slice('custom:'.length);
  const cs = editorData.customSections.find(x => x.id === id);
  if (cs) cs.entries.splice(entryIdx, 1);
}

// ── Drag & drop section reorder ───────────────────────────────────────────────
function dragStart(key: string, e: DragEvent) {
  dragKey.value = key;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
  }
}
function dragOver(key: string, e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  dragOverKey.value = key;
}
function dragLeave() {
  dragOverKey.value = '';
}
function dragEnd() {
  dragKey.value = '';
  dragOverKey.value = '';
}
function dragDrop(toKey: string) {
  const from = dragKey.value;
  dragOverKey.value = '';
  dragKey.value = '';
  if (!from || from === toKey) return;
  const order = [...editorData.sectionOrder];
  const fromIdx = order.indexOf(from as CvSectionKey);
  const toIdx = order.indexOf(toKey as CvSectionKey);
  if (fromIdx < 0 || toIdx < 0) return;
  const [picked] = order.splice(fromIdx, 1);
  order.splice(toIdx, 0, picked);
  editorData.sectionOrder = order;
}

// ── Contact drag & drop reorder ──────────────────────────────────────────────
function contactDragStart(key: string, e: DragEvent) {
  contactDragKey.value = key;
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
}
function contactDragOver(key: string, e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  contactDragOverKey.value = key;
}
function contactDragLeave() { contactDragOverKey.value = ''; }
function contactDragEnd() { contactDragKey.value = ''; contactDragOverKey.value = ''; }
function contactDragDrop(toKey: string) {
  const from = contactDragKey.value;
  contactDragOverKey.value = '';
  contactDragKey.value = '';
  if (!from || from === toKey) return;
  const order = [...editorData.contactOrder];
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(toKey);
  if (fromIdx < 0 || toIdx < 0) return;
  const [picked] = order.splice(fromIdx, 1);
  order.splice(toIdx, 0, picked);
  editorData.contactOrder = order;
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

    const { data } = await api.post(apiBase.value, formData, { timeout: 180000, headers: apiHeaders.value });
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
        displayLanguage: cv.displayLanguage || 'EN',
      });
    }

    // Complete the progress animation
    clearInterval(interval); clearInterval(tipInterval);
    extractStep.value = EXTRACT_STEPS.length - 1;

    if (parsed) {
      applyParsedDataToEditor(parsed);
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

// ── Map AI-parsed data into editorData (used by upload + enhance) ─────────────
function applyParsedDataToEditor(parsed: any) {
  const p = parsed.personal || parsed;
  const customSections: CustomSection[] = [];

  const aiOrder: string[] = parsed.section_order?.length
    ? parsed.section_order
    : ['summary', 'experience', 'education', 'skills', 'certifications', 'languages', 'leadership', 'interests', 'additional_information'];
  const sectionOrder: CvSectionKey[] = aiOrder.filter(k => ['summary', 'experience', 'education', 'skills'].includes(k)) as CvSectionKey[];

  // Build custom sections and insert them at the correct position based on AI section order
  const ts = Date.now();
  const uid = () => Math.random().toString(36).slice(2, 7);
  const customSectionMap: Record<string, { heading: string; text: string; entries: CustomSectionEntry[]; id: string } | null> = {
    certifications: parsed.certifications?.length ? {
      id: `sec_certs_${ts}`,
      heading: 'Professional Qualifications',
      text: '',
      entries: parsed.certifications.map((c: any) => ({
        id: `entry_${ts}_${uid()}`, title: c.name || '', subtitle: c.institution || '', period: c.dates || '', description: c.details || '',
      })),
    } : null,
    languages: parsed.languages?.length ? {
      id: `sec_langs_${ts + 1}`,
      heading: 'Language Skills',
      text: parsed.languages.map((l: any) => l.level ? `${l.language} (${l.level})` : l.language).join(', '),
      entries: [],
    } : null,
    leadership: parsed.leadership?.length ? {
      id: `sec_lead_${ts + 2}`,
      heading: 'Leadership & Affiliations',
      text: '',
      entries: parsed.leadership.map((l: any) => ({
        id: `entry_${ts}_${uid()}`, title: l.title || '', subtitle: l.organization || '', period: l.dates || '', description: l.description || '',
      })),
    } : null,
    publications: parsed.publications?.length ? {
      id: `sec_pubs_${ts + 3}`,
      heading: 'Publications',
      text: '',
      entries: parsed.publications.map((pub: any) => ({
        id: `entry_${ts}_${uid()}`, title: pub.citation || '', subtitle: '', period: pub.year ? `(${pub.year})` : '', description: '',
      })),
    } : null,
    conferences: parsed.conferences?.length ? {
      id: `sec_conf_${ts + 4}`,
      heading: 'Conferences, Presentations & Trainings',
      text: '',
      entries: parsed.conferences.map((c: any) => ({
        id: `entry_${ts}_${uid()}`, title: c.title || '', subtitle: c.location || '', period: c.dates || '', description: c.description || '',
      })),
    } : null,
    references: parsed.references?.length ? {
      id: `sec_refs_${ts + 5}`,
      heading: 'References',
      text: '',
      entries: parsed.references.map((r: any) => ({
        id: `entry_${ts}_${uid()}`, title: r.name || '', subtitle: [r.title, r.organization].filter(Boolean).join(', '), period: '', description: [r.phone, r.email].filter(Boolean).join('\n'),
      })),
    } : null,
    research_interests: parsed.research_interests ? {
      id: `sec_ri_${ts + 6}`,
      heading: 'Research Interests',
      text: parsed.research_interests,
      entries: [],
    } : null,
    interests: parsed.interests ? {
      id: `sec_int_${ts + 7}`,
      heading: 'Interests',
      text: parsed.interests,
      entries: [],
    } : null,
    additional_information: parsed.additional_information ? {
      id: `sec_add_${ts + 8}`,
      heading: 'Additional Information',
      text: parsed.additional_information,
      entries: [],
    } : null,
  };

  // Also map any custom_sections from AI
  if (parsed.custom_sections?.length) {
    for (let i = 0; i < parsed.custom_sections.length; i++) {
      const cs = parsed.custom_sections[i];
      if (cs.heading && (cs.content || cs.entries?.length)) {
        const id = `sec_ai_${ts + 10 + i}`;
        const entries: CustomSectionEntry[] = cs.entries?.length
          ? cs.entries.map((e: any) => ({ id: `entry_${ts}_${uid()}`, title: e.title || '', subtitle: e.subtitle || '', period: e.period || '', description: e.description || '' }))
          : [];
        customSectionMap[`custom_ai_${i}`] = { id, heading: cs.heading, text: entries.length ? '' : (cs.content || ''), entries };
        if (!aiOrder.includes(`custom_ai_${i}`)) aiOrder.push(`custom_ai_${i}`);
      }
    }
  }

  // Insert custom sections at position matching AI order
  for (const key of aiOrder) {
    if (['summary', 'experience', 'education', 'skills'].includes(key)) continue;
    const cs = customSectionMap[key];
    if (cs) {
      customSections.push(cs);
      sectionOrder.push(`custom:${cs.id}` as CvSectionKey);
    }
  }

  Object.assign(editorData, {
    ...emptyEditor(),
    sectionOrder,
    customSections,
    photoDataUrl: parsed.photoDataUrl || '',
    signatureDataUrl: parsed.signatureDataUrl || '',
    fullName: p.name || '',
    email: p.email || '',
    phone: p.phone || '',
    location: p.location || '',
    nationality: p.nationality || '',
    linkedin: p.linkedin || '',
    linkedinUrl: p.linkedin_url || '',
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
      description: (exp.description || '').split('\n').map((l: string) => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean).join('\n'),
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

// ── Export PDF ────────────────────────────────────────────────────────────────
async function handleExportPdf() {
  isExporting.value = true;
  try {
    const contentHtml = editorToHtml(editorData);
    const filename = `${(editorData.fullName || 'CV').replace(/[^a-z0-9_\- ]+/gi, '_')}.pdf`;

    const response = await api.post(`${apiBase.value}/export`, {
      contentHtml,
      style: editorData.style,
      filename,
      design: {
        bodyPt: editorData.bodyPt ?? DEFAULT_BODY_PT,
        lineHeight: editorData.lineHeight ?? DEFAULT_LINE_HEIGHT,
        marginMm: editorData.marginMm ?? DEFAULT_MARGIN_MM,
        themeColor: editorData.themeColor ?? DEFAULT_THEME_COLORS[editorData.style],
      },
    }, { responseType: 'blob', headers: apiHeaders.value });

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

// ── Enhance with Arbeitly (employee mode) ────────────────────────────────────
async function enhanceWithArbeitly() {
  if (!isEmployeeMode.value || !props.candidateId || !editingVersionId.value) return;
  enhancing.value = true;
  try {
    // Persist current editor state first so the backend has fresh parsedData to work with.
    // The enhance endpoint reads cv.parsedData from the DB.
    const content = editorToHtml(editorData);
    await api.put(`${apiBase.value}/${editingVersionId.value}`, {
      title: editorData.versionName || 'My CV',
      editorData: { ...editorData },
      htmlContent: content,
      style: editorData.style,
      displayLanguage: editorData.displayLanguage,
      roleId: editorData.roleId,
      skillIds: editorData.skillIds,
    }, { headers: apiHeaders.value });

    const { data } = await api.post(
      `/employee/candidates/${props.candidateId}/cvs/${editingVersionId.value}/enhance`,
      {},
      { headers: apiHeaders.value, timeout: 180000 }
    );
    const enhanced = data?.data;
    if (enhanced && typeof enhanced === 'object') {
      applyParsedDataToEditor(enhanced);
    }
  } catch (err: any) {
    console.error('Enhancement failed:', err);
    alert(err?.response?.data?.error || 'Enhancement failed.');
  } finally {
    enhancing.value = false;
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function startCreate() {
  Object.assign(editorData, emptyEditor());
  editingVersionId.value = null;
  step.value = 'template';
}

function openSaveDialog() {
  saveDialogInitialName.value = editorData.versionName || '';
  if (editingVersionId.value) {
    const current = cvVersions.value.find(v => v.id === editingVersionId.value);
    if (current?.parentType === 'variant') {
      saveDialogInitialMode.value = 'variant';
      saveDialogInitialParentId.value = current.parentId ?? null;
    } else {
      saveDialogInitialMode.value = 'version';
      saveDialogInitialParentId.value = null;
    }
  } else {
    saveDialogInitialMode.value = topLevelVersions.value.length > 0 ? 'variant' : 'version';
    saveDialogInitialParentId.value = topLevelVersions.value[0]?.id ?? null;
  }
  saveDialogOpen.value = true;
}

async function onSaveAs(payload: { name: string; mode: 'version' | 'variant'; parentId: string | null }) {
  const name = payload.name.trim() || editorData.versionName || 'My CV';
  const content = editorToHtml(editorData);
  const editorState = { ...editorData };
  const parentId = payload.mode === 'variant' ? payload.parentId : null;
  const parentType = payload.mode === 'variant' ? 'variant' : null;

  try {
    if (editingVersionId.value) {
      await api.put(`${apiBase.value}/${editingVersionId.value}`, {
        title: name,
        editorData: editorState,
        htmlContent: content,
        style: editorData.style,
        displayLanguage: editorData.displayLanguage,
      }, { headers: apiHeaders.value });
      const v = cvVersions.value.find(v => v.id === editingVersionId.value);
      if (v) { v.name = name; v.label = name; v.content = content; v.style = editorData.style; v.displayLanguage = editorData.displayLanguage; }
    } else {
      const { data } = await api.post(`${apiBase.value}/create`, {
        title: name,
        editorData: editorState,
        htmlContent: content,
        style: editorData.style,
        displayLanguage: editorData.displayLanguage,
        roleId: editorData.roleId,
        skillIds: editorData.skillIds,
        parentId,
        parentType,
      }, { headers: apiHeaders.value });
      const cv = data.data;
      editingVersionId.value = cv.id;
      cvVersions.value.push({
        id: cv.id,
        name, label: name, content,
        createdAt: cv.createdAt,
        style: editorData.style,
        displayLanguage: editorData.displayLanguage,
        parentType: cv.parentType ?? null,
        parentId: cv.parentId ?? null,
      });
    }
  } catch (err) {
    console.error('Failed to save CV:', err);
  }

  saveDialogOpen.value = false;
  step.value = 'landing';
}

async function openCvVersion(v: CvVersion) {
  try {
    const { data } = await api.get(`${apiBase.value}/${v.id}`, { headers: apiHeaders.value });
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
        displayLanguage: cv.displayLanguage || v.displayLanguage || 'EN',
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
    await api.delete(`${apiBase.value}/${id}`, { headers: apiHeaders.value });
    cvVersions.value = cvVersions.value.filter(v => v.id !== id);
  } catch (err) {
    console.error('Failed to delete CV:', err);
  }
}

onMounted(async () => {
  try {
    const { data } = await api.get(apiBase.value, { headers: apiHeaders.value });
    cvVersions.value = (data.data || []).map((cv: any) => ({
      id: cv.id,
      name: cv.title,
      label: cv.title,
      content: cv.htmlContent || '',
      createdAt: cv.createdAt,
      style: cv.style || 'modern',
      displayLanguage: cv.displayLanguage || 'EN',
      parentType: cv.parentType ?? null,
      parentId: cv.parentId ?? null,
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
