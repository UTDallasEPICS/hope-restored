<!-- pages/inventory.vue -->
<template>
    <div class="inventory-container">
        <h1>Inventory</h1>

        <!-- Manual Add Section -->
        <section class="add-item-section">
            <button @click="showAddItemModal = true" class="add-item-button">
                <i class="fas fa-plus"></i> Add New Item
            </button>
        </section>

        <!-- Add Item Modal -->
        <div v-if="showAddItemModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Add New Inventory Item</h2>
                <form @submit.prevent="addItem">
                    <div class="form-group mt-2">
                        <label for="category">Category:</label>
                        <!-- <input v-model="newItem.category" id="category" required /> -->
                        <select v-model="newItem.category" id="category" required>
                            <option value="Blouses">Blouses</option>
                            <option value="Shirts">Shirts</option>
                            <option value="Tops">Tops</option>
                            <option value="Dresses">Dresses</option>
                            <option value="Dress Pants / Slacks">Dress Pants / Slacks</option>
                            <option value="Suits">Suits</option>
                            <option value="Jeans">Jeans</option>
                            <option value="Shorts">Shorts</option>
                            <option value="Socks">Socks</option>
                            <option value="Underwear">Underwear</option>
                            <option value="Shoes / Boots">Shoes / Boots</option>
                            <option value="Sweater / Sweatshirt">Sweater / Sweatshirt</option>
                            <option value="Coats / Jackets / Hoodies">Coats / Jackets / Hoodies</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="style">Style:</label>
                        <!-- <input v-model="newItem.style" id="style" required /> -->
                        <select v-model="newItem.style" id="style" required>
                            <option value="Long Sleeve">Long Sleeve</option>
                            <option value="Short Sleeve">Short Sleeve</option>
                            <option value="T-Shirt">T-Shirt</option>
                            <option value="Casual">Casual</option>
                            <option value="Fancy">Fancy</option>
                            <option value="Canvas">Canvas</option>
                            <option value="Leather">Leather</option>
                            <option value="Misc.">Miscellaneous</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender:</label>
                        <!-- <input v-model="newItem.gender" id="gender" required /> -->
                        <select v-model="newItem.gender" id="gender" required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="size">Size:</label>
                        <input v-model="newItem.size" id="size" required />
                    </div>
                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number"
                               v-model.number="newItem.quantity"
                               id="quantity"
                               required
                               min="1" />
                    </div>
                    <div class="form-group">
                        <label for="location">Location:</label>
                        <input v-model="newItem.location" id="location" required />
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="save-button">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button type="button"
                                @click="showAddItemModal = false"
                                class="cancel-button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Filter and Sort Section -->
        <div class="filter-sort-section">
            <div class="search-input">
                <input v-model="searchQuery"
                       type="text"
                       placeholder="Search..." />
            </div>
            <div class="sort-options">
                <label for="sortOptions">Sort By:</label>
                <select v-model="selectedSort" id="sortOptions">
                    <option value="alphabetical">Alphabetical (Category)</option>
                    <option value="recent">Most Recent Addition</option>
                    <option value="dateAdded">Date Added</option>
                </select>
            </div>
        </div>

        <!-- Inventory Table Section -->
        <section id="inventory">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>QR Code</th>
                        <th>Category</th>
                        <th>Style</th>
                        <th>Gender</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in sortedAndFilteredInventory" :key="item.id">
                        <td>{{ item.id }}</td>
                        <td>
                            <QRCode :value="item.id.toString()" :size="50" />
                        </td>
                        <td>{{ item.category }}</td>
                        <td>{{ item.style }}</td>
                        <td>{{ item.gender }}</td>
                        <td>{{ item.size }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.location }}</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- Charts Section -->
        <section id="charts" class="charts-section">
            <ItemsPerCategoryChart :inventory="inventory" />
            <ItemsPerLocationChart :inventory="inventory" />
        </section>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { useRuntimeConfig } from '#app';
    import QRCode from 'qrcode.vue';
    import ItemsPerCategoryChart from '~/components/ItemsPerCategoryChart.vue';
    import ItemsPerLocationChart from '~/components/ItemsPerLocationChart.vue';
    
    const inventory = ref([]);
    const searchQuery = ref('');
    const selectedSort = ref('alphabetical');
    const config = useRuntimeConfig();
    const showAddItemModal = ref(false);

    const newItem = ref({
        category: '',
        style: '',
        gender: '',
        size: '',
        quantity: 1,
        location: '',
    });

    // Fetch inventory data
    onMounted(async () => {
        try {
            inventory.value = await $fetch('/api/inventory/', {
                baseURL: config.public.apiBase,
            });
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });

    // Computed property to filter and sort inventory based on search query and sort option
    const sortedAndFilteredInventory = computed(() => {
        let filtered = inventory.value;

        // Filter by search query
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            filtered = filtered.filter((item) =>
                Object.values(item).some((value) =>
                    value.toString().toLowerCase().includes(query)
                )
            );
        }

        // Sort based on selected option
        return filtered.slice().sort((a, b) => {
            if (selectedSort.value === 'alphabetical') {
                return a.category.localeCompare(b.category); // Alphabetical by category
            } else if (selectedSort.value === 'recent') {
                return b.id - a.id; // Assuming higher ID means more recent
            } else if (selectedSort.value === 'dateAdded') {
                return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(); // Sort by dateAdded if available
            }
            return 0;
        });
    });

    // Function to add a new item to the inventory
    const addItem = async () => {
        // Generate a new ID
        const newId = inventory.value.length
            ? Math.max(...inventory.value.map((item) => item.id)) + 1
            : 1;

        // Create a new item object
        const item = {
            id: newId,
            ...newItem.value,
            quantity: Number(newItem.value.quantity),
        };

        // Add the new item to the inventory list
        inventory.value.push(item);
        console.log(inventory);

        // Reset the newItem form
        newItem.value = {
            category: '',
            style: '',
            gender: '',
            size: '',
            quantity: 1,
            location: '',
        };

        // Close the modal
        showAddItemModal.value = false;

        // Call the server-side API to insert this item into the database
        try {
            const response = await fetch('/api/insertEntry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: item.id,
                    category: item.category,
                    style: item.style,
                    gender: item.gender,
                    size: item.size,
                    quantity: item.quantity,
                }),
            });

            const result = await response.json();
            console.log(result.message); // "Item added successfully"
        } catch (error) {
            console.error('Error adding item to the database:', error);
        }
    };
