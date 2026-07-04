<template>
  <section class="flex flex-col gap-4">
    <h1
      v-if="title"
      class="font-bold text-indigo-600 text-center mt-0 mb-8 text-[clamp(1.5rem,4.5vw+0.5rem,3.15rem)]"
    >
      {{ title }}
    </h1>
    <div
      class="hidden md:grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2"
      role="list"
      :aria-label="ariaLabel"
    >
      <CategoryButton
        v-for="cat in categories"
        :key="getCategoryLabel(cat)"
        :label="getCategoryLabel(cat)"
        :selected="selectedCategory === getCategoryLabel(cat)"
        @click="onSelect(cat)"
      >
      </CategoryButton>
    </div>

    <div class="md:hidden w-full relative">
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-lg"
        :aria-expanded="accordionOpen"
        aria-haspopup="listbox"
        aria-label="Select category"
        @click="accordionOpen = !accordionOpen"
      >
        <span class="flex-1 text-left">{{ selectedCategory || mobilePlaceholder }}</span>
        <i class="fas" :class="accordionOpen ? 'fa-chevron-up' : 'fa-chevron-down'" aria-hidden="true"></i>
        <span class="ml-2 inline-flex items-center text-gray-500" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-4 h-4" fill="currentColor">
            <path d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"/>
          </svg>
        </span>
      </button>
      <div v-show="accordionOpen" class="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto" role="listbox">
        <CategoryButton
          v-for="cat in categories"
          :key="getCategoryLabel(cat)"
          role="option"
          variant="menu"
          :show-icon="false"
          :label="getCategoryLabel(cat)"
          :selected="selectedCategory === getCategoryLabel(cat)"
          @click="onSelect(cat)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

type CategoryItem = string | { name: string };

const props = withDefaults(
  defineProps<{
    categories: CategoryItem[];
    selectedCategory: string;
    title?: string;
    ariaLabel?: string;
    mobilePlaceholder?: string;
  }>(),
  {
    title: "",
    ariaLabel: "Categories",
    mobilePlaceholder: "Select category",
  },
);

const emit = defineEmits<{
  (e: "select", category: string): void;
}>();

const accordionOpen = ref(false);

function getCategoryLabel(category: CategoryItem) {
  return typeof category === "string" ? category : category.name;
}

function onSelect(category: CategoryItem) {
  emit("select", getCategoryLabel(category));
  accordionOpen.value = false;
}
</script>