<template>
  <div>
    <h1>Fetch Test Page</h1>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app';
import { onMounted, ref } from 'vue';

// Import the useRuntimeConfig composable
const config = useRuntimeConfig();

// Define a reactive data property
const data = ref(null);

// Fetch data when the component is mounted
onMounted(async () => {
  try {
    data.value = await $fetch('/api/test/', {
      baseURL: config.public.apiBase,
    });
  } catch (error) {
    console.error('Fetch error:', error);
  }
});
</script>

<style scoped>
/* Add any styles if necessary */
</style>
