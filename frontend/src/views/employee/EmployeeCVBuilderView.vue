<template>
  <div>
    <CVBuilderView :employee-candidate-id="candidateId" :initial-mode="mode" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import CVBuilderView from '../candidate/CVBuilderView.vue';

const route = useRoute();
const candidateId = route.params.id as string;
const mode = (route.query.mode as string) || 'upload';
</script>
