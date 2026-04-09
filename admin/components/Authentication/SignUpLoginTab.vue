<template>
  <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-6">{{ isLogin ? 'Login' : 'Sign Up' }}</h2>
    
    <div v-if="error" class="text-red-500 mb-4 text-sm">
      {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <input
        type="email"
        v-model="email"
        placeholder="Email"
        class="border p-2 w-full mb-4"
        required
      />
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        class="border p-2 w-full mb-4"
        required
      />
      <input
        v-if="!isLogin"
        type="password"
        v-model="confirmPassword"
        placeholder="Confirm Password"
        class="border p-2 w-full mb-4"
      />
      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {{ loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up' }}
      </button>
    </form>

    <button
      @click="isLogin = !isLogin"
      class="text-sm text-blue-500 mt-4 w-full"
    >
      {{ isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { createAuthClient } from 'better-auth/vue';

const authClient = createAuthClient({
  basePath: '/api/auth',
});

const router = useRouter();
const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (isLogin.value) {
      // Sign in
      const result = await authClient.signIn.email({
        email: email.value,
        password: password.value,
      });
      
      if (result.error) {
        const message = result.error.message || 'Sign in failed';
        error.value = message.includes('Credential account not found')
          ? 'No account found for this email. Click "Sign up" first.'
          : message;
        return;
      }
    } else {
      // Sign up
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
      }

      const result = await authClient.signUp.email({
        email: email.value,
        password: password.value,
        name: email.value.split('@')[0],
      });
      
      if (result.error) {
        error.value = result.error.message || 'Sign up failed';
        return;
      }
    }

    // Success - redirect to inventory
    await router.push('/inventory');
  } catch (err) {
    error.value = (err as Error).message || 'An error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add any additional styles here */
</style>
    