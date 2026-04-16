<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div class="w-full md:w-1/3">
      <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        <SignUpTab :signupForm="signUp" />
        <button class="text-center" @click="signUp = !signUp">
          <span v-if="!signUp"
            >Don't have an account?
            <span class="text-blue-600 underline cursor-pointer"
              >sign up</span
            ></span
          >
          <span v-else>
            <span class="text-blue-600 underline cursor-pointer">Log in </span>
            to existing account</span
          >
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SignUpTab from "../components/Authentication/SignUpTab.vue";
const signUp = ref(false);
</script>
