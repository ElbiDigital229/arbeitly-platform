<template>
  <div class="flex h-[calc(100vh-48px)]">
    <!-- Left: file explorer -->
    <div class="w-72 flex-shrink-0 flex flex-col border-r border-border bg-card overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 border-b border-border shrink-0">
        <h1 class="font-display text-sm font-bold text-foreground">Your Files</h1>
        <p class="text-[10px] text-muted-foreground mt-0.5">{{ filteredCvs.length }} file{{ filteredCvs.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Search + Filters -->
      <div class="px-3 py-2 border-b border-border shrink-0">
        <div class="relative">
          <span class="mdi mdi-magnify absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground" />
          <input
            v-model="searchQuery"
            placeholder="Search files..."
            class="h-7 w-full rounded-md bg-secondary border-none pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div class="flex items-center gap-1 mt-2 flex-wrap">
          <button
            v-for="chip in filterChips"
            :key="chip.key"
            @click="activeFilter = chip.key"
            class="px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors"
            :class="activeFilter === chip.key
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-muted-foreground border-border hover:border-primary/40'"
          >{{ chip.label }}</button>
        </div>
      </div>

      <!-- File tree -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <!-- CVs section header -->
        <button
          @click="cvSectionOpen = !cvSectionOpen"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary/40 transition-colors text-left"
        >
          <span class="mdi text-sm text-muted-foreground" :class="cvSectionOpen ? 'mdi-chevron-down' : 'mdi-chevron-right'" />
          <span class="mdi text-sm text-primary" :class="cvSectionOpen ? 'mdi-folder-open-outline' : 'mdi-folder-outline'" />
          <span class="text-xs font-semibold text-foreground flex-1">CVs</span>
          <span v-if="filteredCvs.length > 0" class="text-[10px] font-medium text-muted-foreground bg-secondary rounded-full px-1.5 py-0.5">
            {{ filteredCvs.length }}
          </span>
        </button>

        <div v-if="cvSectionOpen" class="space-y-0.5 pl-1">
          <p v-if="filteredCvs.length === 0" class="text-[11px] text-muted-foreground pl-8 py-2">
            {{ cvs.length === 0 ? 'No files yet.' : 'No files match your search.' }}
          </p>

          <!-- File nodes -->
          <div
            v-for="cv in filteredCvs"
            :key="cv.id"
            class="flex items-center gap-1.5 px-2 py-2 rounded-lg cursor-pointer transition-colors group"
            :class="selected?.id === cv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/60'"
            @click="selectFile(cv)"
          >
            <span class="w-3.5 shrink-0" />
            <span class="mdi mdi-file-document-outline text-sm shrink-0" :class="selected?.id === cv.id ? 'text-primary' : 'text-muted-foreground'" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1 flex-wrap">
                <span class="text-xs font-medium truncate" :class="selected?.id === cv.id ? 'text-primary' : 'text-card-foreground'">
                  {{ cv.title }}
                </span>
                <!-- Language badge -->
                <span
                  v-if="cv.language"
                  class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border"
                  :class="cv.language === 'DE'
                    ? 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20'
                    : 'bg-primary/10 text-primary border-primary/20'"
                >
                  <span class="mdi mdi-translate text-[9px]" />{{ cv.language }}
                </span>
              </div>
              <p class="text-[10px] text-muted-foreground/60 mt-0.5">
                {{ formatDate(cv.createdAt) }}{{ cv.style ? ` · ${capitalize(cv.style)}` : '' }}
              </p>
            </div>
            <!-- Download on hover -->
            <button
              class="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1"
              title="Download PDF"
              @click.stop="downloadPdf(cv)"
            >
              <span class="mdi mdi-download text-xs" />
            </button>
            <!-- Delete on hover -->
            <button
              class="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
              title="Delete"
              @click.stop="confirmDelete(cv)"
            >
              <span class="mdi mdi-trash-can-outline text-xs" />
            </button>
          </div>
        </div>

        <!-- Empty state: create CV link -->
        <div v-if="!loading && cvs.length === 0" class="px-4 py-6 text-center">
          <router-link
            to="/candidate/cv"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground"
          >
            <span class="mdi mdi-plus" /> Create CV
          </router-link>
        </div>
      </div>
    </div>

    <!-- Right: preview panel -->
    <div class="flex-1 flex flex-col overflow-hidden bg-secondary/10">
      <!-- Loading -->
      <div v-if="loading" class="flex-1 flex items-center justify-center text-muted-foreground">
        <span class="mdi mdi-loading mdi-spin text-2xl mr-2" />
        <span class="text-sm">Loading files…</span>
      </div>

      <!-- Selected file preview -->
      <template v-else-if="selected">
        <div class="flex items-center gap-3 px-5 py-2.5 border-b border-border bg-card/50 shrink-0">
          <span class="mdi mdi-file-document-outline text-base text-primary" />
          <span class="text-sm font-medium text-card-foreground">{{ selected.title }}</span>
          <span v-if="selected.style" class="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-secondary text-muted-foreground">
            {{ selected.style }}
          </span>
          <div class="flex-1" />
          <router-link
            :to="`/candidate/cv?edit=${selected.id}`"
            class="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors"
          >
            <span class="mdi mdi-pencil-outline text-xs" /> Edit
          </router-link>
          <button
            @click="downloadPdf(selected)"
            :disabled="downloading === selected.id"
            class="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors disabled:opacity-50"
          >
            <span class="mdi text-xs" :class="downloading === selected.id ? 'mdi-loading mdi-spin' : 'mdi-download'" />
            Download PDF
          </button>
        </div>
        <div class="flex-1 overflow-hidden p-4">
          <iframe
            :key="selected.id"
            :srcdoc="previewHtml"
            class="w-full h-full rounded-xl border border-border/30 shadow-lg bg-white"
            title="File Preview"
          />
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <span class="mdi mdi-file-document-outline text-4xl opacity-20" />
        <p class="text-sm">Select a file to preview</p>
        <p class="text-xs opacity-60">Click any file in the tree on the left</p>
      </div>
    </div>

    <!-- Delete confirm dialog -->
    <div v-if="deleteTarget" class="modal-overlay">
      <div class="rounded-2xl border border-border bg-card p-6 w-full max-w-sm space-y-4">
        <div class="flex items-start gap-3">
          <div class="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10 border border-destructive/20">
            <span class="mdi mdi-trash-can-outline text-lg text-destructive" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foreground">Delete CV?</p>
            <p class="text-xs mt-0.5 text-muted-foreground">
              "<span class="font-medium text-foreground">{{ deleteTarget.title }}</span>" will be permanently deleted.
            </p>
          </div>
        </div>
        <div class="flex gap-2 justify-end">
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-secondary text-foreground hover:bg-secondary/80"
            @click="deleteTarget = null"
          >Cancel</button>
          <button
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-destructive text-white hover:bg-destructive/90"
            :disabled="deleting"
            @click="executeDelete"
          >
            <span v-if="deleting" class="mdi mdi-loading mdi-spin mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface CvFile {
  id: string;
  title: string;
  htmlContent: string | null;
  parsedData: any | null;
  style: string | null;
  language: string | null;
  createdAt: string;
}

const loading = ref(true);
const cvs = ref<CvFile[]>([]);
const selected = ref<CvFile | null>(null);
const searchQuery = ref('');
const activeFilter = ref('all');
const cvSectionOpen = ref(true);
const downloading = ref<string | null>(null);
const deleteTarget = ref<CvFile | null>(null);
const deleting = ref(false);

const filterChips = [
  { key: 'all', label: 'All' },
  { key: 'EN', label: 'EN' },
  { key: 'DE', label: 'DE' },
];

const filteredCvs = computed(() => {
  return cvs.value.filter(cv => {
    if (searchQuery.value && !cv.title.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;
    if (activeFilter.value !== 'all' && cv.language !== activeFilter.value) return false;
    return true;
  });
});

const previewHtml = computed(() => {
  const cv = selected.value;
  if (!cv) return '';
  const html = cv.htmlContent || parsedDataToHtml(cv.parsedData);
  if (!html) return '<html><body style="font-family:sans-serif;color:#888;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>No preview available</p></body></html>';
  const style = (cv.style as string) || 'modern';
  return buildPreviewHtml(html, style);
});

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/cvs');
    cvs.value = data.data || [];
    if (cvs.value.length > 0) {
      selected.value = cvs.value[0];
    }
  } catch (err) {
    console.error('Failed to load CVs:', err);
  } finally {
    loading.value = false;
  }
});

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function selectFile(cv: CvFile) {
  selected.value = cv;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parsedDataToHtml(parsed: any): string {
  if (!parsed) return '';
  const p = parsed.personal || {};
  const lines: string[] = [];

  // Profile photo + Header
  const photo = parsed.photoDataUrl
    ? `<img data-role="profile-photo" src="${parsed.photoDataUrl}" alt="Profile photo" style="width:96px;height:96px;border-radius:4px;object-fit:cover;border:2px solid rgba(148,163,184,.5)" />`
    : '';

  const nameHtml = p.name ? `<h1>${escapeHtml(p.name)}</h1>` : '';
  const contact = [p.email, p.phone, p.location, p.nationality].filter(Boolean).join(' | ');
  const contactHtml = contact ? `<p class="contact">${escapeHtml(contact)}</p>` : '';

  if (photo) {
    lines.push(`<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:18px"><div style="flex:1;min-width:0">${nameHtml}${contactHtml}</div><div style="flex:0 0 auto;margin-top:4px">${photo}</div></div>`);
  } else {
    if (nameHtml) lines.push(nameHtml);
    if (contactHtml) lines.push(contactHtml);
  }

  // Summary
  if (parsed.summary) {
    lines.push(`<h2>Summary</h2><p>${escapeHtml(parsed.summary)}</p>`);
  }

  // Experience
  if (parsed.experience?.length) {
    lines.push('<h2>Experience</h2>');
    for (const exp of parsed.experience) {
      lines.push(`<p><strong>${escapeHtml(exp.title || '')}${exp.company ? ' — ' + escapeHtml(exp.company) : ''}</strong></p>`);
      if (exp.dates) lines.push(`<p><em>${escapeHtml(exp.dates)}</em></p>`);
      if (exp.description) {
        const bullets = exp.description.split('\n').filter((l: string) => l.trim());
        if (bullets.length > 1) {
          lines.push('<ul>' + bullets.map((b: string) => `<li>${escapeHtml(b.replace(/^[-•]\s*/, ''))}</li>`).join('') + '</ul>');
        } else {
          lines.push(`<p>${escapeHtml(exp.description)}</p>`);
        }
      }
    }
  }

  // Education
  if (parsed.education?.length) {
    lines.push('<h2>Education</h2>');
    for (const edu of parsed.education) {
      lines.push(`<p><strong>${escapeHtml(edu.degree || '')}</strong></p>`);
      if (edu.institution) lines.push(`<p>${escapeHtml(edu.institution)}</p>`);
      if (edu.dates) lines.push(`<p><em>${escapeHtml(edu.dates)}</em></p>`);
      if (edu.gpa) lines.push(`<p>GPA: ${escapeHtml(edu.gpa)}</p>`);
      if (edu.courses) lines.push(`<p>Courses: ${escapeHtml(edu.courses)}</p>`);
    }
  }

  // Skills
  if (parsed.skills?.length) {
    lines.push(`<h2>Skills</h2><p>${parsed.skills.map((s: string) => escapeHtml(s)).join(', ')}</p>`);
  }

  // Certifications
  if (parsed.certifications?.length) {
    lines.push('<h2>Certifications</h2>');
    for (const c of parsed.certifications) {
      lines.push(`<p><strong>${escapeHtml(c.name || '')}</strong>${c.institution ? ' — ' + escapeHtml(c.institution) : ''}${c.dates ? ' — ' + escapeHtml(c.dates) : ''}</p>`);
      if (c.details) lines.push(`<p>${escapeHtml(c.details)}</p>`);
    }
  }

  // Languages
  if (parsed.languages?.length) {
    lines.push(`<h2>Languages</h2><p>${parsed.languages.map((l: any) => escapeHtml(l.language || '') + (l.level ? ` (${escapeHtml(l.level)})` : '')).join(', ')}</p>`);
  }

  // Leadership
  if (parsed.leadership?.length) {
    lines.push('<h2>Leadership</h2>');
    for (const l of parsed.leadership) {
      lines.push(`<p><strong>${escapeHtml(l.title || '')}</strong>${l.organization ? ' — ' + escapeHtml(l.organization) : ''}${l.dates ? ' — ' + escapeHtml(l.dates) : ''}</p>`);
      if (l.description) lines.push(`<p>${escapeHtml(l.description)}</p>`);
    }
  }

  // Interests
  if (parsed.interests) {
    lines.push(`<h2>Interests</h2><p>${escapeHtml(parsed.interests)}</p>`);
  }

  return lines.join('\n');
}

function buildPreviewHtml(content: string, style: string): string {
  const css: Record<string, string> = {
    modern: `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a2e;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:40px 48px}h1{font-size:2rem;font-weight:700;margin:0 0 4px;color:#0f172a}h2{font-size:1rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#0ea5e9;border-bottom:2px solid #0ea5e9;padding-bottom:4px;margin:24px 0 10px}p,li{font-size:.92rem;line-height:1.65;color:#334155;margin:4px 0}ul{padding-left:18px}strong{color:#0f172a}`,
    classic: `body{font-family:Georgia,serif;color:#1a1a1a;margin:0;padding:0}.w{max-width:780px;margin:0 auto;padding:48px 56px}h1{font-size:1.9rem;font-weight:700;margin:0 0 4px;border-bottom:3px double #1a1a1a;padding-bottom:8px}h2{font-size:1rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:24px 0 8px;color:#1a1a1a}p,li{font-size:.93rem;line-height:1.7;color:#2d2d2d;margin:4px 0}ul{padding-left:20px}`,
    minimal: `body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#222;margin:0;padding:0}.w{max-width:760px;margin:0 auto;padding:44px 52px}h1{font-size:1.8rem;font-weight:300;letter-spacing:.04em;margin:0 0 4px}h2{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#888;margin:28px 0 8px}p,li{font-size:.9rem;line-height:1.6;color:#444;margin:3px 0}ul{padding-left:16px}hr{border:none;border-top:1px solid #e5e5e5;margin:16px 0}`,
  };
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}${css[style] || css.modern}</style></head><body><div class="w">${content}</div></body></html>`;
}

async function downloadPdf(cv: CvFile) {
  const html = cv.htmlContent || parsedDataToHtml(cv.parsedData);
  if (!html) return;
  downloading.value = cv.id;
  try {
    const response = await axios.post('/api/cvs/export', {
      contentHtml: html,
      style: cv.style || 'modern',
      filename: `${cv.title}.pdf`,
    }, { responseType: 'blob' });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('PDF export failed:', err);
  } finally {
    downloading.value = null;
  }
}

function confirmDelete(cv: CvFile) {
  deleteTarget.value = cv;
}

async function executeDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await axios.delete(`/api/cvs/${deleteTarget.value.id}`);
    cvs.value = cvs.value.filter(c => c.id !== deleteTarget.value!.id);
    if (selected.value?.id === deleteTarget.value.id) {
      selected.value = cvs.value[0] || null;
    }
    deleteTarget.value = null;
  } catch (err) {
    console.error('Failed to delete CV:', err);
  } finally {
    deleting.value = false;
  }
}
</script>
