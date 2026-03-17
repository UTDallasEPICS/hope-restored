<template>
  <div class="checkout-page">
    <div class="layout">

      <!-- LEFT SIDE -->
      <div class="left-panel" ref="leftPanelRef" :style="leftPanelHeight ? { height: leftPanelHeight + 'px' } : {}">
        <div class="left-panel-header">
          <h3>Inventory Database</h3>
          <div ref="filtersWrapperRef" class="filters-wrapper" :class="{ 'filters-dropdown-open': filtersDropdownOpen }">
            <div class="filters-trigger-wrap">
              <button
                type="button"
                class="filters-icon-btn btn"
                :aria-expanded="filtersDropdownOpen"
                aria-haspopup="true"
                aria-label="Open filter options"
                @click="filtersDropdownOpen = !filtersDropdownOpen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="filters-icon-svg" aria-hidden="true"><path d="M342.6 534.6C330.1 547.1 309.8 547.1 297.3 534.6L137.3 374.6C124.8 362.1 124.8 341.8 137.3 329.3C149.8 316.8 170.1 316.8 182.6 329.3L320 466.7L457.4 329.4C469.9 316.9 490.2 316.9 502.7 329.4C515.2 341.9 515.2 362.2 502.7 374.7L342.7 534.7zM502.6 182.6L342.6 342.6C330.1 355.1 309.8 355.1 297.3 342.6L137.3 182.6C124.8 170.1 124.8 149.8 137.3 137.3C149.8 124.8 170.1 124.8 182.6 137.3L320 274.7L457.4 137.4C469.9 124.9 490.2 124.9 502.7 137.4C515.2 149.9 515.2 170.2 502.7 182.7z"/></svg>
                <span v-if="categoryFilter || genderFilter || clothingSizeFilter || shoeSizeFilter" class="filters-active-dot" aria-hidden="true"></span>
              </button>
              <div v-show="filtersDropdownOpen" class="filters-dropdown-panel">
                <div class="filters-dropdown-inner">
                  <label>Category</label>
                  <select v-model="categoryFilter">
                    <option value="">All categories</option>
                    <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
                  </select>
                  <label>Gender</label>
                  <select v-model="genderFilter">
                    <option value="">All genders</option>
                    <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
                  </select>
                  <label>Clothing size</label>
                  <select v-model="clothingSizeFilter">
                    <option value="">All clothing sizes</option>
                    <option v-for="s in clothingSizeOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <label>Shoe size</label>
                  <select v-model="shoeSizeFilter">
                    <option value="">All shoe sizes</option>
                    <option v-for="s in shoeSizeOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                  <button type="button" class="btn filters-refresh-btn" @click="loadInventory">Refresh</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="inventory-table">
          <table>
            <template v-if="loadingInventory">
              <td colspan="2">Loading...</td>
            </template>
            <template v-else-if="!inventoryDisplay.length">
              <td colspan="2">No inventory rows</td>
            </template>
            <template v-else v-for="row in inventoryDisplay" :key="row.category">
              <thead>
                <tr>
                  <th colspan="2" >
                    <div class="inventory-category">
                      <span>{{ row.category }}</span> 
                      <span v-if="simpleCategories.includes(row.category)" class="inventory-category">{{ row.quantity }}</span>
                    </div>
                  </th>
                </tr>             
              </thead>
              <template v-for="genders in row.genders">
                <tr>
                  <td class="inventory-gender" colspan="2" >{{ genders.name }}</td>
                </tr>
                
                <template v-if="genders.info.length>0" v-for="info in genders.info">
                  <tr v-if="info.quantity !== 0">
                    <td>{{ info.size }}</td>
                    <td>{{ info.quantity }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="2">No {{ genders.name }} {{ row.category }} in inventory</td>
                  </tr>
                </template>
              </template>
            </template>
          </table>
          
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="right-panel" ref="rightPanelRef">

        <h2><b>Item Removal Form</b></h2>

        <!-- Gender Toggle -->
        <div class="gender-toggle">
          <button
            :class="['gender-btn', selectedGender === 'Male' ? 'active' : '']"
            @click="selectedGender = 'Male'"
          >
            Male
          </button>

          <button
            :class="['gender-btn', selectedGender === 'Female' ? 'active' : '']"
            @click="selectedGender = 'Female'"
          >
            Female
          </button>
        </div>

        <!-- Name + Date -->
        <div class="form-meta">
          <div>
            <label>Name:</label>
            <input type="text" v-model="personName" />
          </div>
          <div>
            <label>Date:</label>
            <input type="date" v-model="todayDate" />
          </div>
        </div>

        <!-- HRM Table -->
        <table class="hrm-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Size</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in items" :key="item.name">
              <td>{{ item.name }}</td>

              <!-- Size / Other item input -->
              <td>
                <template v-if="item.name === 'Other Items'">
                  <input
                    type="text"
                    v-model="item.otherItemName"
                    placeholder="e.g. Toaster, Diapers"
                  />
                </template>
                <template v-else>
                  <select
                    v-model="item.size"
                    :disabled="!item.hasSize"
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
                      v-if="item.hasSize&&item.name === 'Shoes'"
                      :key="size"
                      :value="size"
                    >
                    {{ size }}
                    </option>
                  </select>
                </template>
              </td>

              <!-- Quantity -->
              <td>
                <input
                  type="number"
                  min="0"
                  v-model.number="item.quantity"
                  placeholder="0"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="checkout-button">
          <button class="checkout-btn" @click="openCheckoutConfirm">
            Checkout
          </button>
        </div>

      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="showCheckoutConfirm" class="modal-overlay">
      <div class="modal">
        <h3>Confirm Removal</h3>

        <ul v-if="removedList.length">
          <li v-for="(line, idx) in removedList" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="modal-actions">
          <button class="btn danger" @click="confirmCheckout">Yes</button>
          <button class="btn" @click="showCheckoutConfirm = false">No</button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showRemovedModal" class="modal-overlay">
      <div class="modal">
        <h3>Removed from Inventory</h3>

        <ul>
          <li v-for="(line, idx) in removedListServer" :key="idx">
            {{ line }}
          </li>
        </ul>

        <div class="modal-actions vertical">
          <button class="btn primary" @click="newCheckout">NEW CHECKOUT</button>
          <button class="btn" @click="goToInventory">GO TO INVENTORY</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useFetch, useRouter } from "#app";

