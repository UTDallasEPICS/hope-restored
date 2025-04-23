<script lang="ts" setup>
import ResourceCard from "./ResourceCard.vue";
import ResourceIndicator from "./ResourceIndicator.vue";
import ResourceSkeleton from "./ResourceSkeleton.vue";
import ResourcePagination from "./ResourcePagination.vue";
import SorterListBox from "../Filter/SorterListBox.vue";
import { useResourceStore } from "./resourceStore";
import { TransitionRoot } from "@headlessui/vue";

const resourceStore = useResourceStore();
const resources = resourceStore.getResourceProps;
const isLoading = resourceStore.getIsLoading;
const error = resourceStore.getError;

const getIndex = (index: number) => {
  const currentPage = resourceStore.getCurrentPage.value;
  const pageSize = resourceStore.getPageSize.value;
  return (currentPage - 1) * pageSize + index + 1;
};
</script>

<template>
    <div class="flex flex-col h-screen overflow-hidden">
      <!-- Header pinned to the top -->
      <header class="flex flex-row justify-between items-center border-b-2 border-gray-200 bg-white p-1 z-10">
        <ResourceIndicator />
        <SorterListBox />
      </header>
  
      <!-- Scrollable content area -->
      <main class="flex-1 overflow-y-auto">
        <!-- This is your resource card container -->
        <TransitionRoot
          :show="isLoading"
          enter="transition-opacity duration-75"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
          class="relative w-full z-5 bg-white"
        >
          <ResourceSkeleton />
          <ResourceSkeleton />
          <ResourceSkeleton />
        </TransitionRoot>
  
        <div v-if="!isLoading && resources.length > 0">
          <ResourceCard
            v-for="(card, index) in resources"
            :key="card.id"
            :id="card.id"
            :index="getIndex(index)"
            :title="card.title"
            :description="card.description"
            :demographics="card.demographics"
            :phoneNumbers="card.phoneNumbers"
            :emails="card.emails"
            :addresses="card.addresses"
            :languages="card.languages"
            :eligibility="card.eligibility"
            :cost="card.cost"
            :link="card.link"
            :createdAt="card.createdAt"
            :updatedAt="card.updatedAt"
          />
        </div>
  
        <div v-else-if="!isLoading" class="text-gray-600">
          <p class="text-2xl font-semibold">No results found.</p>
          <span class="block mt-2 text-base">You can try the following:</span>
          <ul class="list-disc list-inside mt-2 text-base">
            <li>Check spelling or alternate spellings.</li>
            <li>Try a more general search.</li>
            <li>Adjust your filters to broaden results.</li>
          </ul>
        </div>
  
        <p v-if="error" class="text-red-600 mt-4">{{ error }}</p>
      </main>
  
      <!-- Pinned footer -->
      <footer class="p-2 border-t-2 border-gray-200 bg-white z-20 pb-40">
        <ResourcePagination
          v-if="resourceStore.getTotalPages.value > 1"
        />
      </footer>
    </div>
  </template>
  