<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <!-- Header: score circle + band -->
    <div class="flex items-center gap-4 px-5 py-4 border-b border-border">
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
        :class="ringClass"
      >
        {{ match.score }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs uppercase tracking-wider text-muted-foreground">Match score</p>
        <p class="text-lg font-semibold capitalize" :class="textClass">{{ match.band }} fit</p>
      </div>
      <button
        @click="expanded = !expanded"
        class="text-xs text-primary hover:underline shrink-0"
      >
        {{ expanded ? 'Hide details' : 'Why?' }}
      </button>
    </div>

    <!-- Top reasons / gaps (always visible) -->
    <div class="px-5 py-3 space-y-2 text-sm">
      <div v-if="match.topReasons.length" class="flex items-start gap-2">
        <span class="mdi mdi-thumb-up-outline text-green-500 mt-0.5" />
        <div class="flex-1">
          <p class="text-xs font-semibold text-foreground mb-0.5">Why it fits</p>
          <ul class="text-xs text-muted-foreground space-y-0.5">
            <li v-for="r in match.topReasons" :key="r">{{ r }}</li>
          </ul>
        </div>
      </div>
      <div v-if="match.topGaps.length" class="flex items-start gap-2">
        <span class="mdi mdi-alert-circle-outline text-amber-500 mt-0.5" />
        <div class="flex-1">
          <p class="text-xs font-semibold text-foreground mb-0.5">Gaps to consider</p>
          <ul class="text-xs text-muted-foreground space-y-0.5">
            <li v-for="g in match.topGaps" :key="g">{{ g }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Expanded factor breakdown -->
    <div v-if="expanded" class="border-t border-border px-5 py-4 space-y-2">
      <div v-for="f in match.factors" :key="f.key" class="text-xs">
        <div class="flex items-center justify-between mb-1">
          <span class="font-medium text-foreground">{{ f.label }}</span>
          <span class="text-muted-foreground">
            {{ Math.round(f.score * 100) }}% &times; {{ f.weight }} = {{ Math.round(f.contribution) }}
          </span>
        </div>
        <div class="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            class="h-full rounded-full"
            :class="barClass(f.score)"
            :style="{ width: Math.round(f.score * 100) + '%' }"
          />
        </div>
        <p class="mt-0.5 text-muted-foreground">{{ f.evidence }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Factor {
  key: string;
  label: string;
  score: number;
  weight: number;
  contribution: number;
  evidence: string;
}
interface Match {
  score: number;
  band: 'excellent' | 'strong' | 'possible' | 'weak' | 'poor';
  factors: Factor[];
  topReasons: string[];
  topGaps: string[];
}

const props = defineProps<{ match: Match }>();
const expanded = ref(false);

const ringClass = computed(() => {
  const b = props.match.band;
  if (b === 'excellent') return 'bg-green-500/15 text-green-500 ring-4 ring-green-500/20';
  if (b === 'strong') return 'bg-primary/15 text-primary ring-4 ring-primary/20';
  if (b === 'possible') return 'bg-amber-500/15 text-amber-500 ring-4 ring-amber-500/20';
  return 'bg-muted text-muted-foreground ring-4 ring-muted/40';
});
const textClass = computed(() => {
  const b = props.match.band;
  if (b === 'excellent') return 'text-green-500';
  if (b === 'strong') return 'text-primary';
  if (b === 'possible') return 'text-amber-500';
  return 'text-muted-foreground';
});
function barClass(score: number) {
  if (score >= 0.8) return 'bg-green-500';
  if (score >= 0.5) return 'bg-primary';
  if (score >= 0.3) return 'bg-amber-500';
  return 'bg-destructive';
}
</script>