const router = useRouter();

/* ----------------------
   Basic Form State
---------------------- */

const selectedGender = ref("Male");
const personName = ref("");
const todayDate = ref(new Date().toISOString().split("T")[0]);

const sizeOptions = ["XS", "S", "M", "L", "XL"];

// Panel height sync refs
const leftPanelRef = ref(null);
const rightPanelRef = ref(null);
const leftPanelHeight = ref(null);

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

const items = ref(
  categories.map(cat => ({
    name: cat.name,
    hasSize: cat.hasSize,
    size: cat.hasSize ? "M" : "N/A",
    quantity: 0,
    otherItemName: "",
  }))
);

/* ----------------------
   Inventory
---------------------- */

const availableMap = ref({});

const inventoryRows = ref([]);
const otherItemsInventory = ref<any | null>(null);
const loadingInventory = ref(false);
const filtersDropdownOpen = ref(false);
const filtersWrapperRef = ref(null);
const categoryFilter = ref('');
const genderFilter = ref('');
const clothingSizeFilter = ref('');
const shoeSizeFilter = ref('');
const pageSize = ref(25);
const currentPage = ref(1);
// Category-specific rules
const apparelCategories = ['Shirts','Pants','Jackets','Underwear'];
const simpleCategories = ['Snack Packs','Hygiene Packs','Blankets'];
const otherItemsCategory = 'Other Items';
const shoeCategory = 'Shoes';
const apparelSizes = ['XS','S','M','L','XL'];
const shoeSizes = (() => {
  const arr = [];
  for (let n = 5; n <= 14.5; n += 0.5) arr.push(String(n));
  return arr;
})();


