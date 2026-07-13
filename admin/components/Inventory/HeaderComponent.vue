<!-- components/HeaderComponent.vue -->
<template>
  <header class="site-header">
    <!-- Top bar: site name -->
    <div class="header-top">
      <div class="header-top-inner">
        <NuxtLink to="/Home" class="site-name-link" aria-label="Go to home page">
          <h1 class="site-name">Hope Restored Missions</h1>
        </NuxtLink>
      </div>
    </div>
    <!-- Bottom bar: navigation -->
    <nav class="header-nav" aria-label="Main navigation">
      <ul class="nav-list" :class="{ 'nav-list--unauth': !isAuthenticated }">
        <template v-if="isAuthenticated">
          <li>
            <NuxtLink to="/Home" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-home" aria-hidden="true"></i>
              <span>Home</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/reports" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-chart-bar" aria-hidden="true"></i>
              <span>Reports</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/activity" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-clock-rotate-left" aria-hidden="true"></i>
              <span>Activity</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/inventory" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-box" aria-hidden="true"></i>
              <span>Inventory</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/checkout" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-shopping-cart" aria-hidden="true"></i>
              <span>Checkout</span>
            </NuxtLink>
          </li>
          <li>
            <button type="button" class="nav-link" @click="handleSignOut">
              <i class="fas fa-right-from-bracket" aria-hidden="true"></i>
              <span>Logout</span>
            </button>
          </li>
        </template>
        <template v-else>
          <li>
            <NuxtLink to="/Home" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-home" aria-hidden="true"></i>
              <span>Home</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/login" class="nav-link" exact-active-class="nav-link--active">
              <i class="fas fa-right-to-bracket" aria-hidden="true"></i>
              <span>Login</span>
            </NuxtLink>
          </li>
        </template>
      </ul>
    </nav>
  </header>
</template>



<script setup lang="ts">
import { computed, watch } from "vue";
import { navigateTo, useRoute } from "nuxt/app";
import { authClient } from "../../lib/auth-client";

const sessionState = authClient.useSession();
const isAuthenticated = computed(() => Boolean(sessionState.value?.data));
const route = useRoute();

if (typeof window !== "undefined") {
  watch(
    () => route.fullPath,
    (path) => {
      sessionStorage.setItem("hr:lastRouteBeforeReload", path);
    },
    { immediate: true },
  );

  watch(
    isAuthenticated,
    (authed) => {
      if (authed && route.path === "/login") {
        void navigateTo("/Home");
      }
    },
    { immediate: true },
  );
}

const handleSignOut = async () => {
  try {
    await authClient.signOut();
  } finally {
    await navigateTo("/login");
  }
};


</script>

<style scoped>
.site-header {
  flex-shrink: 0;
  background: #fff;
}

/* Top bar: site name */
.header-top {
  background: #fff;
  padding: clamp(0.5rem, 1.2vw, 0.75rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.header-top-inner {
  max-width: 1400px;
  margin: 0;
}

.site-name {
  margin: 0;
  font-family: 'sans-serif', Arial;
  font-size: clamp(1.25rem, 2.5vw + 0.5rem, 1.65rem);
  font-weight: 700;
  color: #878787;
  letter-spacing: 0.06em;
}

.site-name-link {
  text-decoration: none;
  color: inherit;
  display: inline-flex;
  align-items: center;
}

/* Bottom bar: nav links */
.header-nav {
  background: #fff;
  padding: 0 clamp(0.25rem, 1.5vw, 1.5rem);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  width: 100%;
  max-width: 1400px;
  min-height: clamp(2.35rem, 5.5vw, 3.1rem);
  gap: clamp(0.125rem, 0.8vw, 0.75rem);
}

.nav-list li {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
}

.nav-list--unauth li {
  flex: 0 0 auto;
}

.nav-list--unauth .nav-link {
  width: auto !important;
  justify-content: flex-start !important;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  gap: clamp(0.1em, 0.4vw, 0.35em);
  padding: clamp(0.45rem, 1vw, 0.65rem) clamp(0.1rem, 0.6vw, 0.75rem);
  font-family: 'sans-serif', Arial;
  font-size: clamp(0.625rem, 1.6vw + 0.35rem, 1.1rem);
  font-weight: 700;
  letter-spacing: clamp(0, 0.02em, 0.05em);
  white-space: nowrap;
  color: #878787;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s ease, border-color 0.15s ease;
}

@media (max-width: 520px) {
  .nav-link i {
    display: none;
  }
}

.nav-link:hover {
  color: #555;
}

.nav-link--active {
  color: #000000;
  border-bottom-color: rgba(0, 0, 0, 0.2);
}

.nav-link i {
  font-size: 0.95em;
  opacity: 0.9;
}
</style>
