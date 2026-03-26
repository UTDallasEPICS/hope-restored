<template>
  <div
    class="min-h-screen w-full max-w-screen overflow-x-hidden bg-gray-100 p-4 md:p-6 lg:p-8"
  >
    <div
      class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 items-stretch"
    >
      <!-- LEFT SIDE -->
      <div
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 flex flex-col min-h-0 overflow-hidden"
        ref="leftPanelRef"
        :style="leftPanelHeight ? { height: leftPanelHeight + 'px' } : {}"
      >
        <div class="flex items-center justify-between gap-3 mb-3">
          <h3 class="text-lg font-semibold text-gray-900">
            Inventory Database
          </h3>
          <div
            ref="filtersWrapperRef"
            class="relative"
            :class="{ 'filters-dropdown-open': filtersDropdownOpen }"
          >
            <div class="relative">
              <button
                type="button"
                class="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :aria-expanded="filtersDropdownOpen"
                aria-haspopup="true"
                aria-label="Open filter options"
                @click="filtersDropdownOpen = !filtersDropdownOpen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  class="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"
                  />
                </svg>
                <span
                  v-if="
                    categoryFilter ||
                    genderFilter ||
                    clothingSizeFilter ||
                    shoeSizeFilter
                  "
                  class="absolute top-1 right-1 inline-block w-2 h-2 rounded-full bg-indigo-600"
                  aria-hidden="true"
                ></span>
              </button>
              <div
                v-show="filtersDropdownOpen"
                class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10"
              >
                <div class="flex flex-col gap-2 text-sm">
                  <label class="font-semibold text-gray-700">Category</label>
                  <select
                    v-model="categoryFilter"
                    class="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All categories</option>
                    <option v-for="c in categoryOptions" :key="c" :value="c">
                      {{ c }}
                    </option>
                  </select>
                  <label class="font-semibold text-gray-700">Gender</label>
                  <select
                    v-model="genderFilter"
                    class="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All genders</option>
                    <option v-for="g in genderOptions" :key="g" :value="g">
                      {{ g }}
                    </option>
                  </select>
                  <label class="font-semibold text-gray-700"
                    >Clothing size</label
                  >
                  <select
                    v-model="clothingSizeFilter"
                    class="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All clothing sizes</option>
                    <option
                      v-for="s in clothingSizeOptions"
                      :key="s"
                      :value="s"
                    >
                      {{ s }}
                    </option>
                  </select>
                  <label class="font-semibold text-gray-700">Shoe size</label>
                  <select
                    v-model="shoeSizeFilter"
                    class="w-full rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All shoe sizes</option>
                    <option v-for="s in shoeSizeOptions" :key="s" :value="s">
                      {{ s }}
                    </option>
                  </select>
                  <button
                    type="button"
                    class="mt-1 inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-200"
                    @click="loadInventory"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-2 flex-1 min-h-0 overflow-y-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <template v-if="loadingInventory">
              <td colspan="2" class="px-3 py-2 text-center">Loading...</td>
            </template>
            <template v-else-if="!inventoryDisplay.length">
              <td colspan="2" class="px-3 py-2 text-center">
                No inventory rows
              </td>
            </template>
            <template
              v-else
              v-for="row in inventoryDisplay"
              :key="row.category"
            >
              <thead>
                <tr>
                  <th
                    colspan="2"
                    class="border-b border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div
                      class="flex items-center justify-between text-xl font-bold text-gray-900"
                    >
                      <span>{{ row.category }}</span>
                      <span
                        v-if="simpleCategories.includes(row.category)"
                        class="text-lg font-semibold"
                        >{{ row.quantity }}</span
                      >
                    </div>
                  </th>
                </tr>
              </thead>
              <template v-for="genders in row.genders">
                <tr>
                  <td
                    class="px-3 py-2 font-semibold text-base text-gray-800"
                    colspan="2"
                  >
                    {{ genders.name }}
                  </td>
                </tr>

                <template
                  v-if="genders.info.length > 0"
                  v-for="info in genders.info"
                >
                  <tr v-if="info.quantity !== 0">
                    <td class="border-t border-gray-200 px-3 py-2">
                      {{ info.size }}
                    </td>
                    <td class="border-t border-gray-200 px-3 py-2">
                      {{ info.quantity }}
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td
                      colspan="2"
                      class="border-t border-gray-200 px-3 py-2 text-gray-600"
                    >
                      No {{ genders.name }} {{ row.category }} in inventory
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </table>
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div
        class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-5 min-h-0 overflow-y-auto"
        ref="rightPanelRef"
      >
        <h2 class="text-xl font-bold text-gray-900 mb-4">Item Removal Form</h2>

        <!-- Gender Toggle -->
        <div class="flex flex-wrap gap-2 mb-4">
          <button
            v-for="gender in visibleGenders"
            :key="gender"
            :class="[
              'px-4 py-2 rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500',
              selectedGender === gender
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-700',
            ]"
            @click="selectedGender = gender"
          >
            {{ gender }}
          </button>
        </div>

        <!-- Name + Date -->
        <div class="flex flex-wrap gap-3 mb-4">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Name:</label>
            <input
              type="text"
              v-model="personName"
              class="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              v-model="todayDate"
              class="w-44 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- HRM Table -->
        <table class="w-full table-auto border border-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="border border-gray-200 px-3 py-2">Category</th>
              <th class="border border-gray-200 px-3 py-2">Size</th>
              <th class="border border-gray-200 px-3 py-2">Quantity</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in items" :key="item.name">
              <td
                class="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-800"
              >
                {{ item.name }}
              </td>

              <!-- Size / Other item input -->
              <td class="border border-gray-200 px-3 py-2">
                <template v-if="item.name === 'Other Items'">
                  <input
                    type="text"
                    v-model="item.otherItemName"
                    placeholder="e.g. Toaster, Diapers"
                    class="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </template>
                <template v-else>
                  <select
                    v-model="item.size"
                    :disabled="!item.hasSize"
                    class="w-full px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option v-if="!item.hasSize" value="N/A">N/A</option>

                    <option
                      v-for="size in sizeOptions"
                      v-if="item.hasSize && item.name !== 'Shoes'"
                      :key="size"
                      :value="size"
                    >
                      {{ size }}
                    </option>
                    <option
                      v-for="size in shoeSizeOptions"
                      v-if="item.hasSize && item.name === 'Shoes'"
                      :key="size"
                      :value="size"
                    >
                      {{ size }}
                    </option>
                  </select>
                </template>
              </td>

              <!-- Quantity -->
              <td class="border border-gray-200 px-3 py-2">
                <input
                  type="number"
                  min="0"
                  v-model.number="item.quantity"
                  placeholder="0"
                  class="w-full px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-4 flex justify-end">
          <button
            class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md shadow-sm font-semibold"
            @click="openCheckoutConfirm"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div
      v-if="showCheckoutConfirm"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900">Confirm Removal</h3>

        <ul
          v-if="removedList.length"
          class="mt-3 space-y-1 text-sm text-gray-700"
        >
          <li v-for="(line, idx) in removedList" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="mt-4 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
            @click="confirmCheckout"
          >
            Yes
          </button>
          <button
            class="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
            @click="showCheckoutConfirm = false"
          >
            No
          </button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      v-if="showRemovedModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900">
          Removed from Inventory
        </h3>

        <ul class="mt-3 space-y-1 text-sm text-gray-700">
          <li v-for="(line, idx) in removedListServer" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="mt-4 flex flex-col gap-2">
          <button
            class="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            @click="newCheckout"
          >
            NEW CHECKOUT
          </button>
          <button
            class="px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300"
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { $fetch } from "ofetch";
import { useRouter } from "vue-router";

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

