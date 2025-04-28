<template>
  <div class="p-4 space-y-4 flex flex-col flex-auto">
    <p>Filters:</p>
    <TransitionRoot v-if="isLoadingValue"
      :show="isLoadingValue"
      enter="transition-opacity duration-75"
      enter-from="opacity-0"
      enter-to="opacity-100"
      leave="transition-opacity duration-1000000"
      leave-from="opacity-100"
      leave-to="opacity-0"
      class="relative w-full z-5 bg-white"
    >
      <FilterSkeleton />
      <FilterSkeleton />
      <FilterSkeleton />
    </TransitionRoot>
    <div v-else-if="filterGroupsValue.length > 0">
      <FilterDisclosure
        v-for="(group, index) in filterGroups"
        :key="index"
        :group="group"
      />
    </div>
    <p v-else>No filters found.</p>
    <p v-if="errorValue">{{ errorValue }}</p>
  </div>
</template>

<script lang="ts" setup>
import FilterDisclosure from "./FilterDisclosure.vue";
import FilterSkeleton from "./FilterSkeleton.vue";
import { TransitionRoot } from "@headlessui/vue";
import { ref, computed } from "vue";
import FilterService from "../Filter/request";
export interface FilterItem {
  label: string;
  isChecked: boolean;
}
export interface FilterGroup {
  title: string;
  items: FilterItem[];
}
const filterGroups = ref<FilterGroup[]>([]);
const isLoading = ref(false);
const error = ref(null);
loadFilter();

async function loadFilter() {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await FilterService.fetchLanguages();
    const languageGroup: FilterGroup = {
      title: "Languages",
      items: [],
    };
    languageGroup.items = response.map((language) => ({
      label: language,
      count: 0,
      isChecked: false,
    }));
    const costGroup: FilterGroup = {
      title: "Cost",
      items: [
        { label: "Free", isChecked: false },
        { label: "Paid", isChecked: false },
      ],
    };
    filterGroups.value = [languageGroup, costGroup];
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function getItemById(groupLabel: string, itemLabel: string) {
  const group = filterGroups.value.find((group) => group.title === groupLabel);
  if (!group) return null;
  return group.items.find((item) => item.label === itemLabel);
}

function useFilterStore() {
  const getFilterGroups = computed(() => filterGroups.value);
  const getIsLoading = computed(() => isLoading.value);
  const getError = computed(() => error.value);

  function toggleFilter(groupLabel: string, itemLabel: string) {
    const item = getItemById(groupLabel, itemLabel);
    if (!item) return;
    item.isChecked = !item.isChecked;
  }

  function clearFilters() {
    filterGroups.value.forEach((group) => {
      group.items.forEach((item) => {
        item.isChecked = false;
      });
    });
  }

  return {
    getFilterGroups,
    getIsLoading,
    getError,
    toggleFilter,
    clearFilters,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getItemId(groupLabel: string, itemLabel: string) {
  return `${groupLabel}-${itemLabel}`;
}

const filterStore = useFilterStore();
const filterGroupsValue = filterStore.getFilterGroups;
const errorValue = filterStore.getError;
const isLoadingValue = filterStore.getIsLoading;
</script>
