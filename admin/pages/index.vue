<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    
    <h1 class="text-3xl font-bold mb-8">Admin Homepage</h1>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-1">
      <SignUpTab />
    </div>
  </div>

  

</template> 

<script lang="ts" setup>
import SignUpTab from '../components/Authentication/SignUpTab.vue';


</script>

