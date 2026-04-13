<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="bg-white py-12 px-6 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold text-center mb-8">Hope Restored Admin</h1>
        <SignUpTab
          :signupForm="signUp"
        />
        <button class="mt-4 w-full" @click="signUp = !signUp">
          <div v-if="!signUp">
            <h2 class="text-center" v-if="!signUp">Don't have an account? </h2> 
            <h2 class=' text-blue-600 underline cursor-pointer text-center'>sign up</h2>
          </div>
          <div v-else>
            <h2>Have an account?</h2>
            <h2 class=' text-blue-600 underline cursor-pointer'>Log in </h2> 
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignUpTab from '~/components/Authentication/SignUpTab.vue';

definePageMeta({
  layout: 'default',
});
const signUp = ref(false);
</script>
