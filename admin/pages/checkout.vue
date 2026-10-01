<template>
  <div
    class="checkout-page flex flex-col w-full min-h-0 flex-1 lg:min-h-0 lg:h-[calc(100vh-130px)] lg:max-h-[calc(100vh-130px)] lg:overflow-hidden"
  >
    <div
      class="flex flex-col flex-1 min-h-0 overflow-hidden bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8 gap-3 sm:gap-4 font-sans"
    >
      <!-- Top 1/3: Category selection -->
      <CategorySelector
        :categories="categories"
        :selected-category="selectedCategory"
        title="Select a Category to Remove"
        aria-label="Checkout categories"
        mobile-placeholder="Select category"
        @select="selectCategory"
      />

      <div
        v-if="inventoryLoadError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        role="alert"
      >
        <p>{{ inventoryLoadError }}</p>
        <NuxtLink
          v-if="inventoryAuthStatus === 401"
          to="/login"
          class="mt-2 inline-block font-semibold text-indigo-700 underline"
        >
          Go to login
        </NuxtLink>
        <button
          v-else
          type="button"
          class="mt-2 inline-block font-semibold text-indigo-700 underline"
          @click="loadInventory"
        >
          Try again
        </button>
      </div>

      <!-- Bottom 2/3 -->
      <section
        class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0 items-stretch"
        :class="!selectedCategory ? 'grid-rows-2 lg:grid-rows-none' : ''"
      >
        <!-- LEFT: inventory for selected category -->
        <InventoryPanel
          class="order-2 lg:order-1"
          :selected-category="selectedCategory"
          :category-details="categoryDetails"
          :visible-genders="visibleGenders"
        />

        <!-- RIGHT: removal form first on mobile -->
        <div
          class="checkout-panel checkout-panel--form order-1 lg:order-2 min-w-0 h-full min-h-0 flex flex-col"
        >
          <InOutForm
            class="h-full min-h-0"
            :inForm="false"
            :selectedCategory="selectedCategory"
            :submitForm="openCheckoutConfirm"
            :isSimpleCategory="isSimpleCategory"
            :isOtherCategory="isOtherItems"
            :visibleGenders="visibleGenders"
            :shoeSizes="shoeSizes"
            :apparelSizes="apparelSizes"
            :items="items"
            empty-prompt="Select a category above to view inventory"
          />
        </div>
      </section>
    </div>

    <!-- Confirm Modal -->
    <div
      v-if="showCheckoutConfirm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900">Confirm Removal</h3>

        <ul
          v-if="removedList.length"
          class="mt-3 space-y-1 text-sm text-gray-700"
        >
          <li v-for="(line, idx) in removedList" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            class="w-full sm:w-auto px-4 py-2.5 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 min-h-[2.75rem]"
            @click="showCheckoutConfirm = false"
          >
            No
          </button>
          <button
            type="button"
            class="w-full sm:w-auto px-4 py-2.5 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 min-h-[2.75rem]"
            @click="confirmCheckout"
          >
            Yes
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showRemovedModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold text-gray-900">
          Removed from Inventory
        </h3>

        <ul class="mt-3 space-y-1 text-sm text-gray-700">
          <li v-for="(line, idx) in removedListServer" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            class="w-full sm:flex-1 px-4 py-2.5 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 min-h-[2.75rem]"
            @click="newCheckout"
          >
            NEW CHECKOUT
          </button>
          <button
            class="w-full sm:flex-1 px-4 py-2.5 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 min-h-[2.75rem]"
            @click="goToInventory"
          >
            GO TO INVENTORY
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
} from "vue";
import { $fetch } from "ofetch";
import { useRouter } from "vue-router";
import InOutForm from "../components/Inventory/InOutForm.vue";
import InventoryPanel from "../components/Inventory/InventoryPanel.vue";
import {
  getDefaultSizesForCategory,
  normalizeGenderSizes,
} from "../composables/inventorySizes";

type InventoryInfoRow = {
  size: string;
  quantity: number;
};

type InventoryGenderGroup = {
  name: string;
  info: InventoryInfoRow[];
};

type InventoryCategoryGroup = {
  category: string;
  quantity: number;
  genders: InventoryGenderGroup[];
};

type CheckoutItem = {
  name: string;
  gender:string;
  hasSize: boolean;
  size: string;
  quantity: number;
  otherItemName: string;
};

const router = useRouter();

