<template>
    <div class="app-layout">
      <HeaderComponent v-if="route.path != '/'"/>
      <main class="page-content">
        <NuxtPage />
      </main>
    </div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import HeaderComponent from '@/components/Inventory/HeaderComponent.vue';
const route = useRoute();
const { checkAndCreateNewDay } = useDailyCheck();

// Check for new day when app loads
onMounted(async () => {
  try {
    await checkAndCreateNewDay();
  } catch (error) {
    console.error('Daily check failed on app mount:', error);
  }
});
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>