type InventoryRow = {
  category: string;
  gender: string;
  size: string;
  quantity: number;
};

type CheckoutItem = {
  name: string;
  hasSize: boolean;
  size: string;
  quantity: number;
  otherItemName: string;
};

const router = useRouter();

/* ----------------------
   Basic Form State
---------------------- */

const selectedGender = ref("Male");
const personName = ref("");
const todayDate = ref(new Date().toISOString().split("T")[0]);
const visibleGenders = ["Male", "Female", "Children"];

const sizeOptions = ["XS", "S", "M", "L", "XL"];

// Panel height sync refs
const leftPanelRef = ref<HTMLElement | null>(null);
const rightPanelRef = ref<HTMLElement | null>(null);
const leftPanelHeight = ref<number | null>(null);

const categories = [
  { name: "Shirts", hasSize: true },
  { name: "Pants", hasSize: true },
  { name: "Jackets", hasSize: true },
  { name: "Underwear", hasSize: true },
  { name: "Shoes", hasSize: true },
  { name: "Snack Packs", hasSize: false },
  { name: "Hygiene Packs", hasSize: false },
  { name: "Blankets", hasSize: false },
  { name: "Other Items", hasSize: false },
];

const items = ref<CheckoutItem[]>(
  categories.map((cat) => ({
    name: cat.name,
    hasSize: cat.hasSize,
    size: cat.hasSize ? "M" : "N/A",
    quantity: 0,
    otherItemName: "",
  })),
);

