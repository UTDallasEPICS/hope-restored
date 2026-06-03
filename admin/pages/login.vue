<template>
  <div class="login-page">
    <div class="login-page__card-wrap">
      <div class="login-page__card">
        <h1 class="login-page__title">Hope Restored Admin</h1>
        <SignUpTab :signup-form="signUp" />
        <button
          type="button"
          class="login-page__toggle mt-4 w-full"
          @click="signUp = !signUp"
        >
          <template v-if="!signUp">
            <p class="text-center text-sm text-gray-700 m-0">
              Don&apos;t have an account?
            </p>
            <p class="text-center text-blue-600 underline cursor-pointer m-0 mt-1">
              Sign up
            </p>
          </template>
          <template v-else>
            <p class="text-center text-sm text-gray-700 m-0">Have an account?</p>
            <p class="text-center text-blue-600 underline cursor-pointer m-0 mt-1">
              Log in
            </p>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignUpTab from "~/components/Authentication/SignUpTab.vue";

const signUp = ref(false);
</script>

<style scoped>
.login-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  padding: max(1rem, env(safe-area-inset-right))
    max(1rem, env(safe-area-inset-bottom))
    max(1rem, env(safe-area-inset-left));
  box-sizing: border-box;
  background-color: #f3f4f6;
}

.login-page__card-wrap {
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
}

.login-page__card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  padding: clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 1.5rem);
}

.login-page__title {
  margin: 0 0 2rem;
  font-size: clamp(1.5rem, 5vw, 1.875rem);
  font-weight: 700;
  text-align: center;
  line-height: 1.2;
}

.login-page__toggle {
  border: none;
  background: transparent;
  padding: 0.5rem 0;
  cursor: pointer;
}
</style>
