    <!-- Left half: Inventory display for selected category -->
<template>
    <div
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 min-h-0 h-full flex flex-col overflow-y-auto overflow-x-hidden"
    >
        <h2
        v-if="selectedCategory"
        class="text-[1.15rem] font-semibold text-indigo-600 mb-4 mt-0"
        >
        {{ selectedCategory }} – Current Inventory
        </h2>
        <h2 v-else class="text-[1.15rem] font-normal text-gray-500 mb-4 mt-0">
        Select a category above to view inventory
        </h2>
        <div v-if="selectedCategory" class="flex flex-col gap-3">
        <div
            class="flex gap-2 text-base pb-3 mb-1 border-b border-gray-200"
        >
            <span class="font-semibold text-gray-800 min-w-[140px]"
            >Total quantity:</span
            >
            <span class="text-gray-900">{{
            categoryDetails.catDetails[0]
                ? categoryDetails.catDetails[0].quantity
                : 0
            }}</span>
        </div>
        <p
            v-if="
            isOtherItems && !categoryDetails.catDetails[0]?.genders?.length
            "
            class="text-sm text-gray-500"
        >
            No other items in inventory.
        </p>
        <template v-if="!isSimpleCategory || isOtherItems">
            <div
            v-for="row in visibleCategoryGenders"
            :key="row.name"
            class="border border-gray-200 rounded-lg p-3"
            >
            <h3 class="text-[1rem] font-semibold text-indigo-600 mb-2">
                {{ row.name }}
            </h3>
            <p
                v-if="isShoes && !genderHasAnyInventory(row)"
                class="text-sm text-gray-500"
            >
                No {{ row.name }} shoes in Inventory
            </p>
            <table
                v-else
                class="w-full text-[0.9rem] border border-gray-200 rounded-md overflow-hidden"
                :aria-label="`${row.name} quantities by size`"
            >
                <thead class="bg-gray-50">
                <tr>
                    <th class="px-3 py-2 text-left border-b border-gray-200">
                    {{
                        isOtherItems ? "Item" : isShoes ? "Shoe size" : "Size"
                    }}
                    </th>
                    <th class="px-3 py-2 text-right border-b border-gray-200">
                    Quantity
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr
                    v-for="(inf, idx) in row.info"
                    :key="
                    isOtherItems
                        ? row.name + '-' + inf.size + '-' + idx
                        : inf.size
                    "
                    class="odd:bg-white even:bg-gray-50"
                >
                    <td class="px-3 py-2 border-b border-gray-100">
                    {{ inf.size }}
                    </td>
                    <td class="px-3 py-2 border-b border-gray-100 text-right">
                        {{ inf.quantity ? inf.quantity : 0 }}
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
        </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { shoeSizeOptions } from "../../composables/inventorySizes";

type CategoryDetail = {
  category: string;
  quantity: number;
  genders: { name: string; info: { size: string; quantity: number }[] }[];
};

const props = defineProps<{
  selectedCategory: string;
  categoryDetails: { catDetails: CategoryDetail[] };
  visibleGenders: string[];
}>();

const isShoes = computed(() => props.selectedCategory === "Shoes");
const simpleCategories = ["Snack Packs", "Hygiene Packs", "Blankets"];
const isOtherItems = computed(() => props.selectedCategory === "Other Items");
const isSimpleCategory = computed(() =>
  simpleCategories.includes(props.selectedCategory),
);

const visibleCategoryGenders = computed(() => {
  const genders = props.categoryDetails.catDetails[0]?.genders || [];
  if (props.selectedCategory !== "Dresses") {
    return genders
      .filter((gender) => gender.name !== "Unisex")
      .sort(
        (a, b) =>
          props.visibleGenders.indexOf(a.name) -
          props.visibleGenders.indexOf(b.name),
      );
  }
  return genders
    .filter((gender) => gender.name === "Female")
    .sort(
      (a, b) =>
        props.visibleGenders.indexOf(a.name) -
        props.visibleGenders.indexOf(b.name),
    );
});

// Determines if sizes are for clothes or shoes
function sizesToShowForGender(gender: {
  name: string;
  info: { size: string; quantity: number }[];
}): string[] {
  return shoeSizeOptions.filter((s) =>
    gender.info.some((row) => row.size === s && row.quantity > 0),
  );
}

function genderHasAnyInventory(gender: {
  name: string;
  info: { size: string; quantity: number }[];
}): boolean {
  if (!isShoes.value) return true;
  return sizesToShowForGender(gender).length > 0;
}
</script>