/* ----------------------
   Inventory
---------------------- */

const availableMap = ref<Record<string, number>>({});

const inventoryRows = ref<InventoryRow[]>([]);
const otherItemsInventory = ref<InventoryCategoryGroup | null>(null);
const loadingInventory = ref(false);
const filtersDropdownOpen = ref(false);
const filtersWrapperRef = ref<HTMLElement | null>(null);
const categoryFilter = ref("");
const genderFilter = ref("");
const clothingSizeFilter = ref("");
const shoeSizeFilter = ref("");
const pageSize = ref(25);
const currentPage = ref(1);
// Category-specific rules
const apparelCategories = ["Shirts", "Pants", "Jackets", "Underwear"];
const simpleCategories = ["Snack Packs", "Hygiene Packs", "Blankets"];
const otherItemsCategory = "Other Items";
const shoeCategory = "Shoes";
const apparelSizes = ["XS", "S", "M", "L", "XL"];
const shoeSizes = (() => {
  const arr = [];
  for (let n = 5; n <= 14.5; n += 0.5) arr.push(String(n));
  return arr;
})();

const inventoryDisplay = computed(() => {
  // Aggregate to one row per category. Quantity is the sum of matching size/gender rows
  const inv = inventoryRows.value || [];
  const aggregated: InventoryCategoryGroup[] = [];

  for (const cat of apparelCategories) {
    if (categoryFilter.value && cat !== categoryFilter.value) continue;
    aggregated.push({
      category: cat,
      quantity: 0,
      genders: (() => {
        const catGenders: InventoryGenderGroup[] = [];
        for (const g of visibleGenders) {
          if (genderFilter.value && g !== genderFilter.value) continue;
          catGenders.push({
            name: g,
            info: [],
          });
        }
        return catGenders;
      })(),
    });
  }
  if (!categoryFilter.value || shoeCategory === categoryFilter.value) {
    aggregated.push({
      category: shoeCategory,
      quantity: 0,
      genders: (() => {
        const catGenders: InventoryGenderGroup[] = [];
        for (const g of visibleGenders) {
          if (genderFilter.value && g !== genderFilter.value) continue;
          catGenders.push({
            name: g,
            info: [],
          });
        }
        return catGenders;
      })(),
    });
  }
  for (const cat of simpleCategories) {
    if (categoryFilter.value && cat !== categoryFilter.value) continue;
    aggregated.push({
      category: cat,
      quantity: 0,
      genders: [],
    });
  }

  // Inject Other Items with full breakdown if available
  if (
    (!categoryFilter.value || categoryFilter.value === otherItemsCategory) &&
    otherItemsInventory.value
  ) {
    const oi = otherItemsInventory.value;
    aggregated.push({
      category: otherItemsCategory,
      quantity: oi.quantity || 0,
      genders: oi.genders || [],
    });
  }

  for (const item of inv) {
    for (const row of aggregated) {
      if (item.category === row.category) {
        row.quantity += item.quantity;
        for (const gender of row.genders) {
          if (item.gender === gender.name) {
            if (item.category !== "Shoes") {
              if (
                (clothingSizeFilter.value &&
                  item.size !== clothingSizeFilter.value) ||
                item.quantity === 0
              )
                continue;
              gender.info.push({
                size: item.size ? item.size : "",
                quantity: item.quantity,
              });
            } else if (item.category === "Shoes" && item.quantity > 0) {
              if (shoeSizeFilter.value && item.size !== shoeSizeFilter.value)
                continue;
              gender.info.push({
                size: item.size ? item.size : "",
                quantity: item.quantity,
              });
            }
          }
        }
      }
    }
  }
  return aggregated;
});

