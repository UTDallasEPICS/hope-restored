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
    <!-- Pinned header for sorting options and filter info -->
    <div class="flex flex-row border-b-2 border-black-neutral justify-between items-center sticky top-0 z-10 bg-white">
        <ResourceIndicator />
        <SorterListBox />
    </div>
    <!-- Resource cards -->
    <div class="flex flex-auto flex-col p-5 pt-1 pb-50">
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
        <div v-if="isLoading"></div>
        <div v-else-if="resources.length > 0">
            <ResourceCard
                v-for="(card, index) in resources"
                :key="card.title"
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

        <div v-else class="p-4 text-2xl font-semibold">
        <p>No results found.</p>
        <span class="block mt-2 text-base font-normal text-gray-600">
            You can try the following:
        </span>
        <ul
            class="mt-2 list-disc list-inside text-base font-normal text-gray-600"
        >
            <li>Check the spelling or try alternate spellings.</li>
            <li>Try a more general search.</li>
            <li>Adjust your filters to broaden the results.</li>
        </ul>
        </div>
        <!-- Fixed Bottom Footer -->
        <div class="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-4 py-3">
            <p v-if="error" class="text-red-600">{{ error }}</p>
            <ResourcePagination v-if="resourceStore.getTotalPages.value > 1" />
        </div>
    </div>
</template>
