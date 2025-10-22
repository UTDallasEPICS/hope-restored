<!-- layouts/default.vue or App.vue -->
<template>
    <div>
      <HeaderComponent v-if="route.path != '/'"/> <!-- Include the header -->
      <NuxtPage />
    </div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import HeaderComponent from '@/components/Inventory/HeaderComponent.vue'; // Import your header component
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
  
<style scoped>
/* Add your styles here */
  
</style>