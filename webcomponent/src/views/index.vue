<script lang="ts" setup>
import NavBar from "../components/PublicNavBar.vue";
import ResourceDeck from "../components/Resource/ResourceDeck.vue"


</script>

<template>
  <div>
    <NavBar />
    <div class="flex flex-row flex-auto">
      <div class="flex grow-[3]"><ResourceDeck /></div>
      
    </div>
  </div>
</template>
