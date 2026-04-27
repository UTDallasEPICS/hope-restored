<template>
    <div>
      <form @submit.prevent="handleSubmit" v-if="!validEmail" class="flex flex-col items-center w-full">
        <h2 class="text-xl font-semibold mb-4">{{props.signupForm? "Sign up" : "Login"}}</h2>
        <p class="whitespace-pre-wrap" v-if="Error">{{ ErrorMsg }}</p>
        <div v-if="props.signupForm" class="flex gap-5">
          <input
            type="text"
            v-model="firstName"
            placeholder="First Name"
            class="border p-2 w-full mb-4"
          />
          <input
            type="text"
            v-model="lastName"
            placeholder="Last Name"
            class="border p-2 w-full mb-4"
          />
        </div>
        <input
          type="text"
          v-model="email"
          placeholder="example@email.com"
          class="border p-2 w-full mb-4"
        />
        <button
          type="submit"
          class="px-4 py-2 rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
        >
        <span>Submit</span>
          
        </button>
      </form>
      <form @submit.prevent="handleOTPSubmit" v-if="validEmail" class="flex flex-col items-center">
       <p class="whitespace-pre-wrap" v-if="Error">{{ ErrorMsg }}</p>
        <input
          type="text"
          v-model="otp"
          placeholder="Enter code here"
          class="border p-2 w-full mb-4"
        />
        <button
          type="submit"
          class="px-4 py-2 rounded bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
        >
          Submit
        </button>
      </form> 
    </div>
  </template>
  
<script setup lang="ts">
import {ref} from 'vue'
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

const handleSubmit = async () => {
  Error.value = false;
  ErrorMsg.value = '';

  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(email.value.length == 0){
    ErrorMsg.value = 'Email field is required';
  }
  else if(!regex.test(email.value)){
    ErrorMsg.value = 'Invalid formatting for email\tExample:\texample@email.com';
  }
  else{
    if(props.signupForm){
      if(firstName.value.length == 0){
        ErrorMsg.value += 'First Name is required';
      }
      if(lastName.value.length == 0){
        ErrorMsg.value += '\nLast Name is required';
      }
      if(ErrorMsg.value !== ''){
        Error.value = true;
        return;
      }
    }

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: email.value,
        type: 'sign-in',
      });

      if(result.error){
        ErrorMsg.value = result.error.message || result.error.statusText || `Error ${result.error.status}: Failed to send code. Check SMTP settings in admin/.env.`;
        Error.value = true;
      } else {
        validEmail.value = true;
        Error.value = false;
        ErrorMsg.value = '';
      }
    } catch (err) {
      ErrorMsg.value = (err as Error)?.message || 'Network error: could not reach auth server.';
      Error.value = true;
    }
  }
  if(ErrorMsg.value !== ''){
    Error.value = true;
  }
}

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

    