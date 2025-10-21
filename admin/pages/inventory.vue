<!-- pages/inventory.vue -->
<template>
    <div class="inventory-container">
        <h1 style="color: red;"> NOTE: Please enter data in chronological order from earliest date to the most recent date/today. Do NOT enter data for a date without entering any previous days' data. In addition, for each date, please enter all additions first and then all removals. This ensures that the reports and inventory show correct data for all dates. </h1>
        <h1>Pick a Category</h1>
    
        <!-- Manual Add Section -->
        <section class="add-item-section">
            <div class="category-grid" role="list" aria-label="Quick add categories">
                <button
                    v-for="cat in ['Shirts','Pants','Jackets','Underwear','Shoes','Snack Packs','Hygiene Packs']"
                    :key="cat"
                    type="button"
                    class="category-button"
                    :aria-pressed="newItem.category === cat"
                    :class="{ active: newItem.category === cat }"
                    @click="openQuickPopup(cat)">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                    <span class="label">{{ cat }}</span>
                </button>
            </div>
        </section>
        

        <!--Pick Category Section-->
        
        <!--Shirt Button-->
        
        
        <!--Pants Button-->

        <!--Jacket Button-->

        <!--Underwear Button-->

        <!--Shoes Button-->

        <!--Snack Packs Button-->

        <!--Hygiene Packs Button-->


        <!-- Add Item Modal -->
        <div v-if="showAddItemModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Add New Inventory Item</h2>
                <form @submit.prevent="addItem">
                    <div class="form-group mt-2">
                        <label for="category">Category:</label>
                        <!-- <input v-model="newItem.category" id="category" required /> -->
                        <select v-model="newItem.category" id="category" required>
                            <option disabled value="">Select a category</option>
                            <option value="Tops">Tops</option>
                            <option value="Suits">Suits</option>
                            <option value="Pants">Pants</option>
                            <option value="Shorts">Shorts</option>
                            <option value="Socks">Socks</option>
                            <option value="Underwear">Underwear</option>
                            <option value="Shoes">Shoes</option>
                            <option value="OuterWear">OuterWear</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="style">Style:</label>
                        <!-- <input v-model="newItem.style" id="style" required /> -->
                        <select v-model="newItem.style" id="style" :disabled="!newItem.category" required>
                            <option disabled value="">Select a style</option>
                            <option v-for="style in filteredStyles" :key="style" :value="style">
                                {{ style }}
                            </option>
                        </select>



                    <!--<input v-model="newItem.style" id="style" required />
                        <select v-model="newItem.style" id="style" required>
                            <option disabled value="">Select a style</option>
                            <option value="Long Sleeve">Long Sleeve</option>
                            <option value="Short Sleeve">Short Sleeve</option>
                            <option value="T-Shirt">T-Shirt</option>
                            <option value="Casual">Casual</option>
                            <option value="Fancy">Fancy</option>
                            <option value="Canvas">Canvas</option>
                            <option value="Leather">Leather</option>
                            <option value="Misc.">Miscellaneous</option>
                        </select>-->    
                    
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender:</label>
                        <!-- <input v-model="newItem.gender" id="gender" required /> -->
                        <select v-model="newItem.gender" id="gender" required>
                            <option disabled value="">Select a gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="size">Size:</label>
                        <!--<input v-model="newItem.size" id="size" required />-->


                        <select v-model="newItem.size" id="size" :disabled="!newItem.category" required>
                            <option disabled value="">Select a size</option>
                           <!--<option v-for="style in filteredStyles" :key="style" :value="style">
                                {{ style }}
                            </option>--> 
                            <!--<option value="">Select Size</option>-->
                            <option value="S">Small</option>
                            <option value="M">Medium</option>
                            <option value="L">Large</option>
                            <option value="XL">Extra Large</option>

                        </select>


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

        <!-- Add to existing item modal -->
        <div v-if="showAddQuantityModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Add Inventory Item</h2>
                <h2>Item Barcode: {{ editedItem.barcode }}</h2>
                <form @submit.prevent="updateItem">
                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number"
                               v-model.number="editedItem.quantity"
                               id="quantity"
                               required
                               min="1" />
                    </div>
                    <div class="form-actions">
                        <button type="submit" @click="editItem(editedItem)" class="save-button">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button type="button"
                                @click="showAddQuantityModal = false"
                                class="cancel-button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Generic Quick Popup for any category -->
        <div v-if="showQuickPopup" class="modal-overlay">
            <div class="modal-content shirt-popup" style="max-width:320px; position:relative;">
                <button type="button" class="popup-close-x" aria-label="Close" @click="closeQuickPopup">×</button>
                <h2>Enter Quantity for {{ quickPopupCategory }}:</h2>
                <div class="form-group">
                    <input type="number" v-model.number="quickQuantity" min="1" />
                </div>
                <div class="form-actions" style="justify-content:center; flex-direction:column; gap:0.5rem;">
                    <button type="button" @click="addQuick" class="save-button">ADD</button>
                </div>
            </div>
        </div>

        <!-- Remove from existing item modal -->
        <div v-if="showReduceQuantityModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Remove Inventory Item</h2>
                <h2>Item Barcode: {{ editedItem.barcode }}</h2>
                <form @submit.prevent="updateItem">
                    <div class="form-group">
                        <label for="quantity">Quantity:</label>
                        <input type="number"
                               v-model.number="editedItem.quantity"
                               id="quantity"
                               required
                               min="0"
                               :max="editedItem.quantity" />
                    </div>
                    <div class="form-actions">
                        <button type="submit" @click="editItem({ barcode: editedItem.barcode, quantity: editedItem.quantity * -1 })" class="save-button">
                            <i class="fas fa-save"></i> Save
                        </button>
                        <button type="button"
                                @click="showReduceQuantityModal = false"
                                class="cancel-button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="showInvalidQuantityPopup" class="modal-overlay">
            <div class="modal-content">
                <h1>Invalid Action</h1>
                <p>You cannot remove that quantity because you do not have enough existing quantity in the inventory.</p>
                <form>
                    <div class="form-actions">
                        <button type="button" @click="showInvalidQuantityPopup = false" class="save-button">
                            <i class="fas fa-save"></i> Ok
                        </button>
                        <button type="button"
                            @click="showInvalidQuantityPopup = false"
                            class="cancel-button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Filter and Sort Section DISABLED TEMPORARILY
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
        -->

        <!-- Inventory Table Section -->
        <div id="inventory" class="inventory_table_container">
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in sortedAndFilteredInventory" :key="item.barcode">
                        <td>{{ item.category?.name ?? '—' }}</td>
                        <td>{{ item.quantity }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

    
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';
    import { useFetch, useRuntimeConfig } from 'nuxt/app';
    import QRCode from 'qrcode.vue';
    
    //import { RefSymbol } from '@vue/reactivity';
    
    const inventory = ref([]);
    //inventory.value = await getInventory();
    const searchQuery = ref('');
    const selectedSort = ref('alphabetical');
    const config = useRuntimeConfig();
    const showAddItemModal = ref(false);
    const showAddQuantityModal = ref(false);
    const showReduceQuantityModal = ref(false);
    const showInvalidQuantityPopup = ref(false);
    const showShirtsPopup = ref(false);
    const shirtsQuantity = ref(1);
    // Generic quick popup for all categories
    const showQuickPopup = ref(false);
    const quickPopupCategory = ref('');
    const quickQuantity = ref(1);
    const editedItem = ref({ barcode: null, quantity: null });
    
    // making the drop down dynamic

    const styleOptions: Record<string, string[]> = {
        Tops: ["Long Sleeve", "Short Sleeve", "T-Shirt"],
        OuterWear: ["Jackets", "Hoodies", "Coats"],
        Pants: ["Jeans", "Sweat Pants", "Cargos"],
        Suits: ["Blazer", "Business"],
        // Jeans: ["Casual"],
        Shorts: ["Cargo", "Athletic"],
        Socks: ["Misc."],
        Underwear: ["Misc."],
        Shoes: ["Boots", "Canvas", "Leather", "Athletic"]
    }    

    const newItem = ref({
        category: '',
        style: '',
        gender: '',
        size: '',
        quantity: 1,
        location: '',
        lastUpdated: '',
    });

    // Open Add modal for a specific category and preselect it
    function openAddModal(category: string) {
        newItem.value.category = category;
        showAddItemModal.value = true;
    }

    function openShirtsPopup() {
        // backward compatibility (still available but delegates to generic)
        openQuickPopup('Shirts');
    }

    function openQuickPopup(category: string) {
        quickPopupCategory.value = category;
        quickQuantity.value = 1;
        showQuickPopup.value = true;
    }

    function closeQuickPopup() {
        showQuickPopup.value = false;
    }

    async function addQuick() {
        const payload = {
            category: quickPopupCategory.value,
            style: 'Misc.',
            gender: 'Unisex',
            size: 'M',
            quantity: Number(quickQuantity.value || 0),
        };

        if (!payload.quantity || payload.quantity <= 0) return;

        try {
            await $fetch('/api/inventory/', {
                method: 'POST',
                body: payload,
            });
            await getInventory();
        } catch (err) {
            console.error('Error adding item:', err);
        } finally {
            closeQuickPopup();
        }
    }

    function openAddQuantityModal(item) {
        editedItem.value = item;
        showAddQuantityModal.value = true;
    }

    function openReduceQuantityModal(item) {
        editedItem.value = item;
        showReduceQuantityModal.value = true;
    }

    function openInvalidQuantityPopup() {
        showInvalidQuantityPopup.value = true;
    }

    async function editItem(editedItem) {
        let item = null;

        if (editedItem.barcode && editedItem.quantity){
            item = await $fetch('/api/inventory/:id', {  // update entry in database; call [id].put.ts
                method: 'PUT',
                body: { // data for database entry
                    barcode: editedItem.barcode,
                    quantity: editedItem.quantity,
                },
            });
        }

        showAddQuantityModal.value = false;
        showReduceQuantityModal.value = false;
        async function checkAndDelete() {
            const quantity = await getItem(editedItem.barcode); // Wait for the quantity
            console.log(quantity);
            if (quantity == 0) { 
                deleteEntry(editedItem.barcode);
                getInventory();
            }
            else if (quantity < 0) {
                openInvalidQuantityPopup();
                if (editedItem.barcode && editedItem.quantity){
                    item = await $fetch('/api/inventory/:id', {  // update entry in database; call [id].put.ts
                        method: 'PUT',
                        body: { // data for database entry
                            barcode: editedItem.barcode,
                            quantity: -editedItem.quantity,
                        },
                    });
                }
                getInventory();
            }
        }

        // delete item from inventory if quantity == 0
        checkAndDelete();

        getInventory();
    }

    // Fetch inventory data
    //onMounted(async () => { // Fetches data when the page (component) is initially loaded
    async function getInventory() {
        try {
            //inventory.value = await $fetch('/api/inventory/');
            inventory.value = await $fetch('/api/inventory/', { // get inventory data; call index.get.ts
                //baseURL: config.public.apiBase,
                method: 'GET'
            });
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    onMounted(getInventory);

    // Fetch inventory item
    async function getItem(id) {
        try {
            console.log(id);
            const item = await $fetch(`/api/inventory/${id}`, { // get inventory data; call [id].get.ts
                method: 'GET'
            });

            //console.log("Fetching from get item API!");
            console.log(item?.quantity);
            //return item;
            return item?.quantity;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    // Call the server-side API to delete this item from the database
    async function deleteEntry(barcode) {
        const response = await $fetch('/api/inventory/', {  // post entry to database; call index.delete.ts
            method: 'DELETE',
            body: { // data for database entry
                barcode: barcode
            },
        });

        console.log("Response from API:", response); // Log API response
    }

    // Computed property to filter and sort inventory based on search query and sort option
    const sortedAndFilteredInventory = computed(() => {
        let filtered = inventory.value; //.value accesses the actual array inside the inventory variable
        console.log(filtered);

        // Filter by search query
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase();
            filtered = filtered.filter((item) =>    // loops through inventory items
                Object.values(item).some((value) => { // checks if any of the fields contain the query value
                    if (value && typeof value === 'object') { // checks if the value is an object (nested structure)
                        return Object.values(value).some((nestedValue) => // checks if any of the nested fields contain the query value
                            nestedValue.toString().toLowerCase().includes(query) // checks if nested value contains the query
                        );
                    }
                    return value?.toString().toLowerCase().includes(query); // checks if value contains the query
                })
            );
        }

        // Sort based on selected option
        return filtered.slice().sort((a: any, b: any) => {
            if (selectedSort.value === 'recent') {
                // Most recent first (must convert to Date format for comparison)
                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
            } else if (selectedSort.value === 'dateAdded') {
                // Oldest first
                return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
            }

            // Default/custom ordering: Shirts, Pants, Jackets, Underwear, Shoes, Snack Packs, Hygiene Packs
            const order = ['Shirts', 'Pants', 'Jackets', 'Underwear', 'Shoes', 'Snack Packs', 'Hygiene Packs'];
            const idx = (name: string) => {
                if (!name) return order.length;
                const i = order.indexOf(name);
                return i === -1 ? order.length : i;
            };

            const aName = a?.category?.name ?? '';
            const bName = b?.category?.name ?? '';
            const diff = idx(aName) - idx(bName);
            if (diff !== 0) return diff;
            // fallback: alphabetical within same category or for unknown categories
            return aName.localeCompare(bName);
        });
    });

    // Function to add a new item to the inventory
    const addItem = async () => {
        // Generate a new ID
        const newId = inventory.value.length;
        //    ? Math.max(...inventory.value.map((item) => item.id)) + 1
        //    : 1;

        // Create a new item object
        const item = {
            id: newId,
            ...newItem.value,
            quantity: Number(newItem.value.quantity),
        };

        console.log("ID: " + item.id);

        // Add the new item to the inventory list
        //inventory.value.push(item);
        console.log("This is the inventory: " + inventory.value);

        // Reset the newItem form
        newItem.value = {
            category: '',
            style: '',
            gender: '',
            size: '',
            quantity: 1,
            location: '',
            lastUpdated: '',
        };

        // Close the modal
        showAddItemModal.value = false;

        insertEntry();

        // Call the server-side API to insert this item into the database
        async function insertEntry() {
            const response = await $fetch('/api/inventory/', {  // post entry to database; call index.post.ts
                method: 'POST',
                body: { // data for database entry
                    id: item.id,
                    category: item.category,
                    style: item.style,
                    gender: item.gender,
                    size: item.size,
                    quantity: item.quantity,
                },
            });

            console.log("Response from API:", response); // Log API response

            // Refresh inventory after insertion completes
            await getInventory();
        }
    };

    const filteredStyles = computed(() => {
        return styleOptions[newItem.value.category] || [];
    })


    watch(() => newItem.value.category, () => {
        newItem.value.style = '';        
    })

</script>

<style scoped>
    /* General Styling */
    .inventory-container {
        font-family: 'Open Sans', sans-serif;
        padding: 2em;
        background-color: #f0f2f5; /* Light gray background */
        min-height: 100vh;
        max-height: 300px; /* Adjust as needed */
        overflow-y: auto; /* Vertical scroll */
        overflow-x: auto; /* Horizontal scroll if needed */
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
        display: block;
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

    /* Category grid for quick-add buttons */
    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.6rem;
        align-items: stretch;
        grid-auto-rows: 1fr;
    }

    .category-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        /* Make buttons square */
        aspect-ratio: 1 / 1;
        width: 100%;
        padding: 0.6rem;
        border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.08);
    background: #fff;
    color: #000;
        font-weight: 600;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
    }

    .category-button .label {
        display: inline-block;
        font-size: 1.1rem;
        text-align: center;
        line-height: 1.1;
        padding: 0 6px;
        word-break: break-word;
    }

    .category-button:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 18px rgba(0,0,0,0.06);
        border-color: rgba(0,0,0,0.12);
        background: linear-gradient(180deg, #ffffff, #f7f7f7);
    }

    .category-button:active {
        transform: translateY(-1px) scale(0.995);
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        background: linear-gradient(180deg, #f9f9f9, #f0f0f0);
    }

    /* Shirts popup close X */
    .popup-close-x {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(0,0,0,0.06);
        border: none;
        color: #333;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .popup-close-x:hover {
        background: rgba(0,0,0,0.12);
    }

    

    .remove-item-button {
        padding: 0.5em 1.5em;
        background-color: #f44336; /* Red */
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

        .remove-item-button:hover {
            background-color: #e53935;
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

    #inventory {
        max-height: 500px;
        overflow-y: auto;
        border: 1px solid #ddd;
    }

    /* Inventory Table */
    #inventory table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        background-color: #fff;
        border-radius: 8px;
        /*overflow: hidden;*/
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

    thead {
        position: sticky;
        top: 0;
        background-color: #fff; /* Ensures the background is white so it covers content */
        z-index: 2; /* Keeps header on top */
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