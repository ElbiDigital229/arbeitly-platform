import { ref } from 'vue';
import api from '../services/api';

export interface TaxonomyRole {
  id: string;
  name: string;
  family: string;
  description?: string | null;
}
export interface TaxonomySkill {
  id: string;
  name: string;
  roleFamilies: string[];
  aliases: string[];
}
export interface TaxonomyIndustry {
  id: string;
  name: string;
}

const roles = ref<TaxonomyRole[]>([]);
const skills = ref<TaxonomySkill[]>([]);
const industries = ref<TaxonomyIndustry[]>([]);
let loaded = false;
let loading: Promise<void> | null = null;

async function doLoad() {
  const [r, s, i] = await Promise.all([
    api.get('/taxonomy/roles'),
    api.get('/taxonomy/skills'),
    api.get('/taxonomy/industries'),
  ]);
  roles.value = r.data.data;
  skills.value = s.data.data;
  industries.value = i.data.data;
  loaded = true;
}

export function useTaxonomy() {
  async function load() {
    if (loaded) return;
    if (!loading) loading = doLoad();
    await loading;
  }

  function reload() {
    loaded = false;
    loading = null;
    return load();
  }

  function skillsForRoleFamily(family: string) {
    return skills.value.filter((s) => s.roleFamilies.includes(family));
  }

  function rolesByFamily() {
    const grouped: Record<string, TaxonomyRole[]> = {};
    for (const r of roles.value) {
      (grouped[r.family] ??= []).push(r);
    }
    return grouped;
  }

  return { roles, skills, industries, load, reload, skillsForRoleFamily, rolesByFamily };
}
