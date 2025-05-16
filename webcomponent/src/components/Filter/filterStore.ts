import { ref, computed } from "vue";
import FilterService from "./request";
import { useCategoryStore } from "../Category/categoryStore";
import { map } from "cypress/types/bluebird";
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
const categoryStore = useCategoryStore();
const categoryObjs = categoryStore.getFCategories.value;
const categories = categoryObjs.map(category => category.title);
function filterItemFromString(str : string) : FilterItem {
    let item : FilterItem = { label: str, isChecked: false }
    return item;
}
const categoryListItems = categories.map(categoryTitle => filterItemFromString(categoryTitle))
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
    const categoryGroup: FilterGroup = {
        title: "Categories",
        items: categoryListItems,
    };
    filterGroups.value = [languageGroup, costGroup, categoryGroup];
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

export function useFilterStore() {
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

export function getItemId(groupLabel: string, itemLabel: string) {
  return `${groupLabel}-${itemLabel}`;
}
