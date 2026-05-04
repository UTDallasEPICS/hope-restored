<!-- components/HeaderComponent.vue -->
<template>
  <header class="shrink-0 bg-white">
    <!-- Top bar: site name -->
    <div class="bg-white p-[clamp(0.5rem,1.2vw,0.75rem)_clamp(1rem,3vw,2rem)] border-b">
      <div class=" max-w-350 m-0">
        <NuxtLink to="/Home" class="no-underline text-inherit inline-flex items-center" aria-label="Go to home page">
          <h1 class="m-0 font-sans text-[clamp(1.25rem,2.5vw+0.5rem,1.65rem)] font-bold text-[#878787] tracking-[0.06em]">Hope Restored Missions</h1>
        </NuxtLink>
      </div>
    </div>
    <!-- Bottom bar: navigation -->
    <nav class="bg-white px-[clamp(0.5rem,2vw,1.5rem)] border-b border-black/8 print:hidden" aria-label="Main navigation">
      <ul class="list-none m-0 p-0 flex flex-wrap items-center gap-x-[clamp(0.75rem,3vw,1.5rem)] gap-y-[clamp(0.25rem,1.5vw,0.5rem)] max-w-350 min-h-[clamp(2.25rem,5vw,2.75rem)]">
        <template v-if="isAuthenticated">
          <li class="inline-flex">
            <NuxtLink to="/Home" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" 
              exact-active-class="!text-black !border-b-black/20">
              <i class="fas fa-home text-[0.95em] opacity-90" aria-hidden="true"></i>
              <span>Home</span>
            </NuxtLink>
          </li>
          <li class="inline-flex">
            <NuxtLink to="/reports" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" 
              exact-active-class="!text-black !border-b-black/20">
              <i class="fas fa-chart-bar text-[0.95em] opacity-90" aria-hidden="true"></i>
              <span>Reports</span>
            </NuxtLink>
          </li>
          <li class="inline-flex">
            <NuxtLink to="/inventory" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" 
              exact-active-class="!text-black !border-b-black/20">
              <i class="fas fa-box text-[0.95em] opacity-90" aria-hidden="true"></i>
              <span>Inventory</span>
            </NuxtLink>
          </li>
          <li class="inline-flex">
            <NuxtLink to="/checkout" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" 
              exact-active-class="!text-black !border-b-black/20">
              <i class="fas fa-shopping-cart text-[0.95em] opacity-90" aria-hidden="true"></i>
              <span>Checkout</span>
            </NuxtLink>
          </li>
          <li class="inline-flex">
            <button type="button" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" @click="handleSignOut">
              <i class="fas fa-right-from-bracket text-[0.95em] opacity-90" aria-hidden="true"></i>
              <span>Logout</span>
            </button>
          </li>
        </template>
        <li v-else>
          <NuxtLink to="/login" class="inline-flex items-center gap-[0.35em] px-[clamp(0.5rem,1.2vw,0.75rem)] py-[clamp(0.4rem,1vw,0.5rem)] font-sans 
              text-[clamp(0.95rem,1.2vw+0.5rem,1.1rem)] font-bold tracking-[0.05em] text-[#878787] no-underline border-t-0 border-l-0 border-r-0 bg-transparent cursor-pointer border-b-2 
              border-b-transparent -mb-px transition-[color,border-color] duration-150 ease-in-out hover:text-[#555]" 
              exact-active-class="!text-black !border-b-black/20">
            <i class="fas fa-right-to-bracket text-[0.95em] opacity-90" aria-hidden="true"></i>
            <span>Login</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { authClient } from "../../lib/auth-client";



const sessionState = authClient.useSession();
const isAuthenticated = computed(() => Boolean(sessionState.value?.data));

const handleSignOut = async () => {
  try {
    await authClient.signOut();
  } finally {
    await navigateTo("/login");
  }
};
</script>

