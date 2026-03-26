<!-- pages/inventory.vue -->
<template>
  <div
    class="flex flex-col min-h-screen lg:min-h-0 lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-hidden"
  >
    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden bg-gray-100 p-4 md:p-6 lg:p-8 gap-4 font-sans"
    >
      <!-- Top 1/3: Category selection -->
      <section class="flex flex-col gap-4">
        <h1 class="text-3xl md:text-4xl font-bold text-indigo-600 text-center">
          Select a Category to Add
        </h1>
        <!-- Desktop: category grid -->
        <div
          class="hidden md:grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2"
          role="list"
          aria-label="Inventory categories"
        >
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="flex flex-col items-center justify-center gap-1.5 h-20 min-h-[5rem] px-2 rounded-lg border-2 border-gray-200 bg-white text-gray-800 font-semibold transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300"
            :aria-pressed="selectedCategory === cat"
            :aria-current="selectedCategory === cat ? 'true' : undefined"
            :class="{
              'bg-indigo-600 text-white border-indigo-600 shadow':
                selectedCategory === cat,
            }"
            @click="selectCategory(cat)"
          >
            <i class="fas fa-box" aria-hidden="true"></i>
            <span class="text-sm text-center leading-tight">{{ cat }}</span>
          </button>
        </div>
        <!-- Mobile: accordion dropdown -->
        <div class="md:hidden w-full relative">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-base font-semibold text-gray-800 bg-white border-2 border-gray-200 rounded-lg"
            :aria-expanded="accordionOpen"
            aria-haspopup="listbox"
            aria-label="Select category"
            @click="accordionOpen = !accordionOpen"
          >
            <span class="flex-1 text-left">{{
              selectedCategory || "Select category"
            }}</span>
            <i
              class="fas"
              :class="accordionOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
              aria-hidden="true"
            ></i>
            <span
              class="ml-2 inline-flex items-center text-gray-500"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                class="w-4 h-4"
                fill="currentColor"
              >
                <path
                  d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"
                />
              </svg>
            </span>
          </button>
          <div
            v-show="accordionOpen"
            class="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto"
            role="listbox"
          >
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              role="option"
              class="w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              :aria-selected="selectedCategory === cat"
              :class="{
                'bg-indigo-600 text-white hover:bg-indigo-600':
                  selectedCategory === cat,
              }"
              @click="
                selectCategory(cat);
                accordionOpen = false;
              "
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </section>

      <!-- Bottom 2/3: Left = DB display, Right = Add form -->
      <section
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0"
      >
        <!-- Left half: Inventory display for selected category -->
        <div
          class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 min-h-0 overflow-y-auto overflow-x-hidden"
        >
          <h2
            v-if="selectedCategory"
            class="text-lg font-semibold text-indigo-600 mb-3"
          >
            {{ selectedCategory }} – Current Inventory
          </h2>
          <h2 v-else class="text-lg font-normal text-gray-500 mb-3">
            Select a category above to view inventory
          </h2>
          <div v-if="selectedCategory" class="flex flex-col gap-3">
            <div class="flex gap-2 text-sm">
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
                <h3 class="text-base font-semibold text-indigo-600 mb-2">
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
                  class="w-full text-sm border border-gray-200 rounded-md overflow-hidden"
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

        <!-- Right half: Add form -->
        <div
          class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 min-h-0 overflow-y-auto"
        >
          <h2
            v-if="selectedCategory"
            class="text-lg font-semibold text-indigo-600 mb-3"
          >
            Add {{ selectedCategory }} to Inventory
          </h2>
          <h2 v-else class="text-lg font-normal text-gray-500 mb-3">
            Select a category to add items
          </h2>
          <form
            v-if="selectedCategory"
            class="flex flex-col gap-4"
            @submit.prevent="confirmAddition"
          >
            <div>
              <label
                for="add-quantity"
                class="block mb-1 text-sm font-medium text-gray-700"
                >Quantity</label
              >
              <input
                id="add-quantity"
                v-model.number="addForm.quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                aria-required="true"
                class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <template v-if="isOtherItems">
              <div>
                <label
                  for="add-item-name"
                  class="block mb-1 text-sm font-medium text-gray-700"
                  >Item name</label
                >
                <input
                  id="add-item-name"
                  v-model.trim="addForm.itemName"
                  type="text"
                  placeholder="e.g. Toaster, Diapers"
                  aria-required="true"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  for="add-subcategory"
                  class="block mb-1 text-sm font-medium text-gray-700"
                  >Category</label
                >
                <div class="relative">
                  <select
                    id="add-subcategory"
                    v-model="addForm.size"
                    aria-required="true"
                    class="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option
                      v-for="sub in otherItemsSubcategories"
                      :key="sub"
                      :value="sub"
                    >
                      {{ sub }}
                    </option>
                  </select>
                  <i
                    class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
            </template>
            <template v-else-if="!isSimpleCategory">
              <div>
                <span class="block mb-1 text-sm font-medium text-gray-700"
                  >Gender</span
                >
                <div
                  class="grid grid-cols-2 gap-2"
                  role="group"
                  aria-label="Select gender"
                >
                  <label
                    v-for="gender in visibleGenders"
                    :key="gender"
                    class="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <input
                      v-model="addForm.gender"
                      type="radio"
                      :value="gender"
                      class="text-indigo-600 focus:ring-indigo-500"
                    />
                    {{ gender }}
                  </label>
                </div>
              </div>
              <div>
                <label
                  for="add-size"
                  class="block mb-1 text-sm font-medium text-gray-700"
                  >{{ formSizeLabel }}</label
                >
                <div class="relative">
                  <select
                    id="add-size"
                    v-model="addForm.size"
                    aria-required="true"
                    class="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">
                      Select {{ formSizeLabel.toLowerCase() }}
                    </option>
                    <option v-for="s in formSizeOptions" :key="s" :value="s">
                      {{ s }}
                    </option>
                  </select>
                  <i
                    class="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
            </template>
            <div class="pt-2 flex justify-end">
              <button
                type="submit"
                class="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Confirm Addition
              </button>
            </div>
          </form>
        </div>
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
              isSimpleCategory && !isOtherItems
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

      <!-- Other Items confirmation popup -->
      <div
        v-if="showOtherItemsConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        role="alertdialog"
        aria-labelledby="confirm-other-title"
        aria-describedby="confirm-other-message"
      >
        <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
          <h2
            id="confirm-other-title"
            class="text-lg font-semibold text-gray-900"
          >
            Confirm Other Item Details
          </h2>
          <p id="confirm-other-message" class="text-sm text-gray-700">
            Please double check that the information below is correct,
            especially the
            <strong>item name spelling</strong>, before adding it to the
            inventory.
          </p>
          <ul class="mt-2 pl-5 list-disc text-sm text-gray-700">
            <li><strong>Quantity:</strong> {{ addForm.quantity }}</li>
            <li><strong>Item name:</strong> {{ addForm.itemName }}</li>
            <li>
              <strong>Category:</strong> {{ addForm.size || "Not selected" }}
            </li>
          </ul>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
              @click="showOtherItemsConfirm = false"
            >
              Go Back
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              @click="confirmOtherItemsAddition"
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const categories = [
  "Shirts",
  "Pants",
  "Jackets",
  "Underwear",
  "Shoes",
  "Snack Packs",
  "Hygiene Packs",
  "Blankets",
  "Other Items",
];
const sizeOptions = ["XS", "S", "M", "L", "XL"];
const otherItemsSubcategories = [
  "Appliances",
  "Infant care",
  "Hardware",
  "Electronics",
  "Furniture",
  "Bedding",
  "Kitchen",
  "Toys",
  "School supplies",
  "Personal care",
  "Cleaning supplies",
  "Other",
];
const shoeSizeOptions = (() => {
  const sizes: string[] = [];
  for (let n = 5; n <= 14.5; n += 0.5) sizes.push(String(n));
  return sizes;
})();
const visibleGenders = ["Male", "Female", "Child"];

