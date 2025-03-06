<!-- layouts/default.vue or App.vue -->
<template>
    <div>
      <HeaderComponent v-if="route.path != '/'"/> <!-- Include the header -->
      <NuxtPage />
    </div>
</template>
  
<script setup>
   import HeaderComponent from '@/components/Inventory/HeaderComponent.vue'; // Import your header component
  const  route = useRoute()
</script>
  
<style scoped>
/* Add your styles here */
  
</style>