const inventoryDisplay = computed(() => {
  // Aggregate to one row per category. Quantity is the sum of matching size/gender rows
  const inv = inventoryRows.value || [];
  const catNames = categories.map(c => c.name).filter(cn => !categoryFilter.value || cn === categoryFilter.value);
  let aggregated = [];

  for(const cat of apparelCategories){
    if(categoryFilter.value && cat!== categoryFilter.value) continue;
    aggregated.push({
      category:cat,
      quantity:0,
      genders:(() =>{ 
        let catGenders = [];
        for(const g of ['Unisex','Male', 'Female']){
          if(genderFilter.value && g!== genderFilter.value) continue;
          catGenders.push({
            name:g,
            info:[]
          })
        }
        return catGenders
      })()
      })
  }
  if(!categoryFilter.value || shoeCategory === categoryFilter.value){
    aggregated.push({
      category:shoeCategory,
      quantity:0,
      genders:(() =>{ 
        let catGenders = [];
        for(const g of ['Unisex','Male', 'Female']){
          if(genderFilter.value && g!== genderFilter.value) continue;
          catGenders.push({
            name:g,
            info:[]
          })
        }
        return catGenders
      })()
      })
  }
  for(const cat of simpleCategories){
    if(categoryFilter.value && cat!== categoryFilter.value) continue;
    aggregated.push({
      category:cat,
      quantity:0,
      genders:[]
      })
  }

  // Inject Other Items with full breakdown if available
  if ((!categoryFilter.value || categoryFilter.value === otherItemsCategory) && otherItemsInventory.value) {
    const oi = otherItemsInventory.value;
    aggregated.push({
      category: otherItemsCategory,
      quantity: oi.quantity || 0,
      genders: oi.genders || [],
    });
  }
  
for(const item of inv){
  for(const row of aggregated){
    if(item.category === row.category){
      row.quantity += item.quantity
      for(const gender of row.genders){
        if(item.gender === gender.name){
          if(item.category !== 'Shoes'){
            if(clothingSizeFilter.value && item.size !== clothingSizeFilter.value || item.quantity === 0) continue;
            gender.info.push({
              size:item.size? item.size : "",
              quantity:item.quantity
            })
          }
          else if(item.category ==='Shoes' && item.quantity > 0){
             if(shoeSizeFilter.value && item.size !== shoeSizeFilter.value) continue;
              gender.info.push({
                size:item.size? item.size : "",
                quantity:item.quantity
              })
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
  return categories.map(c => c.name);
});

const genderOptions = computed(() => {
  // Standard order for non-tech users
  return ['Male','Female','Unisex'];
});

const clothingSizeOptions = computed(() => apparelSizes);
const shoeSizeOptions = computed(() => shoeSizes);

watch([categoryFilter, genderFilter, clothingSizeFilter, shoeSizeFilter, pageSize], () => {
  currentPage.value = 1;
});

async function loadInventory() {
  loadingInventory.value = true;
  const map = {};
  const normalized = [];

  // For each known category, fetch detailed breakdown and build rows of category/gender/size/quantity
  const catNames = categories.map(c => c.name);
  for (const catName of catNames) {
    try {
      const data = await $fetch('/api/inventory', { params: { category: catName } });
      const InventoryInfo = data.length > 0? data[0] :{
            category: catName,
            quantity:0,
            genders:[
                { name:"Unisex", info:[] },
                { name:"Male", info:[] },
                { name:"Female", info:[] }
                ]}
      const totalQty = Number(InventoryInfo.quantity || 0);
      for(const gender of InventoryInfo.genders){
        for(const row of gender.info){
          map[catName+gender.name+row.size] = row.quantity;
        }
      }
      // Build rows according to category type
      if (catName === otherItemsCategory) {
        // Keep full structure for Other Items so it can be displayed with subcategories + item names
        otherItemsInventory.value = InventoryInfo;
      } else if (apparelCategories.includes(catName)) {
        for (const g of InventoryInfo.genders) {
          for (const s of apparelSizes) {
            const infoEntry = g.info.find((row) => row.size === s);
            normalized.push({
              category: catName,
              gender: g.name,
              size: s,
              quantity: infoEntry?.quantity ?? 0
            });
          }
        }
      } else if (catName === shoeCategory) {
        for (const g of InventoryInfo.genders) {
          for (const s of shoeSizes) {
            const infoEntry = g.info.find((row) => row.size === s);
            normalized.push({
              category: catName,
              gender: g.name,
              size: s,
              quantity: infoEntry?.quantity ?? 0
            });
          }
        }
      } else if (simpleCategories.includes(catName)) {
        normalized.push({ category: catName, gender: 'Unisex', size: 'N/A', quantity: totalQty });
      }
    } catch (e) {
      console.error('Error loading category details for', catName, e);
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

let filtersClickOutsideHandler = null;
watch(filtersDropdownOpen, (isOpen) => {
  if (filtersClickOutsideHandler) {
    document.removeEventListener("click", filtersClickOutsideHandler);
    filtersClickOutsideHandler = null;
  }
  if (isOpen) {
    filtersClickOutsideHandler = (e) => {
      if (filtersWrapperRef.value && !filtersWrapperRef.value.contains(e.target)) {
        filtersDropdownOpen.value = false;
      }
    };
    setTimeout(() => document.addEventListener("click", filtersClickOutsideHandler), 0);
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
const removedListServer = ref([]);

const removedList = computed(() =>
  items.value
    .filter(i => i.quantity > 0)
    .map(i =>
      i.name === 'Other Items'
        ? `${i.quantity} ${i.otherItemName || 'Other Items'}`
        : `${i.quantity} ${i.name} (${i.size})`
    )
);

function openCheckoutConfirm() {
  const removals = items.value.filter(i => i.quantity > 0);
  if (!removals.length) {
    alert("No items selected.");
    return;
  }
  console.log("removals", removals)
  console.log("available map", availableMap.value)
  for (const r of removals) {
    if (r.name === 'Other Items') {
      // Skip strict availability check for Other Items (uses free-text name)
      continue;
    }
    const available = availableMap.value[r.name+selectedGender.value+r.size] + availableMap.value[r.name+'Unisex'+r.size] ?? 0;
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
    .filter(i => i.quantity > 0)
    .map(i => i.name === 'Other Items'
      ? {
          category: 'Other Items',
          size: 'N/A',
          quantity: i.quantity,
          gender: i.otherItemName?.trim() || ''
        }
      : {
          category: i.name,
          size: i.size,
          quantity: i.quantity,
          gender: selectedGender.value
        }
    );

  await $fetch("/api/checkout", {
    method: "POST",
    body: { removals }
  });

  // Refresh local inventory display after successful checkout
  await loadInventory();

  removedListServer.value = removals.map(r =>
    r.category === 'Other Items'
      ? `${r.quantity} ${r.gender || 'Other Items'}`
      : `${r.quantity} ${r.category} (${r.size})`
  );

  showRemovedModal.value = true;
}

function newCheckout() {
  items.value.forEach(i => {
    i.quantity = 0;
    console.log(i)
    i.size = i.hasSize ? i.name !=='Shoes'? "M" : '5' : "N/A";
  });
  showRemovedModal.value = false;
}

function goToInventory() {
  router.push("/inventory");
}

onMounted(newCheckout)
</script>

<style scoped>
.checkout-page {
  background: #f0f2f5;
  min-height: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.layout {
  min-width: 0;
  width: 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 1.5rem;
  align-items: stretch;
}

.layout > * {
  min-height: 0;
  min-width: 0;
  max-width: 100%;
}

.left-panel,
.right-panel {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.left-panel {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.right-panel {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.form-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.form-meta > div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-meta input {
  max-width: 100%;
  box-sizing: border-box;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}

@media (max-width: 959px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    gap: clamp(0.75rem, 2.5vw, 1rem);
    width: 100%;
  }
  .right-panel {
    order: -1;
    width: 100%;
    max-width: 100%;
  }
  .left-panel {
    order: 0;
    width: 100%;
    max-width: 100%;
  }
  .left-panel,
  .right-panel {
    min-width: 0;
    padding: clamp(0.75rem, 3vw, 1.25rem);
  }
  .right-panel h2,
  .right-panel .gender-toggle,
  .right-panel .form-meta,
  .right-panel .hrm-table,
  .right-panel .checkout-button {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
  .right-panel .hrm-table {
    width: 100%;
    table-layout: fixed;
  }
  .right-panel .hrm-table th,
  .right-panel .hrm-table td {
    word-break: break-word;
  }
  .form-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .form-meta input {
    max-width: 100%;
    box-sizing: border-box;
  }
  .right-panel .checkout-button {
    width: 100%;
  }
  .right-panel .checkout-btn {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    width: 100%;
  }
  .checkout-page {
    padding: 1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 480px) {
  .checkout-page {
    padding: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .left-panel,
  .right-panel {
    min-height: 160px;
    padding: 0.75rem;
    width: 100%;
    max-width: 100%;
  }
}


.gender-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.gender-btn {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: white;
  font-weight: 600;
}

.gender-btn.active {
  background: #3f51b5;
  color: white;
  border: none;
}

.hrm-table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  table-layout: fixed;
}

.hrm-table th,
.hrm-table td {
  border: 1px solid #ccc;
  padding: 6px 10px;
  text-align: center;
  overflow: hidden;
}

.hrm-table select,
.hrm-table input {
  width: 90%;
  max-width: 100%;
  padding: 6px;
  text-align: center;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.inventory-table {
  margin-top: 0.5rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.inventory-table table {
  width: 100%;
  border-collapse: collapse;
}
.inventory-table th,
.inventory-table td {
  border: 1px solid #e0e0e0;
  padding: 8px;
  text-align: left;
}
/* Left panel: title + filter icon on same row */
.left-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.left-panel-header h3 {
  margin: 0;
  flex: 1;
}

/* Filters: icon button on right; options in popup */
.filters-wrapper {
  position: relative;
  flex-shrink: 0;
}

.filters-trigger-wrap {
  position: relative;
}

.filters-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.filters-icon-btn:hover {
  border-color: #3f51b5;
  color: #3f51b5;
}

.filters-icon-btn.btn {
  border: 1px solid #ccc;
}

.filters-icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  fill: currentColor;
}

.filters-active-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3f51b5;
}

.filters-dropdown-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 200px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.75rem;
  z-index: 10;
}

.filters-dropdown-inner {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filters-dropdown-inner label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.filters-dropdown-inner label:first-child {
  margin-top: 0;
}

.filters-dropdown-inner select {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.filters-refresh-btn {
  margin-top: 0.25rem;
}

.inventory-search {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-right: 8px;
  min-width: 140px;
}

.inventory-actions select {
  margin-right: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.inventory-pagination {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}
.inventory-category{
  font-size: xx-large;
  display: flex;
  justify-content: space-between;
}
.inventory-gender{
  font-size: large;
  font-weight: bold;
}
.checkout-button {
  margin-top: 1rem;
  text-align: right;
}

.checkout-btn {
  background: #c0392b;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.modal-actions.vertical {
  flex-direction: column;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.danger {
  background: #c0392b;
  color: white;
}
</style>