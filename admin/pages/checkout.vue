<template>
  <div class="checkout-page">
    <div class="layout">

      <!-- LEFT SIDE -->
      <div class="left-panel">
        <h3>Inventory Database</h3>

        <div class="inventory-table">
          <div class="inventory-actions">
              <select v-model="categoryFilter">
                <option value="">All categories</option>
                <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
              </select>

              <select v-model="genderFilter">
                <option value="">All genders</option>
                <option v-for="g in genderOptions" :key="g" :value="g">{{ g }}</option>
              </select>

              <select v-model="clothingSizeFilter">
                <option value="">All clothing sizes</option>
                <option v-for="s in clothingSizeOptions" :key="s" :value="s">{{ s }}</option>
              </select>

              <select v-model="shoeSizeFilter">
                <option value="">All shoe sizes</option>
                <option v-for="s in shoeSizeOptions" :key="s" :value="s">{{ s }}</option>
              </select>

              

              <button class="btn" @click="loadInventory">Refresh</button>
          </div>

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
                  <tr  v-if="info.quantity !== 0">
                    <td>Sizes</td>
                    <td>Available</td>
                  </tr>
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
      <div class="right-panel">

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

              <!-- Size Dropdown -->
              <td>
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

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useFetch, useRouter } from "#app";

const router = useRouter();

/* ----------------------
   Basic Form State
---------------------- */

const selectedGender = ref("Male");
const personName = ref("");
const todayDate = ref(new Date().toISOString().split("T")[0]);

const sizeOptions = ["XS", "S", "M", "L", "XL"];

const categories = [
  { name: "Shirts", hasSize: true },
  { name: "Pants", hasSize: true },
  { name: "Jackets", hasSize: true },
  { name: "Underwear", hasSize: true },
  { name: "Shoes", hasSize: true },
  { name: "Snack Packs", hasSize: false },
  { name: "Hygiene Packs", hasSize: false },
  { name: "Blankets", hasSize: false }
];

const items = ref(
  categories.map(cat => ({
    name: cat.name,
    hasSize: cat.hasSize,
    size: cat.hasSize ? "M" : "N/A",
    quantity: 0
  }))
);

/* ----------------------
   Inventory
---------------------- */

const availableMap = ref({});

const inventoryRows = ref([]);
const loadingInventory = ref(false);
const categoryFilter = ref('');
const genderFilter = ref('');
const clothingSizeFilter = ref('');
const shoeSizeFilter = ref('');
const pageSize = ref(25);
const currentPage = ref(1);
// Category-specific rules
const apparelCategories = ['Shirts','Pants','Jackets','Underwear'];
const simpleCategories = ['Snack Packs','Hygiene Packs','Blankets'];
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
  
for(const item of inv){
  for(const row of aggregated){
    if(item.category === row.category){
      row.quantity += item.quantity
      for(const gender of row.genders){
        if(item.gender === gender.name){
          if(item.category !== 'Shoes'){
            if(clothingSizeFilter.value && item.size !== clothingSizeFilter.value || item.quantity === 0) continue;
            console.log(item.quantity)
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
console.log(aggregated);
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
            category, 
            quantity:0,
            genders:[
                {
                    name:"Unisex",
                    info:{size:"XS",quantity:0}
                },
                {
                    name:"Male",
                    info:{size:"XS",quantity:0}
                },
                {
                    name:"Female",
                    info:{size:"XS",quantity:0}
                }
                ]}
      const totalQty = Number(InventoryInfo.quantity || 0);
      for(const gender of InventoryInfo.genders){
        for(const row of gender.info){
          map[catName+gender.name+row.size] = row.quantity;
        }
      }
      // Build rows according to category type
      if (apparelCategories.includes(catName)) {
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
          for (const s of shoeSizes) {;
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
        // only a single row representing quantity
        normalized.push({ category: catName, gender: 'Unisex', size: 'N/A', quantity: totalQty });
      }
    } catch (e) {
      console.error('Error loading category details for', catName, e);
    }
  }

  inventoryRows.value = normalized;
  availableMap.value = map;
  loadingInventory.value = false;
}

onMounted(loadInventory);

/* ----------------------
   Checkout Logic
---------------------- */

const showCheckoutConfirm = ref(false);
const showRemovedModal = ref(false);
const removedListServer = ref([]);

const removedList = computed(() =>
  items.value
    .filter(i => i.quantity > 0)
    .map(i => `${i.quantity} ${i.name} (${i.size})`)
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
    .map(i => ({
      category: i.name,
      size: i.size,
      quantity: i.quantity,
      gender: selectedGender.value
    }));

  await $fetch("/api/checkout", {
    method: "POST",
    body: { removals }
  });

  // Refresh local inventory display after successful checkout
  await loadInventory();

  removedListServer.value = removals.map(
    r => `${r.quantity} ${r.category} (${r.size})`
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
  min-height: 100vh;
  padding: 2rem;
}

.layout {
  display: flex;
  gap: 2rem;
}

.left-panel {
  flex: 1;
  background: white;
  padding: 1rem;
  border: 1px solid #ddd;
}

.right-panel {
  flex: 1;
  background: white;
  padding: 1.5rem;
  border: 1px solid #ddd;
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
  border-collapse: collapse;
  margin-top: 1rem;
}

.hrm-table th,
.hrm-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.hrm-table select,
.hrm-table input {
  width: 90%;
  padding: 6px;
  text-align: center;
  border: 1px solid #ccc;
}

.inventory-table {
  margin-top: 0.5rem;
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
.inventory-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
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