import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '..', 'config', 'onboarding-questions.json');

export interface OnboardingQuestion {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: any;
  visibleIf?: { key: string; equals: any };
}

export interface OnboardingStep {
  key: string;
  title: string;
  subtitle?: string;
  questions: OnboardingQuestion[];
}

export interface OnboardingConfig {
  steps: OnboardingStep[];
}

/**
 * Re-read on every call so editing the JSON file picks up immediately
 * with no backend restart. Cheap (~few KB), called rarely.
 */
export const onboardingConfigService = {
  load(): OnboardingConfig {
    const raw = readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return { steps: parsed.steps ?? [] };
  },

  /** Flat list of all questions across all steps. */
  allQuestions(): OnboardingQuestion[] {
    return this.load().steps.flatMap((s) => s.questions);
  },
};