const inventoryLoadError = ref("");
const inventoryAuthStatus = ref<number | null>(null);

function getErrorStatus(error: unknown) {
  return (
    (error as { status?: number; statusCode?: number })?.statusCode ??
    (error as { status?: number; statusCode?: number })?.status ??
    null
  );
}

function setInventoryAuthError(error: unknown) {
  const status = getErrorStatus(error);
  if (status !== 401 && status !== 403) return false;
  inventoryAuthStatus.value = status;
  if (status === 401) {
    inventoryLoadError.value =
      "You are not signed in (or your session expired). Log in again to use Checkout.";
  } else {
    inventoryLoadError.value =
      "Your account does not have staff access. Add your email to BETTER_AUTH_STAFF_EMAILS or BETTER_AUTH_ADMIN_EMAILS in admin/.env.";
  }
  return true;
}

/* ----------------------
   Basic Form State
---------------------- */

const selectedGender = ref("Male");
const selectedCategory = ref("");

const personName = ref("");
const todayDate = ref(new Date().toISOString().split("T")[0]);
const visibleGenders = computed(() =>{
  return selectedCategory.value !== "Dresses" ?["Male", "Female", "Child"]: ["Female"]}

);

const sizeOptions = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL+"];

const categories = [
  { name: "Shirts", hasSize: true },
  { name: "Pants", hasSize: true },
  { name: "Jackets", hasSize: true },
  { name: "Dresses", hasSizee: true},
  { name: "Underwear", hasSize: true },
  { name: "Shoes", hasSize: true },
  { name: "Snack Packs", hasSize: false },
  { name: "Hygiene Packs", hasSize: false },
  { name: "Blankets", hasSize: false },
  { name: "Other Items", hasSize: false },
];
const isSimpleCategory = ref(false);
const isOtherItems = ref(false);
const items = ref<CheckoutItem[][]>([]);

function selectCategory(catName:string){
  selectedCategory.value = catName;
  items.value= [];
  if (!catName) {
    isSimpleCategory.value = false;
    isOtherItems.value = false;
    return;
  }
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
    isSimpleCategory.value = true;
  }
  else if (selectedCategory.value == "Shoes"){
    for(const gender of visibleGenders.value){
      items.value.push(
        shoeSizes.map((size) => ({
          gender: gender,
          name: selectedCategory.value,
          hasSize: true,
          size:size,
          quantity: 0,
          otherItemName: ""
        }))
      )
    }
    isSimpleCategory.value = false;
    isOtherItems.value = false;
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
    isOtherItems.value = true;
  }
  else{
    for(const gender of visibleGenders.value){
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
    isSimpleCategory.value = false;
    isOtherItems.value = false;
  }
}

/* ----------------------
   Inventory
---------------------- */

const availableMap = ref<Record<string, number>>({});

const loadingInventory = ref(false);
// Category-specific rules
const simpleCategories = ["Snack Packs", "Hygiene Packs", "Blankets"];
const otherItemsCategory = "Other Items";
const apparelSizes = ["XS", "S", "M", "L", "XL","2XL", "3XL", "4XL+"];
const shoeSizes = (() => {
  const arr = [];
  for (let n = 5; n <= 14.5; n += 0.5) arr.push(String(n));
  return arr;
})();

const categoryDetails = ref<{ catDetails: InventoryCategoryGroup[] }>({
  catDetails: [],
});

// Gets details for the selected category, mirroring inventory.vue's fetchCategoryDetails
async function fetchCategoryDetails(category: string) {
  loadingInventory.value = true;
  inventoryLoadError.value = "";
  inventoryAuthStatus.value = null;
  try {
    const data = await $fetch<InventoryCategoryGroup[]>("/api/inventory", {
      params: { category },
    });

    // Build the raw lookup map (used for checkout availability validation) straight from the DB response
    const InventoryInfo: InventoryCategoryGroup =
      data.length > 0 ? data[0] : { category, quantity: 0, genders: [] };
    const map: Record<string, number> = {};
    for (const gender of InventoryInfo.genders) {
      for (const row of gender.info) {
        map[category + gender.name + row.size] = row.quantity;
      }
    }
    if (simpleCategories.includes(category)) {
      map[category] = Number(InventoryInfo.quantity || 0);
    }
    availableMap.value = map;

    const fallbackGenders =
      category === otherItemsCategory
        ? []
        : visibleGenders.value.map((gender) => ({
            name: gender,
            info: getDefaultSizesForCategory(category).map((size) => ({
              size,
              quantity: 0,
            })),
          }));
    const normalizedData =
      data.length > 0
        ? data.map((entry) => ({
            ...entry,
            genders: normalizeGenderSizes(category, entry.genders ?? []),
          }))
        : [{ category, quantity: 0, genders: fallbackGenders }];

    categoryDetails.value = { catDetails: normalizedData };
  } catch (err) {
    if (setInventoryAuthError(err)) {
      loadingInventory.value = false;
      return;
    }
    console.error("Error fetching category details:", err);
    categoryDetails.value = { catDetails: [] };
    availableMap.value = {};
  }
  loadingInventory.value = false;
}

