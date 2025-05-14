<script lang="ts" setup>
import { MagnifyingGlassCircleIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import ToolTip from '../ToolTip.vue'
import { useResourceStore } from "../Resource/resourceStore";
import { useCategoryStore } from "../Category/categoryStore";
import { useSearchStore } from "./searchStore";
import {ref, watch} from 'vue'
const searchStore = useSearchStore();
const categoryStore = useCategoryStore();
const resourceStore = useResourceStore();
const searchResources = () => {
  emit("searchResources");
  searchStore.setSearchTerm(search.value);
  resourceStore.loadResourcesBySearchTerm(search.value);
  categoryStore.clearSelectedCategory();
};
const emit = defineEmits(["searchResources"]);
const search = ref("");
const location = ref("");

const clearSearch = () => {
  search.value = "";
  searchResources(); //refresh results on clear
};

watch(
  // Used to sync between the search field of the Landing Modal
  // and the search field of the Wordpress page
  () => searchStore.getSearchTerm.value,
  (value) => {
    search.value = value;
  }
);
</script>

<template>
  <form @submit.prevent="searchResources" class="flex flex-row flex-auto ">
    <!-- Input Wrapper for relative positioning -->
    <div class="relative flex-1">
        <input
            v-model="search"
            id="search"
            type="text"
            placeholder="What are you looking for today?"
            class="w-full border-2 border-hrm-green hover:border-hrm-dark-green p-2 pr-8 rounded-md text-white-neutral"
        />

        <!-- Clear Button (shown only when search has text) -->
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 h-full">
            <ToolTip
                text="Clear Text" 
                relativePosition="left"
                styling="bg-hrm-dark-green text-white text-sm whitespace-nowrap p-2 rounded z-10"
            >
                <button
                    v-if="search"
                    type="button"
                    @click="clearSearch"
                    class="text-white-neutral hover:text-gray-400"
                >
                    <XMarkIcon class="w-6 h-6"/>
                </button>
            </ToolTip>
        </div>
    </div>
    <!--TODO: Add location filtering-->
    <!-- <input
      v-model="location"
      id="location"
      type="text"
      placeholder="Enter your zip code"
      class="border p-2 rounded-md ml-2 flex-1"
    /> -->

    <button type="submit" class="p-2 ml-2 text-white-neutral bg-hrm-green rounded-md hover:bg-hrm-dark-green ">
      <MagnifyingGlassCircleIcon class="w-6 h-6" />
    </button>
  </form>
</template>
