<template>
  <div class="checkout-page">
    <!-- Main content -->
    <div class="content">
      <h2>Pick a Category:</h2>

      <!-- Category buttons -->
      <div class="category-buttons">
        <button
          v-for="category in categories"
          :key="category"
          class="category-btn"
          @click="openEnterQuantity(category)"
        >
          {{ category }}
        </button>
      </div>

      <!-- Items table -->
      <div class="items-section">
        <table class="items-table">
          <thead>
            <tr>
              <th>Items</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.name">
              <td>{{ item.name }}</td>
              <td class="quantity-cell">
                <span class="qty-val">{{ item.quantity }}</span>
                <button v-if="item.quantity > 0" class="edit-inline-btn" @click.stop="editItem(item.name)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Checkout button -->
      <div class="checkout-button">
        <button class="checkout-btn" @click="openCheckoutConfirm">
          Checkout
        </button>
      </div>
    </div>

    <!-- Enter Quantity Modal -->
    <div v-if="showEnterModal" class="modal-overlay" @keydown.esc="closeAllModals" tabindex="0">
      <div class="modal">
  <button class="modal-close" @click="closeAllModals">✕</button>
  <h3 v-if="!editMode">Enter {{ selectedCategory }} Quantity:</h3>
  <h3 v-else>Update quantity of {{ selectedCategory }}:</h3>
        <input
          type="number"
          min="0"
          v-model.number="enteredQuantity"
          placeholder="Enter number"
          @keyup.enter="onAddFromEnter"
        />
        <div class="modal-actions">
          <button class="btn primary" @click="onAddFromEnter">{{ editMode ? 'Update' : 'Add' }}</button>
        </div>
      </div>
    </div>

    <!-- Confirm Add / Update Modal -->
    <div v-if="showConfirmAddModal" class="modal-overlay">
      <div class="modal">
        <h3 v-if="!editMode">Add {{ enteredQuantity }} {{ selectedCategory }}?</h3>
        <h3 v-else>Update to {{ enteredQuantity }} {{ selectedCategory }}?</h3>
        <p>Confirm {{ editMode ? 'Update' : 'Yes' }}/No</p>
        <div class="modal-actions">
          <button class="btn danger" @click="confirmAdd">{{ editMode ? 'Update' : 'Yes' }}</button>
          <button class="btn" @click="cancelConfirmAdd">No</button>
        </div>
      </div>
    </div>

    <!-- Checkout Confirm Modal -->
    <div v-if="showCheckoutConfirm" class="modal-overlay">
      <div class="modal">
        <h3>Check Out?</h3>
        <p>You're about to remove the following items:</p>
        <ul class="removed-list" v-if="removedList.length">
          <li v-for="(line, idx) in removedList" :key="idx">{{ line }}</li>
        </ul>
        <p v-else>No items selected.</p>
        <div class="modal-actions">
          <button class="btn danger" :disabled="removedList.length === 0" @click="confirmCheckout">Yes</button>
          <button class="btn" @click="showCheckoutConfirm = false">No</button>
        </div>
      </div>
    </div>

    <!-- Removed from Inventory Modal -->
    <div v-if="showRemovedModal" class="modal-overlay">
      <div class="modal">
        <h3>Removed from Inventory:</h3>
        <ul class="removed-list" v-if="removedListServer.length">
          <li v-for="(line, idx) in removedListServer" :key="idx">{{ line }}</li>
        </ul>
        <p v-else>No items removed.</p>

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
import { useFetch, useRouter, useState } from "#app";

const router = useRouter();

// categories and items
const categories = [
  "Shirts",
  "Jackets",
  "Pants",
  "Underwear",
  "Shoes",
  "Snack Packs",
  "Hygiene Packs",
];

const items = ref(
  categories.map((cat) => ({ name: cat, quantity: 0 }))
);

// available inventory totals by category (from /api/inventory)
const availableMap = ref({});