</script>

<style scoped>
    /* General Styling */
    .inventory-container {
        font-family: 'Open Sans', sans-serif;
        padding: 2em;
        background-color: #f0f2f5; /* Light gray background */
        min-height: 100vh;
    }

    /* Heading Styling */
    h1 {
        font-size: 2.5em;
        color: #3f51b5; /* Indigo */
        margin-bottom: 1em;
        text-align: center;
    }

    /* Add Item Section */
    .add-item-section {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1em;
    }

    .add-item-button {
        padding: 0.5em 1.5em;
        background-color: #4caf50; /* Green */
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
        text-transform: uppercase;
        transition: background-color 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

        .add-item-button:hover {
            background-color: #43a047;
        }

    /* Modal Styling */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: #fff;
        padding: 2em;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

        .modal-content h2 {
            margin-top: 0;
            margin-bottom: 1em;
            color: #3f51b5; /* Indigo */
            text-align: center;
        }

    .form-group {
        margin-bottom: 1em;
    }

        .form-group label {
            display: block;
            margin-bottom: 0.5em;
            color: #333;
        }

        .form-group input {
            width: 100%;
            padding: 0.5em;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1em;
    }

    .save-button,
    .cancel-button {
        padding: 0.5em 1.5em;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .save-button {
        background-color: #4caf50; /* Green */
    }

        .save-button:hover {
            background-color: #43a047;
        }

    .cancel-button {
        background-color: #f44336; /* Red */
    }

        .cancel-button:hover {
            background-color: #e53935;
        }

    /* Filter and Sort Section */
    .filter-sort-section {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;
    }

    .search-input {
        flex: 1 1 200px;
        margin-bottom: 1em;
        max-width: 300px; /* Shortened search bar */
    }

        .search-input input {
            width: 100%;
            padding: 0.5em;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

    .sort-options {
        flex: 1 1 200px;
        text-align: right;
    }

        .sort-options label {
            margin-right: 0.5em;
            font-weight: bold;
        }

        .sort-options select {
            padding: 0.5em;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

    /* Inventory Table */
    #inventory table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    #inventory th,
    #inventory td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
        text-align: center;
    }

    #inventory th {
        background-color: #3f51b5; /* Indigo */
        color: #fff;
        font-weight: bold;
    }

    #inventory tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    #inventory tr:hover {
        background-color: #e0e0e0;
    }

    #inventory td {
        color: #333;
    }

    /* Charts Section Styling */
    .charts-section {
        display: flex;
        flex-direction: column;
        gap: 2em;
        align-items: center;
        padding: 2em 0;
    }

    /* Responsive Design */
    @media (min-width: 768px) {
        .filter-sort-section {
            flex-wrap: nowrap;
            align-items: flex-end;
        }

        .search-input {
            margin-bottom: 0;
        }

        .sort-options {
            text-align: right;
        }

        .charts-section {
            flex-direction: row;
            justify-content: space-around;
        }

        .chart-container {
            width: 45%;
        }
    }
</style>
