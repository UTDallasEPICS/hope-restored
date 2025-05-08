<script lang="ts" setup>
import ResourceDeck from "../components/Resource/ResourceDeck.vue";
import FilterDeck from "../components/Filter/FilterDeck.vue";
import PublicLandingModal from "../components/PublicLandingModal.vue";
import CategoryDeck from "../components/Category/CategoryDeck.vue";
import SideBar from "../components/Sidebar.vue"
import { ref } from "vue";
const sidebarVisible = ref(false)

</script>

<template>
  <div class="flex h-screen overflow-hidden fixed">
    <SideBar 
        v-model:visible="sidebarVisible" 
        styling="flex-row[3] flex-shrink-0 border-r-2 border-hrm-green bg-white shadow-lg shadow-gray-400 z-20"
        closedStyling="p-2 pt-4 bg-hrm-green shadow-lg shadow-gray-400 z-10"
        headerStyling="p-4 bg-hrm-green text-white-neutral text-center"
        buttonStyling="text-white-neutral hover:text-gray-400"
        headerText="Search Settings"
        :sidebarWidth=64
    >

        <FilterDeck class="border-b-2 border-gray-200"/>
        <!-- <CategoryDeck /> -->
    </SideBar>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div id="scroll-to-top-anchor">
        <!-- <PublicLandingModal /> -->
        <ResourceDeck />
      </div>
    </div>
  </div>
</template>