async function loadInventory() {
  try {
    const { data, error } = await useFetch('/api/inventory');
    if (error?.value) {
      console.warn('Could not load inventory totals', error.value);
      return;
    }
    const rows = data?.value || [];
    const map = {};
    for (const r of rows) {
      // server returns { category: { name }, quantity }
      const name = (r?.category && r.category.name) || r?.category || '';
      map[name] = Number(r.quantity) || 0;
    }
    availableMap.value = map;
  } catch (e) {
    console.warn('Error loading inventory', e);
  }
}

// modal and state variables
const showEnterModal = ref(false);
const showConfirmAddModal = ref(false);
const showCheckoutConfirm = ref(false);
const showRemovedModal = ref(false);
const editMode = ref(false);

const selectedCategory = ref("");
const enteredQuantity = ref(null);

// computed removed items list (local preview) and server-provided removed lines
const removedList = computed(() =>
  items.value.filter((it) => Number(it.quantity) > 0)
             .map((it) => `${it.quantity} ${it.name}`)
);
const removedListServer = ref([]);

// open modal for entering quantity
function openEnterQuantity(category) {
  selectedCategory.value = category;
  enteredQuantity.value = null;
  editMode.value = false;
  showEnterModal.value = true;
  showConfirmAddModal.value = false;
  showCheckoutConfirm.value = false;
  showRemovedModal.value = false;
}

// Open modal to edit an existing cart entry (replace quantity)
function editItem(category) {
  selectedCategory.value = category;
  const idx = items.value.findIndex((it) => it.name === category);
  if (idx !== -1) {
    enteredQuantity.value = Number(items.value[idx].quantity) || 0;
  } else {
    enteredQuantity.value = null;
  }
  editMode.value = true;
  showEnterModal.value = true;
  showConfirmAddModal.value = false;
  showCheckoutConfirm.value = false;
  showRemovedModal.value = false;
} 

// when Add is clicked in quantity modal
function onAddFromEnter() {
  const q = Number(enteredQuantity.value);
  if (!Number.isFinite(q) || q < 0) {
    enteredQuantity.value = 0;
  }
  showEnterModal.value = false;
  showConfirmAddModal.value = true;
}

function cancelConfirmAdd() {
  showConfirmAddModal.value = false;
  showEnterModal.value = true;
}

function confirmAdd() {
  const q = Number(enteredQuantity.value) || 0;
  const idx = items.value.findIndex(
    (it) => it.name === selectedCategory.value
  );
  if (idx !== -1) {
    if (editMode.value) {
      // replace quantity when editing
      items.value[idx].quantity = q;
    } else {
      const current = Number(items.value[idx].quantity) || 0;
      items.value[idx].quantity = current + q;
    }
  }
  editMode.value = false;
  showConfirmAddModal.value = false;
  selectedCategory.value = "";
  enteredQuantity.value = null;
}

function openCheckoutConfirm() {
  // Validate against available inventory before showing confirm
  showEnterModal.value = false;
  showConfirmAddModal.value = false;
  showRemovedModal.value = false;

  // Build removals preview
  const removals = items.value
    .filter((it) => it.quantity > 0)
    .map((it) => ({ category: it.name, quantity: Number(it.quantity) }));

  if (removals.length === 0) {
    alert('No items selected for checkout.');
    return;
  }

  // Ensure we have current inventory totals
  loadInventory().then(() => {
    const insufficient = [];
    for (const r of removals) {
      const avail = availableMap.value[r.category] ?? 0;
      if (r.quantity > avail) insufficient.push({ category: r.category, requested: r.quantity, available: avail });
    }
    if (insufficient.length > 0) {
      const details = insufficient.map(d => `${d.category}: requested ${d.requested}, available ${d.available}`).join('\n');
      alert('Insufficient inventory for one or more categories:\n' + details);
      return;
    }
    showCheckoutConfirm.value = true;
  });
}