const selectedCategory = ref("");
const categoryDetails = ref<{
  catDetails: {
    category: string;
    quantity: number;
    genders: { name: string; info: { size: string; quantity: number }[] }[];
  }[];
}>({
  catDetails: [],
});
const addForm = ref({
  quantity: null as number | null,
  gender: "",
  size: "",
  itemName: "" as string,
});

const showEmptyInputError = ref(false);
const showAdditionSuccessPopup = ref(false);
const addErrorMessage = ref("");
const showOtherItemsConfirm = ref(false);
const inventory = ref<any[]>([]);

const accordionOpen = ref(false);
const isMobileView = ref(false);
const MOBILE_BREAKPOINT = 1100;

function updateMobileView() {
  isMobileView.value =
    typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
  if (!isMobileView.value) accordionOpen.value = false;
}

const isShoes = computed(() => selectedCategory.value === "Shoes");
const simpleCategories = ["Snack Packs", "Hygiene Packs", "Blankets"];
const isOtherItems = computed(() => selectedCategory.value === "Other Items");
const isSimpleCategory = computed(() =>
  simpleCategories.includes(selectedCategory.value),
);
const formSizeOptions = computed(() =>
  isShoes.value ? shoeSizeOptions : sizeOptions,
);
const formSizeLabel = computed(() => (isShoes.value ? "Shoe size" : "Size"));
const visibleCategoryGenders = computed(() =>
  (categoryDetails.value.catDetails[0]?.genders || []).filter(
    (gender) => gender.name !== "Unisex",
  ),
);

