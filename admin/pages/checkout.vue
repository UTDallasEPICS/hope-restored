<template>
  <div class="checkout-landing">
    <!-- Main content -->
    <div class="content">
      <h2>Pick a Category:</h2>

      <!-- Category buttons -->
      <div class="category-buttons">
        <button v-for="category in categories" :key="category" class="category-btn">
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
        <button class="checkout-btn">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CheckoutLandingPage',
  data() {
    return {
      categories: [
        'Shirts',
        'Jackets',
        'Pants',
        'Underwear',
        'Shoes',
        'Snack Packs',
        'Hygiene Packs'
      ],
      items: [
        { name: 'Shirts', quantity: 0 },
        { name: 'Jackets', quantity: 0 },
        { name: 'Pants', quantity: 0 },
        { name: 'Underwear', quantity: 0 },
        { name: 'Shoes', quantity: 0 },
        { name: 'Snack Packs', quantity: 0 },
        { name: 'Hygiene Packs', quantity: 0 }
      ]
    }
  }
}
</script>

<style scoped>
.checkout-page {
  background: #f5f6fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  background: #e8eaed;
  padding: 10px 20px;
  border-bottom: 2px solid #cfd2d6;
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
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
}

.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
}

.category-btn {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 500;
}

.category-btn:hover {
  background: #f0f0f0;
}

.items-section {
  background: #ddd;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  border: 1px solid #ccc;
  padding: 8px 12px;
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
</style>
