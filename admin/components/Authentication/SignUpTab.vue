<template>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Login</h2>
      <form @submit.prevent="handleSubmit">
        <input
          type="text"
          v-model="username"
          placeholder="example@email.com"
          class="border p-2 w-full mb-4"
        />
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  </template>
  
<script setup lang="ts">
import {ref} from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter();
const username = ref('');
const password = ref('');

const handleSubmit = async () => {
    // Handle sign up/login logic here
    console.log('Username:', username.value);
    
    router.push('/Home');
};
</script>

    