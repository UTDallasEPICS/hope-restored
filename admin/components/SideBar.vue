<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const windowHeight = ref(window.innerHeight);
const windowWidth = ref(window.innerWidth);

const sideBarHeight = computed(() => windowHeight.value);
const sideBarWidth = computed(() => windowWidth.value * 0.2);

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.addEventListener("resize", handleResize);
});

function handleResize() {
  windowWidth.value = window.innerWidth;
  windowHeight.value = window.innerHeight;
}
</script>

<template>
  <svg
    :width="sideBarWidth"
    :height="sideBarHeight"
    style="position: fixed; top: 0; left: 0"
  >
    <rect
      x="0"
      y="0"
      :width="sideBarWidth"
      :height="sideBarHeight"
      fill="black"
    />
    <text x="50%" y="20%" text-anchor="middle" fill="white" font-size="25">
      Inventory
    </text>
    <text x="50%" y="24%" text-anchor="middle" fill="white" font-size="18">
      Link 1
    </text>
    <text x="50%" y="28%" text-anchor="middle" fill="white" font-size="18">
      Link 2
    </text>
    <text x="50%" y="32%" text-anchor="middle" fill="white" font-size="18">
      Link 3
    </text>
    <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="25">
      Information
    </text>
    <text x="50%" y="44%" text-anchor="middle" fill="white" font-size="18">
      Link 1
    </text>
    <text x="50%" y="48%" text-anchor="middle" fill="white" font-size="18">
      Link 2
    </text>
    <text x="50%" y="52%" text-anchor="middle" fill="white" font-size="18">
      Link 3
    </text>
  </svg>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>