// ✅ This now updates the Prisma database through your API route
async function confirmCheckout() {
  showCheckoutConfirm.value = false;

  // Only send nonzero items
  const removals = items.value
    .filter((it) => it.quantity > 0)
    .map((it) => ({
      category: it.name,
      quantity: it.quantity,
    }));

  if (removals.length === 0) {
    alert("No items selected for checkout.");
    return;
  }

    const { data, error } = await useFetch("/api/checkout", {
      method: "POST",
      body: { removals },
    });

    if (error.value) {
      console.error(error.value);
      alert("Checkout failed. Please try again.");
      return;
    }

    const resp = data.value;
    if (!resp) {
      alert('No response from server');
      return;
    }

    if (!resp.success) {
      // Show server-sent details if available
      console.error('Checkout failed:', resp);
      const msg = resp.error || 'Checkout failed';
      if (resp.details && Array.isArray(resp.details)) {
        const details = resp.details.map(d => `${d.category}: requested ${d.requested}, available ${d.available}`).join('\n');
        alert(msg + '\n' + details);
      } else if (resp.details) {
        alert(msg + '\n' + JSON.stringify(resp.details));
      } else {
        alert(msg);
      }
      return;
    }

  // Success: display removed lines and signal inventory refresh
  // Log response for debugging and fall back to local removedList if server didn't return lines
  try {
    console.log('checkout response:', resp);
  } catch (e) {}
  const serverLines = (resp.lines && Array.isArray(resp.lines) && resp.lines.length > 0) ? resp.lines : null;
  removedListServer.value = serverLines || removedList.value || [];
    try {
      const inventoryRefresh = useState('inventoryRefreshKey');
      inventoryRefresh.value = Date.now();
    } catch (e) {
      // ignore if running in a non-Nuxt context
    }
    showRemovedModal.value = true;
}

// refresh inventory when other pages update it
onMounted(() => {
  loadInventory();
});

try {
  const inventoryRefresh = useState('inventoryRefreshKey');
  watch(inventoryRefresh, () => loadInventory());
} catch (e) {
  // ignore if useState not available in this context
}

function newCheckout() {
  items.value = categories.map((cat) => ({ name: cat, quantity: 0 }));
  showRemovedModal.value = false;
  removedListServer.value = [];
}

function goToInventory() {
  items.value = categories.map((cat) => ({ name: cat, quantity: 0 }));
  showRemovedModal.value = false;
  removedListServer.value = [];
  router.push("/inventory");
}

function closeAllModals() {
  showEnterModal.value = false;
  showConfirmAddModal.value = false;
  showCheckoutConfirm.value = false;
  showRemovedModal.value = false;
  selectedCategory.value = "";
  enteredQuantity.value = null;
}
</script>

<style scoped>
.checkout-page {
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
}

.content {
  flex: 1;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 12px;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

.category-btn {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 500;
  min-width: 110px;
  text-align: center;
}

.category-btn:hover {
  background: #f0f0f0;
}

.items-section {
  background: #ddd;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.items-table th,
.items-table td {
  border: 1px solid #ccc;
  padding: 10px 12px;
  text-align: left;
}

.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background: #fafafa;
}

.quantity-cell {
  position: relative;
  padding-right: 70px; /* space for the inline edit button */
}
.qty-val {
  display: inline-block;
}
.edit-inline-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 8px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(0,0,0,0.04);
  color: #333;
  cursor: pointer;
  opacity: 0; /* hidden by default */
  transition: opacity 120ms ease-in-out, background 120ms;
}
.edit-inline-btn:hover {
  background: rgba(0,0,0,0.08);
}
.quantity-cell:hover .edit-inline-btn {
  opacity: 1; /* appear on hover */
}

.items-table th {
  background: #f5f5f5;
}

.checkout-button {
  display: flex;
  justify-content: flex-end;
}

.checkout-btn {
  background: #c0392b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.checkout-btn:hover {
  background: #a93226;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 480px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.modal input[type="number"] {
  width: 100%;
  padding: 8px 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}

.modal-actions.vertical {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid #bbb;
  cursor: pointer;
  background: #f5f5f5;
}

.btn.primary {
  background: #007bff;
  color: white;
  border: none;
}

.btn.danger {
  background: #c0392b;
  color: white;
  border: none;
}

.removed-list {
  color: #c0392b;
  margin: 10px 0 0 18px;
}

/* responsive */
@media (max-width: 520px) {
  .category-btn {
    min-width: 90px;
    padding: 8px 10px;
  }
  .modal {
    width: 92%;
    padding: 14px;
  }
}
</style>