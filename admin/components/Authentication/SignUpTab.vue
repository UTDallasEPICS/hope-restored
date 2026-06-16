<template>
    <div>
      <form
        @submit.prevent="handleSubmit"
        v-if="!validEmail"
        class="flex flex-col items-stretch w-full max-w-full"
      >
        <h2 class="text-xl font-semibold mb-4 text-center">{{props.signupForm? "Sign up" : "Login"}}</h2>
        <p
          v-if="ErrorMsg"
          class="whitespace-pre-wrap text-red-600 text-sm mb-4 w-full text-center"
          role="alert"
        >
          {{ ErrorMsg }}
        </p>
        <div
          v-if="props.signupForm"
          class="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full"
        >
          <input
            type="text"
            v-model="firstName"
            placeholder="First Name"
            class="auth-input"
          />
          <input
            type="text"
            v-model="lastName"
            placeholder="Last Name"
            class="auth-input"
          />
        </div>
        <input
          type="email"
          v-model="email"
          autocomplete="email"
          placeholder="example@email.com"
          class="auth-input"
        />
        <button type="submit" class="auth-submit">
          Submit
        </button>
      </form>
      <form
        @submit.prevent="handleOTPSubmit"
        v-if="validEmail"
        class="flex flex-col items-stretch w-full max-w-full"
      >
        <h2 class="text-xl font-semibold mb-2">Enter your code</h2>
        <p class="text-sm text-gray-600 mb-4 text-center">
          We sent a 6-digit code to {{ email }}.
        </p>
        <p
          v-if="ErrorMsg"
          class="whitespace-pre-wrap text-red-600 text-sm mb-4 w-full text-center"
          role="alert"
        >
          {{ ErrorMsg }}
        </p>
        <input
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          v-model="otp"
          :placeholder="props.signupForm ? 'Enter sign up code here' : 'Enter login code here'"
          class="auth-input text-center tracking-widest"
        />
        <button type="submit" class="auth-submit">
          Submit
        </button>
      </form>
    </div>
  </template>

<style scoped>
.auth-input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.75rem 0.875rem;
  font-size: 1rem;
  line-height: 1.25;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
}

.auth-submit {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background-color: #2563eb;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.auth-submit:hover {
  background-color: #1d4ed8;
}
</style>
  
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from 'vue-router';
import { authClient } from '../../lib/auth-client';
const router = useRouter();
const email = ref('');
const validEmail = ref(false);
const otp = ref('');
const ErrorMsg = ref('');
const Error = ref(false);
const firstName = ref('');
const lastName = ref('');


const props = defineProps<{
        signupForm:boolean
    }>();

watch(
  () => props.signupForm,
  () => {
    validEmail.value = false;
    otp.value = "";
    Error.value = false;
    ErrorMsg.value = "";
  },
);

async function sendLoginCode() {
  const result = await authClient.emailOtp.sendVerificationOtp({
    email: email.value,
    type: "sign-in",
  });
  if (result.error) {
    ErrorMsg.value =
      result.error.message ||
      result.error.statusText ||
      `Error ${result.error.status}: Failed to send code. Check SMTP settings in admin/.env.`;
    return false;
  }
  validEmail.value = true;
  ErrorMsg.value = "";
  return true;
}

const handleSubmit = async () => {
  Error.value = false;
  ErrorMsg.value = "";

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email.value.length === 0) {
    ErrorMsg.value = "Email field is required";
    Error.value = true;
    return;
  }
  if (!regex.test(email.value)) {
    ErrorMsg.value =
      "Invalid formatting for email. Example: example@email.com";
    Error.value = true;
    return;
  }

  if (props.signupForm) {
    if (firstName.value.length === 0) {
      ErrorMsg.value = "First Name is required";
    }
    if (lastName.value.length === 0) {
      ErrorMsg.value += ErrorMsg.value ? "\nLast Name is required" : "Last Name is required";
    }
    if (ErrorMsg.value) {
      Error.value = true;
      return;
    }
    try {
      await sendLoginCode();
      if (ErrorMsg.value) Error.value = true;
    } catch (err) {
      ErrorMsg.value =
        (err as Error)?.message ||
        "Network error: could not reach auth server.";
      Error.value = true;
    }
    return;
  }

  try {
    const userExists = await $fetch<boolean>("/api/user", {
      params: { email: email.value.trim() },
    });
    if (!userExists) {
      ErrorMsg.value =
        "No account found for this email. Use Sign up or check the address.";
      Error.value = true;
      return;
    }
    await sendLoginCode();
    if (ErrorMsg.value) Error.value = true;
  } catch (err) {
    ErrorMsg.value =
      (err as Error)?.message ||
      "Network error: could not reach auth server.";
    Error.value = true;
  }
};

const handleOTPSubmit = async () =>{
  Error.value = false;
  ErrorMsg.value = '';

  if(otp.value.length != 6){
    ErrorMsg.value = 'Invalid Code Length';
    Error.value = true;
    return;
  }
  else if(!/^\d+$/.test(otp.value)){
    ErrorMsg.value = 'Code should only contain numbers';
    Error.value = true;
    return;
  }
  const name = props.signupForm
    ? [firstName.value, lastName.value].filter(Boolean).join(' ')
    : undefined;

  const result = await authClient.signIn.emailOtp({
    email: email.value,
    otp: otp.value,
    ...(name ? { name } : {}),
  });
  console.log("EmailOTP result:",result)
  if(result.error){
    ErrorMsg.value = result.error.message || 'Code is invalid';
    Error.value = true;
  } else {
    Error.value = false;
    ErrorMsg.value = '';
    router.push('/Home');
  }
}
</script>

    