<!-- components/HeaderComponent.vue -->
<template>
  <header class="site-header">
    <!-- Top bar: site name -->
    <div class="header-top">
      <div class="header-top-inner">
        <h1 class="site-name">Hope Restored Missions</h1>
      </div>
    </div>
    <!-- Bottom bar: navigation -->
    <nav class="header-nav" aria-label="Main navigation">
      <ul class="nav-list">
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
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'HeaderComponent',
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

/* Bottom bar: nav links */
.header-nav {
  background: #fff;
  padding: 0 clamp(0.5rem, 2vw, 1.5rem);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: clamp(0.25rem, 1.5vw, 0.5rem) clamp(0.75rem, 3vw, 1.5rem);
  max-width: 1400px;
  min-height: clamp(2.25rem, 5vw, 2.75rem);
}

.nav-list li {
  display: inline-flex;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  padding: clamp(0.4rem, 1vw, 0.5rem) clamp(0.5rem, 1.2vw, 0.75rem);
  font-family: 'sans-serif', Arial;
  font-size: clamp(0.95rem, 1.2vw + 0.5rem, 1.1rem);
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #878787;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s ease, border-color 0.15s ease;
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