// Retry the currently selected category's data (used by the error banner's "Try again")
async function loadInventory() {
  if (selectedCategory.value) {
    await fetchCategoryDetails(selectedCategory.value);
  }
}

/* ----------------------
   Checkout Logic
---------------------- */

const showCheckoutConfirm = ref(false);
const showRemovedModal = ref(false);
const removedListServer = ref<string[]>([]);

const removedList = computed(() =>
  items.value.flatMap((gender) => gender.filter((i) => i.quantity > 0).map((i) =>
      i.name === "Other Items"
        ? `${i.quantity} ${i.otherItemName || "Other Items"}`
        : !simpleCategories.includes(i.name) ? ` ${i.quantity} ${i.gender} ${i.name} (${i.size})` : `${i.quantity} ${i.gender} ${i.name}`,
    ),)
    
);

function openCheckoutConfirm() {
  const removals = items.value.flatMap((gender) => gender.filter((i) => i.quantity > 0));
  if (!removals.length) {
    alert("No items selected.");
    return;
  }
  for (const r of removals) {
    if (r.name === "Other Items") {
      if(!availableMap.value[r.name+r.gender+r.otherItemName] || r.quantity > availableMap.value[r.name+r.gender+r.otherItemName]){
        alert(`${r.name} ${r.gender} ${r.otherItemName}: Requested ${r.quantity}, Available ${availableMap.value[r.name+r.gender+r.otherItemName]?availableMap.value[r.name+r.gender+r.otherItemName]: '0'}`);
        return;
      }
      
    }
    else{
      const usesSharedInventory = simpleCategories.includes(r.name);
      const requestedGender = usesSharedInventory ? "": r.gender;
      const available =
        (availableMap.value[r.name + requestedGender + r.size] ?? 0) +
          (usesSharedInventory? 0 : (availableMap.value[r.name + "" + r.size] ?? 0));
          console.log("Available:", availableMap.value);
      if (r.quantity > available) {
        alert(`${r.gender} ${r.name} ${r.size}: Requested ${r.quantity}, Available ${available}`);
        return;
      }
    }
    
  }

  showCheckoutConfirm.value = true;
}

async function confirmCheckout() {
  showCheckoutConfirm.value = false;

  const removals = items.value.flatMap((gender) => gender.filter((i) => i.quantity > 0))
    .map((i) =>
      i.name === "Other Items"
        ? {
            category: "Other Items",
            size: "N/A",
            quantity: i.quantity,
            gender: i.otherItemName?.trim() || "",
          }
        : {
            category: i.name,
            size: i.size,
            quantity: i.quantity,
            gender: simpleCategories.includes(i.name)
              ? ""
              : i.gender,
          },
    );

  try {
    await $fetch("/api/checkout", {
      method: "POST",
      body: { removals },
    });
  } catch (error) {
    if (setInventoryAuthError(error)) return;
    console.error("Checkout request failed", error);
    alert("Checkout failed. Please try again.");
    return;
  }

  // Refresh local inventory display after successful checkout
  await loadInventory();

  removedListServer.value = removals.map((r) =>
    r.category === "Other Items"
      ? `${r.quantity} ${r.gender || "Other Items"}`
      : !simpleCategories.includes(r.category) ? ` ${r.quantity} ${r.gender} ${r.category} (${r.size})` : `${r.quantity} ${r.gender} ${r.category}`,
  );

  showRemovedModal.value = true;
}

function newCheckout() {
  showRemovedModal.value = false;
  if (selectedCategory.value) {
    selectCategory(selectedCategory.value);
  }
}

function goToInventory() {
  router.push("/inventory");
}
</script>
