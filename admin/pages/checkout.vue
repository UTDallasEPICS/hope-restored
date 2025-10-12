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
              <td>{{ item.quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Checkout button -->
      <div class="checkout-button">
        <button class="checkout-btn" @click="openCheckoutConfirm">Checkout</button>
      </div>
    </div>

    <!-- Enter Quantity Modal -->
    <div v-if="showEnterModal" class="modal-overlay" @keydown.esc="closeAllModals" tabindex="0">
      <div class="modal">
        <button class="modal-close" @click="closeAllModals">✕</button>
        <h3>Enter {{ selectedCategory }} Quantity:</h3>
        <input
          type="number"
          min="0"
          v-model.number="enteredQuantity"
          placeholder="Enter number"
          @keyup.enter="onAddFromEnter"
        />
        <div class="modal-actions">
          <button class="btn primary" @click="onAddFromEnter">Add</button>
        </div>
      </div>
    </div>

    <!-- Confirm Add Modal -->
    <div v-if="showConfirmAddModal" class="modal-overlay">
      <div class="modal">
        <h3>Add {{ enteredQuantity }} {{ selectedCategory }}?</h3>
        <p>Confirm Yes/No</p>
        <div class="modal-actions">
          <button class="btn danger" @click="confirmAdd">Yes</button>
          <button class="btn" @click="cancelConfirmAdd">No</button>
        </div>
      </div>
    </div>

    <!-- Checkout Confirm Modal -->
    <div v-if="showCheckoutConfirm" class="modal-overlay">
      <div class="modal">
        <h3>Check Out?</h3>
        <p>Confirm Yes/No</p>
        <div class="modal-actions">
          <button class="btn danger" @click="confirmCheckout">Yes</button>
          <button class="btn" @click="showCheckoutConfirm = false">No</button>
        </div>
      </div>
    </div>

    <!-- Removed from Inventory Modal -->
    <div v-if="showRemovedModal" class="modal-overlay">
      <div class="modal">
        <h3>Removed from Inventory:</h3>
        <ul class="removed-list" v-if="removedList.length">
          <li v-for="(line, idx) in removedList" :key="idx">{{ line }}</li>
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

<script>
export default {
  name: "CheckoutLandingPage",
  data() {
    return {
      categories: [
        "Shirts",
        "Jackets",
        "Pants",
        "Underwear",
        "Shoes",
        "Snack Packs",
        "Hygiene Packs",
      ],
      // first row is header-like "Items / Quantity"
      items: [
        { name: "Shirts", quantity: 0 },
        { name: "Jackets", quantity: 0 },
        { name: "Pants", quantity: 0 },
        { name: "Underwear", quantity: 0 },
        { name: "Shoes", quantity: 0 },
        { name: "Snack Packs", quantity: 0 },
        { name: "Hygiene Packs", quantity: 0 },
      ],

      // modal state
      showEnterModal: false,
      showConfirmAddModal: false,
      showCheckoutConfirm: false,
      showRemovedModal: false,

      // selected category & entry
      selectedCategory: "",
      enteredQuantity: null,
    };
  },
  computed: {
    // prepare removed list (only items with quantity > 0)
    removedList() {
      // skip header row at index 0
      return this.items
        .slice(1)
        .filter((it) => Number(it.quantity) > 0)
        .map((it) => `${it.quantity} ${it.name}`);
    },
  },
  methods: {
    navTo(path) {
      // Reset the checkout table quantities when navigating away
      this.resetQuantities();
      // navigate using router if available
      if (this.$router) {
        // attempt to push path
        this.$router.push(path).catch(() => {});
      } else {
        // fallback: change location
        window.location.href = path;
      }
    },

    openEnterQuantity(category) {
      this.selectedCategory = category;
      this.enteredQuantity = null;
      this.showEnterModal = true;
      this.showConfirmAddModal = false;
      this.showCheckoutConfirm = false;
      this.showRemovedModal = false;
      this.$nextTick(() => {
        // focus on input if present
        const input = document.querySelector(".modal input[type='number']");
        if (input) input.focus();
      });
    },

    onAddFromEnter() {
      // Validate enteredQuantity
      const q = Number(this.enteredQuantity);
      if (!Number.isFinite(q) || q < 0) {
        // clamp to 0 or show a minimal alert - keep UI simple
        this.enteredQuantity = 0;
      }
      // close enter and open confirm
      this.showEnterModal = false;
      this.showConfirmAddModal = true;
    },

    cancelConfirmAdd() {
      // close confirm, reopen enter with previous value
      this.showConfirmAddModal = false;
      this.showEnterModal = true;
      this.$nextTick(() => {
        const input = document.querySelector(".modal input[type='number']");
        if (input) input.focus();
      });
    },

    confirmAdd() {
      // find item by name and add enteredQuantity
      const q = Number(this.enteredQuantity) || 0;
      const idx = this.items.findIndex((it) => it.name === this.selectedCategory);
      if (idx !== -1) {
        // ensure numeric
        const current = Number(this.items[idx].quantity) || 0;
        this.items[idx].quantity = current + q;
      }
      // close modals and reset selection
      this.showConfirmAddModal = false;
      this.selectedCategory = "";
      this.enteredQuantity = null;
    },

    openCheckoutConfirm() {
      this.showCheckoutConfirm = true;
      this.showEnterModal = false;
      this.showConfirmAddModal = false;
      this.showRemovedModal = false;
    },

    confirmCheckout() {
      this.showCheckoutConfirm = false;
      // open removed modal
      this.showRemovedModal = true;
    },

    newCheckout() {
      // reset table, close removed modal
      this.resetQuantities();
      this.showRemovedModal = false;
    },

    goToInventory() {
      // reset and navigate to inventory page
      this.resetQuantities();
      this.showRemovedModal = false;
      if (this.$router) {
        this.$router.push("/inventory").catch(() => {});
      } else {
        window.location.href = "/inventory";
      }
    },

    resetQuantities() {
      // keep header at index 0 untouched; set quantities to 0
      this.items = this.items.map((it, idx) =>
        idx === 0 ? it : { ...it, quantity: 0 }
      );
      // close any modals
      this.showEnterModal = false;
      this.showConfirmAddModal = false;
      this.showCheckoutConfirm = false;
      this.showRemovedModal = false;
      this.selectedCategory = "";
      this.enteredQuantity = null;
    },

    closeAllModals() {
      this.showEnterModal = false;
      this.showConfirmAddModal = false;
      this.showCheckoutConfirm = false;
      this.showRemovedModal = false;
      this.selectedCategory = "";
      this.enteredQuantity = null;
    },
  },
};
</script>

<style scoped>
.checkout-page {
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
}

.navbar {
  display: flex;
  background: #e8eaed;
  padding: 10px 20px;
  border-bottom: 2px solid #cfd2d6;
  align-items: center;
}

.nav-item {
  margin-right: 30px;
  font-weight: 500;
  cursor: pointer;
}

.nav-item.active {
  border-bottom: 3px solid #007bff;
  font-weight: bold;
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

/* Buttons */
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