const totalPages = computed(() => {
  const len = inventoryDisplay.value.length || 0;
  return Math.max(1, Math.ceil(len / (pageSize.value || 1)));
});

const inventoryPaged = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return inventoryDisplay.value.slice(start, start + pageSize.value);
});

const categoryOptions = computed(() => {
  // keep canonical category order from `categories` list
  return categories.map((c) => c.name);
});

const genderOptions = computed(() => {
  // Standard order for non-tech users
  return visibleGenders;
});

const clothingSizeOptions = computed(() => apparelSizes);
const shoeSizeOptions = computed(() => shoeSizes);

watch(
  [categoryFilter, genderFilter, clothingSizeFilter, shoeSizeFilter, pageSize],
  () => {
    currentPage.value = 1;
  },
);

async function loadInventory() {
  loadingInventory.value = true;
  const map: Record<string, number> = {};
  const normalized: InventoryRow[] = [];

  // For each known category, fetch detailed breakdown and build rows of category/gender/size/quantity
  const catNames = categories.map((c) => c.name);
  for (const catName of catNames) {
    try {
      const data = await $fetch<InventoryCategoryGroup[]>("/api/inventory", {
        params: { category: catName },
      });
      const InventoryInfo: InventoryCategoryGroup =
        data.length > 0
          ? data[0]
          : {
              category: catName,
              quantity: 0,
              genders: visibleGenders.map((gender) => ({
                name: gender,
                info: [],
              })),
            };
      const totalQty = Number(InventoryInfo.quantity || 0);
      for (const gender of InventoryInfo.genders) {
        for (const row of gender.info) {
          map[catName + gender.name + row.size] = row.quantity;
        }
      }
      // Build rows according to category type
      if (catName === otherItemsCategory) {
        // Keep full structure for Other Items so it can be displayed with subcategories + item names
        otherItemsInventory.value = InventoryInfo;
      } else if (apparelCategories.includes(catName)) {
        for (const g of InventoryInfo.genders) {
          for (const s of apparelSizes) {
            const infoEntry = g.info.find(
              (row: InventoryInfoRow) => row.size === s,
            );
            normalized.push({
              category: catName,
              gender: g.name,
              size: s,
              quantity: infoEntry?.quantity ?? 0,
            });
          }
        }
      } else if (catName === shoeCategory) {
        for (const g of InventoryInfo.genders) {
          for (const s of shoeSizes) {
            const infoEntry = g.info.find(
              (row: InventoryInfoRow) => row.size === s,
            );
            normalized.push({
              category: catName,
              gender: g.name,
              size: s,
              quantity: infoEntry?.quantity ?? 0,
            });
          }
        }
      } else if (simpleCategories.includes(catName)) {
        normalized.push({
          category: catName,
          gender: "Unisex",
          size: "N/A",
          quantity: totalQty,
        });
      }
    } catch (e) {
      console.error("Error loading category details for", catName, e);
    }
  }

  inventoryRows.value = normalized;
  availableMap.value = map;
  loadingInventory.value = false;

  // After inventory loads, resync panel heights (right panel may have changed)
  syncPanelHeights();
}