function sizesToShowForGender(gender: {
  name: string;
  info: { size: string; quantity: number }[];
}): string[] {
  console.log(
    shoeSizeOptions.filter((s) =>
      gender.info.some((row) => row.size === s && row.quantity > 0),
    ),
  );
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

function selectCategory(cat: string) {
  selectedCategory.value = cat;
  addForm.value = { quantity: null, gender: "", size: "", itemName: "" };
  fetchCategoryDetails(cat);
}

watch(isShoes, () => {
  addForm.value.size = "";
});

async function fetchCategoryDetails(category: string) {
  try {
    const data = await $fetch("/api/inventory", {
      params: { category, _t: Date.now() },
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
  const qty = addForm.value.quantity;
  const isSimple = isSimpleCategory.value;

  if (qty == null || qty < 1) {
    showEmptyInputError.value = true;
    return;
  }
  if (isOtherItems.value) {
    const itemName = addForm.value.itemName.trim();
    const subcategory = addForm.value.size;
    if (!itemName || !subcategory) {
      showEmptyInputError.value = true;
      return;
    }
  } else if (!isSimple) {
    const gender = addForm.value.gender.trim();
    const size = addForm.value.size;
    if (!gender || !size) {
      showEmptyInputError.value = true;
      return;
    }
  }

  if (isOtherItems.value) {
    // Show confirmation modal for Other Items before actually saving
    showOtherItemsConfirm.value = true;
    return;
  }

  await performAddition(qty, isSimple);
}

async function confirmOtherItemsAddition() {
  const qty = addForm.value.quantity;
  const isSimple = isSimpleCategory.value;
  showOtherItemsConfirm.value = false;
  await performAddition(qty, isSimple);
}

async function performAddition(qty: number | null, isSimple: boolean) {
  try {
    const body = isOtherItems.value
      ? {
          category: "Other Items",
          gender: addForm.value.size,
          size: addForm.value.itemName.trim(),
          quantity: qty,
        }
      : {
          category: selectedCategory.value,
          gender: isSimple ? "Unisex" : addForm.value.gender,
          size: isSimple ? "N/A" : addForm.value.size,
          quantity: qty,
        };
    await $fetch("/api/inventory/", {
      method: "POST",
      body,
    });
    await getInventory();
    await fetchCategoryDetails(selectedCategory.value);
    addForm.value = { quantity: null, gender: "", size: "", itemName: "" };
    showAdditionSuccessPopup.value = true;
  } catch (err: any) {
    console.error("Error adding item:", err);
    addErrorMessage.value =
      err?.data?.error ??
      err?.message ??
      "The item could not be saved. Please try again.";
  }
}

function getTodayRange() {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return { start, end };
}

// async function checkAndCreateNewDay() {
//     try {
//         await $fetch('/api/inventory/check-new-day', { method: 'POST' });
//     } catch (error) {
//         console.error('Failed to check/create new day:', error);
//     }
// }

async function getInventory() {
  try {
    await checkAndCreateNewDay();
    const { start, end } = getTodayRange();
    inventory.value = await ($fetch as any)("/api/inventory/", {
      method: "GET",
      params: { start: start.toISOString(), end: end.toISOString() },
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

onMounted(() => {
  getInventory();
  updateMobileView();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateMobileView);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateMobileView);
  }
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
