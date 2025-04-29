
<script lang="ts" setup>
import { default as Category } from "./Category.vue";
import { ref, computed } from 'vue';
import { type CategoryProps } from './Category.vue'
import CategoryService from './request'
import { useLoadingStore } from "../Loader/loadingStore";
import { CakeIcon, UserIcon, HomeIcon } from '@heroicons/vue/24/solid'
import { Prisma } from '@prisma/client'
type CategoryDB = Prisma.GroupGetPayload<{}>

const categories = ref<CategoryProps[]>([])
const selectedCategory = ref<string | null>(null)
const isLoading = ref(false)
const error = ref(null)
loadCategory()

defineProps({
  itemSize: {
    type: String,
    default: "1rem",
  },
  wrap: {
    type: Boolean,
    default: false,
  },
});

async function loadCategory() {
  isLoading.value = true
  error.value = null
  try {
    const response = await CategoryService.fetchCategories()
    categories.value = response.map(toCategoryProps)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

function useCategoryStore() {
  const getFCategories = computed(() => categories.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)
  const getSelectedCategory = computed(() => selectedCategory.value)

  function setSelectedCategory(categoryTitle: string) {
    selectedCategory.value = categoryTitle
  }

  function clearSelectedCategory() {
    selectedCategory.value = null
  }

  return {
    getFCategories,
    getIsLoading,
    getError,
    getSelectedCategory,
    setSelectedCategory,
    clearSelectedCategory,
  }
}

function toCategoryProps(category: CategoryDB): CategoryProps {
  return {
    id: category.id,
    title: category.name,
    icon: CATEGORY_ICONS[category.name] || CATEGORY_ICONS.Default,
    isClicked: false,
  }
}

const CATEGORY_ICONS: { [key: string]: typeof CakeIcon } = {
  'Category 1': UserIcon,
  'Category 2': HomeIcon,
  Default: CakeIcon,
}

const categoryStore = useCategoryStore();
console.log("categories: ", categories);
const isLoadingValue = useCategoryStore().getIsLoading;

const loadingStore = useLoadingStore();
loadingStore.registerLoading(isLoadingValue);

// const resourceStore = useResourceStore();
const setSelectedCategory = (category: string) => {
  emit("selectCategory", category);
  categoryStore.setSelectedCategory(category);
//   resourceStore.loadResourcesByCategory(category);
};
const emit = defineEmits(["selectCategory"]);
</script>

<template>
  <div
    class="flex flex-col flex-auto text-white-neutral p-4"
    :style="{ fontSize: itemSize }"
    :class="
      wrap ? 'flex-wrap justify-center gap-y-10' : 'flex-nowrap justify-between'
    "
  >

    <p>Categories:</p>
    <br>
    <p v-if="isLoading">Loading...</p>
    <Category
      v-else-if="categories.length"
      v-for="category in categories"
      :key="category.title"
      :id="category.id"
      :title="category.title"
      :icon="category.icon"
      :isClicked="category.title === selectedCategory"
      @selectCategory="setSelectedCategory"
      class="flex flex-auto basis-2"
    />
    <p v-else if>No categories found.</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>