function syncPanelHeights() {
  if (!leftPanelRef.value || !rightPanelRef.value) return;
  const rightEl = rightPanelRef.value as HTMLElement;
  leftPanelHeight.value = rightEl.offsetHeight;
}

onMounted(() => {
  loadInventory();
  // Initial sync after first render
  setTimeout(syncPanelHeights, 0);
  if (typeof window !== "undefined") {
    window.addEventListener("resize", syncPanelHeights);
  }
});

let filtersClickOutsideHandler: ((e: MouseEvent) => void) | null = null;
watch(filtersDropdownOpen, (isOpen) => {
  if (filtersClickOutsideHandler) {
    document.removeEventListener("click", filtersClickOutsideHandler);
    filtersClickOutsideHandler = null;
  }
  if (isOpen) {
    filtersClickOutsideHandler = (e: MouseEvent) => {
      if (
        filtersWrapperRef.value &&
        !filtersWrapperRef.value.contains(e.target as Node)
      ) {
        filtersDropdownOpen.value = false;
      }
    };
    const clickHandler = filtersClickOutsideHandler;
    setTimeout(() => document.addEventListener("click", clickHandler), 0);
  }
});
onUnmounted(() => {
  if (filtersClickOutsideHandler) {
    document.removeEventListener("click", filtersClickOutsideHandler);
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncPanelHeights);
  }
});

/* ----------------------
   Checkout Logic
---------------------- */

const showCheckoutConfirm = ref(false);
const showRemovedModal = ref(false);
const removedListServer = ref<string[]>([]);

const removedList = computed(() =>
  items.value
    .filter((i) => i.quantity > 0)
    .map((i) =>
      i.name === "Other Items"
        ? `${i.quantity} ${i.otherItemName || "Other Items"}`
        : `${i.quantity} ${i.name} (${i.size})`,
    ),
);

function openCheckoutConfirm() {
  const removals = items.value.filter((i) => i.quantity > 0);
  if (!removals.length) {
    alert("No items selected.");
    return;
  }
  console.log("removals", removals);
  console.log("available map", availableMap.value);
  for (const r of removals) {
    if (r.name === "Other Items") {
      // Skip strict availability check for Other Items (uses free-text name)
      continue;
    }
    const usesSharedInventory = simpleCategories.includes(r.name);
    const requestedGender = usesSharedInventory
      ? "Unisex"
      : selectedGender.value;
    const available =
      (availableMap.value[r.name + requestedGender + r.size] ?? 0) +
      (usesSharedInventory
        ? 0
        : (availableMap.value[r.name + "Unisex" + r.size] ?? 0));
    if (r.quantity > available) {
      alert(`${r.name}: Requested ${r.quantity}, Available ${available}`);
      return;
    }
  }

  showCheckoutConfirm.value = true;
}

async function confirmCheckout() {
  showCheckoutConfirm.value = false;

  const removals = items.value
    .filter((i) => i.quantity > 0)
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
              ? "Unisex"
              : selectedGender.value,
          },
    );

  await $fetch("/api/checkout", {
    method: "POST",
    body: { removals },
  });

  // Refresh local inventory display after successful checkout
  await loadInventory();

  removedListServer.value = removals.map((r) =>
    r.category === "Other Items"
      ? `${r.quantity} ${r.gender || "Other Items"}`
      : `${r.quantity} ${r.category} (${r.size})`,
  );

  showRemovedModal.value = true;
}

function newCheckout() {
  items.value.forEach((i) => {
    i.quantity = 0;
    console.log(i);
    i.size = i.hasSize ? (i.name !== "Shoes" ? "M" : "5") : "N/A";
  });
  showRemovedModal.value = false;
}

function goToInventory() {
  router.push("/inventory");
}

onMounted(newCheckout);
</script>
