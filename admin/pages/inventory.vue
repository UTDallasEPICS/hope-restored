<!-- pages/inventory.vue -->
<template>
  <div
    class="flex flex-col min-h-screen lg:min-h-0 lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-hidden"
  >
    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden bg-gray-100 p-4 md:p-6 lg:p-8 gap-4 font-sans"
    >
      <!-- Top 1/3: Category selection -->
      <CategorySelector
        :categories="categories"
        :selected-category="selectedCategory"
        title="Select a Category to Add"
        aria-label="Inventory categories"
        mobile-placeholder="Select category"
        @select="selectCategory"
      />

      <!-- Bottom 2/3: Left = DB display, Right = Add form -->
      <section
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0 items-stretch"
        :class="!selectedCategory ? 'grid-rows-2 lg:grid-rows-none' : ''"
      >
        <!-- Left half: Inventory display for selected category -->
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
                        {{ inf.quantity }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </div>

        <!-- Right half: Add form (match left panel height) -->
        <InOutForm
          class="h-full min-h-0"
          :inForm="true"
          :selectedCategory="selectedCategory"
          :isSimpleCategory="isSimpleCategory"
          :isOtherCategory="isOtherItems"
          :shoeSizes="shoeSizeOptions"
          :apparelSizes="sizeOptions"
          :visibleGenders="visibleGenders"
          :items="items"
          :submitForm="confirmAddition"
          empty-prompt="Select a category above to add items"
        />
      </section>

      <!-- Addition success popup -->
      <div
        v-if="showAdditionSuccessPopup"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="alertdialog"
        aria-labelledby="success-title"
        aria-describedby="success-message"
      >
        <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
          <h2 id="success-title" class="text-lg font-semibold text-green-600">
            Success
          </h2>
          <p id="success-message" class="text-sm text-gray-700">
            Your addition has been added to the inventory.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              @click="showAdditionSuccessPopup = false"
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      <!-- Empty inputs error popup -->
      <div
        v-if="showEmptyInputError"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="alertdialog"
        aria-labelledby="error-title"
        aria-describedby="error-message"
      >
        <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
          <h2 id="error-title" class="text-lg font-semibold text-red-600">
            Missing Information
          </h2>
          <p id="error-message" class="text-sm text-gray-700">
            {{
              isSizedCategory
                ? "Please enter at least one valid quantity (1 or greater). Leave boxes empty to skip sizes."
                : isSimpleCategory && !isOtherItems
                ? "Please enter a quantity."
                : isOtherItems
                  ? "Please fill in item name, category, and quantity."
                  : "Please fill in all fields: quantity, gender, and size are required before confirming."
            }}
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              @click="showEmptyInputError = false"
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      <!-- Add failed error popup -->
      <div
        v-if="addErrorMessage"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="alertdialog"
        aria-labelledby="add-error-title"
      >
        <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
          <h2 id="add-error-title" class="text-lg font-semibold text-red-600">
            Could not add item
          </h2>
          <p class="text-sm text-gray-700">{{ addErrorMessage }}</p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              @click="addErrorMessage = ''"
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      <!-- Addition confirmation popup -->
      <div
        v-if="showAdditionConfirmPopup"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="alertdialog"
        aria-labelledby="confirm-addition-title"
        aria-describedby="confirm-addition-message"
      >
        <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
          <h2
            id="confirm-addition-title"
            class="text-lg font-semibold text-gray-900"
          >
            Confirm Addition
          </h2>
          <p id="confirm-addition-message" class="text-sm text-gray-700">
            Please confirm the following addition details are correct.
          </p>
          <ul class="mt-2 pl-5 list-disc text-sm text-gray-700">
            <li
              v-for="(item, idx) in additionPreviewItems"
              :key="`${item.category}-${item.gender}-${item.size}-${idx}`"
            >
              <strong>{{ item.category }}</strong>
              <span v-if="item.gender"> - {{item.gender }}</span>
              <span v-if="item.size"> - {{ item.size }}</span>
              : {{ item.quantity }}
            </li>
          </ul>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
              @click="showAdditionConfirmPopup = false"
            >
              Go Back
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              @click="confirmPendingAdditions"
            >
              Confirm Addition
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import InOutForm from "../components/Inventory/InOutForm.vue";
import { formatApiError } from "../utils/format-api-error";

const categories = [
  "Shirts",
  "Pants",
  "Jackets",
  "Dresses",
  "Underwear",
  "Shoes",
  "Snack Packs",
  "Hygiene Packs",
  "Blankets",
  "Other Items"
];
const sizeOptions = ["XS", "S", "M", "L", "XL","2XL","3XL","4XL+"];
const shoeSizeOptions = (() => {
  const sizes: string[] = [];
  for (let n = 5; n <= 14.5; n += 0.5) sizes.push(String(n));
  return sizes;
})();
let visibleGenders = ["Male", "Female", "Child"];
const items= ref<{name: string, gender:string, hasSize: boolean, size:string, quantity:number, otherItemName: string}[][]>([]);



type CategoryDetail = {
  category: string;
  quantity: number;
  genders: { name: string; info: { size: string; quantity: number }[] }[];
};

const selectedCategory = ref("");
const categoryDetails = ref<{
  catDetails: CategoryDetail[];
}>({
  catDetails: [],
});
const showEmptyInputError = ref(false);
const showAdditionSuccessPopup = ref(false);
const addErrorMessage = ref("");
const showAdditionConfirmPopup = ref(false);
const inventory = ref<any[]>([]);
type AdditionPayload = {
    name: string;
    gender: string;
    hasSize: boolean;
    size: string;
    quantity: number;
    otherItemName: string;
};
const pendingAdditionPayloads = ref<AdditionPayload[]>([]);
const additionPreviewItems = ref<
  { category: string; gender: string; size: string; quantity: number }[]
>([]);

const isShoes = computed(() => selectedCategory.value === "Shoes");
const simpleCategories = ["Snack Packs", "Hygiene Packs", "Blankets"];
const isOtherItems = computed(() => selectedCategory.value === "Other Items");
const isSimpleCategory = computed(() =>
  simpleCategories.includes(selectedCategory.value),
);
const isSizedCategory = computed(
  () => !isSimpleCategory.value && !isOtherItems.value,
);
const formSizeOptions = computed(() =>
  isShoes.value ? shoeSizeOptions : sizeOptions,
);
const visibleCategoryGenders = computed(() => {
  if(selectedCategory.value !== "Dresses"){
    return (categoryDetails.value.catDetails[0]?.genders || [])
    .filter((gender) => gender.name !== "Unisex")
    .sort(
      (a, b) =>
        visibleGenders.indexOf(a.name) - visibleGenders.indexOf(b.name),
    )
  }
  else{
    return (categoryDetails.value.catDetails[0]?.genders || [])
    .filter((gender) => gender.name === "Female")
    .sort(
      (a, b) =>
        visibleGenders.indexOf(a.name) - visibleGenders.indexOf(b.name),
    )
  }
}); 


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

function selectCategory(catName:string){
  selectedCategory.value = catName;
  items.value= [];
   fetchCategoryDetails(catName);
  if(simpleCategories.includes(selectedCategory.value)){
    items.value.push(
      [{name:selectedCategory.value,
        gender:"",
        hasSize:false,
        size:"",
        quantity:0,
        otherItemName:""
      }]
    )
  }
  else if (selectedCategory.value == "Shoes"){
    for(const gender of visibleGenders){
      items.value.push(
        shoeSizeOptions.map((size) => ({
          gender: gender,
          name: selectedCategory.value,
          hasSize: true,
          size:size,
          quantity: 0,
          otherItemName: ""
        }))
      )
    }
  }
  else if(selectedCategory.value == "Other Items"){
    items.value.push(
      [{name:selectedCategory.value,
        gender:"",
        hasSize:false,
        size:"N/A",
        quantity:0,
        otherItemName:""
      }]
    )
  }
  else{
    if(selectedCategory.value == "Dresses"){
        visibleGenders = ["Female"]
    }
    else{
      visibleGenders = ["Male", "Female", "Child"];
    }
    for(const gender of visibleGenders){  
      items.value.push(
        sizeOptions.map((size) => ({
          gender: gender,
          name: selectedCategory.value,
          hasSize: true,
          size:size,
          quantity: 0,
          otherItemName: ""
        }))
      )
    }
  }
}

watch(isShoes, () => {
});

watch(
  [selectedCategory, formSizeOptions],
  () => {
  },
  { immediate: true },
);

async function fetchCategoryDetails(category: string) {
  try {
    const data = await $fetch<CategoryDetail[]>("/api/inventory", {
      params: { category },
    });
    const fallbackGenders =
      category === "Other Items"
        ? []
        : visibleGenders.map((gender) => ({
            name: gender,
            info: [{ size: "XS", quantity: 0 }],
          }));
    categoryDetails.value = {
      catDetails:
        data.length > 0
          ? data
          : [{ category, quantity: 0, genders: fallbackGenders }],
    };
  } catch (err) {
    console.error("Error fetching category details:", err);
    categoryDetails.value = { catDetails: [] };
  }
}

async function confirmAddition() {
  additionPreviewItems.value = [];
  const additions = items.value.flatMap((gender) => gender.filter((i) => i.quantity > 0));
  if (!additions.length) {
    showEmptyInputError.value = true;
    return;
  }
  pendingAdditionPayloads.value = additions;
  for(const addition of additions){
    if(selectedCategory.value !== "Other Items")
    additionPreviewItems.value.push({
      ...addition,
      category:selectedCategory.value
    })
    else{
      additionPreviewItems.value.push({
      ...addition,
      category:selectedCategory.value,
      size:addition.otherItemName
    })
    }
  }
  
  showAdditionConfirmPopup.value = true;
}

async function confirmPendingAdditions() {
  showAdditionConfirmPopup.value = false;
  if (!pendingAdditionPayloads.value.length) return;

  try {
    for (const body of pendingAdditionPayloads.value) {
      console.log(body);
      await $fetch("/api/inventory/", {
        method: "POST",
        credentials: "include",
        body: {
          ...body,
          category: selectedCategory.value,
          size:
            selectedCategory.value !== "Other Items"
              ? body.size
              : body.otherItemName,
        },
      });
    }
    await getInventory();
    await fetchCategoryDetails(selectedCategory.value);
    pendingAdditionPayloads.value = [];
    additionPreviewItems.value = [];
    showAdditionSuccessPopup.value = true;
  } catch (err: unknown) {
    console.error("Error adding item:", err);
    addErrorMessage.value = formatApiError(
      err,
      "The item could not be saved. Please try again.",
    );
  }
}
async function getInventory() {
  try {

    inventory.value = await ($fetch as any)("/api/inventory/", {
      method: "GET",
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

onMounted(() => {
  getInventory();
});

// Refetch category details when inventory updates (e.g. after adding)
watch(
  inventory,
  () => {
    if (selectedCategory.value) {
      fetchCategoryDetails(selectedCategory.value);
    }
  },
  { deep: true },
);
</script>
