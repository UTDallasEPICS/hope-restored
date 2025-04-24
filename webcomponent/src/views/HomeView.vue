<script lang="ts" setup>
import ResourceDeck from "../components/Resource/ResourceDeck.vue";
import FilterDeck from "../components/Filter/FilterDeck.vue";
import PublicLandingModal from "../components/PublicLandingModal.vue";
import CategoryDeck from "../components/Category/CategoryDeck.vue";

</script>

<template>
  <div class="flex h-screen overflow-hidden fixed">
    <!-- Sidebar -->
    <div class="w-64 flex-row[3] flex-shrink-0 border-r border-gray-200 bg-white">
        <FilterDeck class="border-b-2 border-gray-200"/>
        <CategoryDeck />
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div id="scroll-to-top-anchor">
        <!-- <PublicLandingModal /> -->
        <ResourceDeck />
      </div>
    </div>
  </div>
</template>

