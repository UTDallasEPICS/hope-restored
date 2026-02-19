<!-- pages/inventory.vue -->
<template>
    <div class="inventory-page-wrapper">
        <div class="inventory-container">
            <!-- Top 1/3: Category selection buttons -->
            <section class="top-section">
                <h1><b>Select a Category to Add</b></h1>
                <div class="category-grid" role="list" aria-label="Inventory categories">
                    <button
                        v-for="cat in categories"
                        :key="cat"
                        type="button"
                        class="category-button"
                        :aria-pressed="selectedCategory === cat"
                        :aria-current="selectedCategory === cat ? 'true' : undefined"
                        :class="{ 'category-button--selected': selectedCategory === cat }"
                        @click="selectCategory(cat)">
                        <i class="fas fa-box" aria-hidden="true"></i>
                        <span class="label">{{ cat }}</span>
                    </button>
                </div>
            </section>

            <!-- Bottom 2/3: Left = DB display, Right = Add form -->
            <section class="bottom-section">
                <!-- Left half: Inventory display for selected category -->
                <div class="inventory-display">
                    <h2 v-if="selectedCategory">{{ selectedCategory }} – Current Inventory</h2>
                    <h2 v-else class="inventory-display__placeholder">Select a category above to view inventory</h2>
                    <div v-if="selectedCategory" class="inventory-details">
                        <div class="detail-row detail-row--total">
                            <span class="detail-label">Total quantity:</span>
                            <span class="detail-value">{{ categoryDetails.catDetails[0]? categoryDetails.catDetails[0].quantity : 0  }}</span>
                        </div>
                        <template v-if="!isSimpleCategory">
                        <div v-for="row in categoryDetails.catDetails[0]?.genders" :key="row.name" class="gender-section">
                            <h3 class="gender-section__title">{{ row.name  }}</h3>
                            <p v-if="isShoes && !genderHasAnyInventory(row)" class="inventory-display__empty-gender">
                                No {{ row.name  }} shoes in Inventory
                            </p>
                            <table v-else class="breakdown-table" :aria-label="`${row.name} quantities by size`">
                                <thead>
                                    <tr>
                                        <th>{{ isShoes ? 'Shoe size' : 'Size' }}</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="inf of row.info" :key="inf.size">
                                        <td>{{ inf.size  }}</td>
                                        <td>{{ inf.quantity  }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </template>
                    </div>
                </div>

                <!-- Right half: Add form -->
                <div class="add-form-panel">
                    <h2 v-if="selectedCategory">Add {{ selectedCategory }} to Inventory</h2>
                    <h2 v-else class="add-form__placeholder">Select a category to add items</h2>
                    <form v-if="selectedCategory" class="add-form" @submit.prevent="confirmAddition">
                        <div class="form-group">
                            <label for="add-quantity">Quantity</label>
                            <input
                                id="add-quantity"
                                v-model.number="addForm.quantity"
                                type="number"
                                min="1"
                                placeholder="Enter quantity"
                                aria-required="true" />
                        </div>
                        <template v-if="!isSimpleCategory">
                        <div class="form-group">
                            <label>Gender</label>
                            <div class="checkbox-group" role="group" aria-label="Select gender">
                                <label class="checkbox-label">
                                    <input v-model="addForm.gender" type="radio" value="Male" />
                                    Male
                                </label>
                                <label class="checkbox-label">
                                    <input v-model="addForm.gender" type="radio" value="Female" />
                                    Female
                                </label>
                                <label class="checkbox-label">
                                    <input v-model="addForm.gender" type="radio" value="Unisex" />
                                    Unisex
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="add-size">{{ formSizeLabel }}</label>
                            <select
                                id="add-size"
                                v-model="addForm.size"
                                aria-required="true">
                                <option value="">Select {{ formSizeLabel.toLowerCase() }}</option>
                                <option v-for="s in formSizeOptions" :key="s" :value="s">{{ s }}</option>
                            </select>
                        </div>
                        </template>
                        <div class="form-actions form-actions--bottom">
                            <button type="submit" class="confirm-addition-btn">
                                Confirm Addition
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <!-- Addition success popup -->
            <div v-if="showAdditionSuccessPopup" class="modal-overlay" role="alertdialog" aria-labelledby="success-title" aria-describedby="success-message">
                <div class="modal-content success-modal">
                    <h2 id="success-title">Success</h2>
                    <p id="success-message">Your addition has been added to the inventory.</p>
                    <div class="form-actions">
                        <button type="button" class="save-button" @click="showAdditionSuccessPopup = false">Ok</button>
                    </div>
                </div>
            </div>

            <!-- Empty inputs error popup -->
            <div v-if="showEmptyInputError" class="modal-overlay" role="alertdialog" aria-labelledby="error-title" aria-describedby="error-message">
                <div class="modal-content error-modal">
                    <h2 id="error-title">Missing Information</h2>
                    <p id="error-message">{{ isSimpleCategory ? 'Please enter a quantity.' : 'Please fill in all fields: quantity, gender, and size are required before confirming.' }}</p>
                    <div class="form-actions">
                        <button type="button" class="save-button" @click="showEmptyInputError = false">
                            Ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, } from 'vue';

const categories = ['Shirts', 'Pants', 'Jackets', 'Underwear', 'Shoes', 'Snack Packs', 'Hygiene Packs', 'Blankets'];
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
const shoeSizeOptions = (() => {
  const sizes: string[] = [];
  for (let n = 5; n <= 14.5; n += 0.5) sizes.push(String(n));
  return sizes;
})();

const selectedCategory = ref('');
const categoryDetails = ref<{
    catDetails:{category:string, quantity:number,genders:{name:string,info:{size:string,quantity:number}[]}[]}[]
}>({
    catDetails:[]
});
const addForm = ref({
    quantity: null as number | null,
    gender: '',
    size: '',
});

const showEmptyInputError = ref(false);
const showAdditionSuccessPopup = ref(false);
const inventory = ref<any[]>([]);


const isShoes = computed(() => selectedCategory.value === 'Shoes');
const simpleCategories = ['Snack Packs', 'Hygiene Packs', 'Blankets'];
const isSimpleCategory = computed(() => simpleCategories.includes(selectedCategory.value));
const formSizeOptions = computed(() => (isShoes.value ? shoeSizeOptions : sizeOptions));
const formSizeLabel = computed(() => (isShoes.value ? 'Shoe size' : 'Size'));

function sizesToShowForGender(gender:{name:string,info:{size:string,quantity:number}[]}): string[] {
  console.log(shoeSizeOptions.filter((s) => 
  gender.info.some((row) => row.size === s && row.quantity > 0)
))
  return shoeSizeOptions.filter((s) => 
  gender.info.some((row) => row.size === s && row.quantity > 0)
);
}

function genderHasAnyInventory(gender:{name:string,info:{size:string,quantity:number}[]}): boolean {
  if (!isShoes.value) return true;
  return sizesToShowForGender(gender).length > 0;
}

function selectCategory(cat: string) {
    selectedCategory.value = cat;
    addForm.value = { quantity: null, gender: '', size: '' };
    fetchCategoryDetails(cat);
}

watch(isShoes, () => {
    addForm.value.size = '';
});

async function fetchCategoryDetails(category: string) {
    try {
        const data = await $fetch('/api/inventory', {
            params: { category },
        });
        categoryDetails.value = {catDetails:data.length > 0? data : [{
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
                ]}]};
    } catch (err) {
        console.error('Error fetching category details:', err);
        categoryDetails.value = { catDetails:[]};
    }
}

async function confirmAddition() {
    const qty = addForm.value.quantity;
    const isSimple = isSimpleCategory.value;

    if (qty == null || qty < 1) {
        showEmptyInputError.value = true;
        return;
    }
    if (!isSimple) {
        const gender = addForm.value.gender.trim();
        const size = addForm.value.size;
        if (!gender || !size) {
            showEmptyInputError.value = true;
            return;
        }
    }

    try {
        await $fetch('/api/inventory/', {
            method: 'POST',
            body: {
                category: selectedCategory.value,
                gender: isSimple ? 'Unisex' : addForm.value.gender,
                size: isSimple ? 'N/A' : addForm.value.size,
                quantity: qty,
            },
        });
        await getInventory();
        await fetchCategoryDetails(selectedCategory.value);
        addForm.value = { quantity: null, gender: '', size: '' };
        showAdditionSuccessPopup.value = true;
    } catch (err) {
        console.error('Error adding item:', err);
    }
}

function getTodayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return { start, end };
}

async function checkAndCreateNewDay() {
    try {
        await $fetch('/api/inventory/check-new-day', { method: 'POST' });
    } catch (error) {
        console.error('Failed to check/create new day:', error);
    }
}

async function getInventory() {
    try {
        await checkAndCreateNewDay();
        const { start, end } = getTodayRange();
        inventory.value = await ($fetch as any)('/api/inventory/', {
            method: 'GET',
            params: { start: start.toISOString(), end: end.toISOString() },
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

onMounted(getInventory);

// Refetch category details when inventory updates (e.g. after adding)
watch(inventory, () => {
    if (selectedCategory.value) {
        fetchCategoryDetails(selectedCategory.value);
    }
}, { deep: true });
</script>

<style scoped>
.inventory-page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: calc(100vh - 130px);
    height: calc(100vh - 130px);
    overflow: hidden;
}

.inventory-container {
    font-family: 'sans-serif', Arial;
    padding: 2em;
    background-color: #f0f2f5;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

h1 {
    font-size: 2.5em;
    color: #3f51b5;
    margin-bottom: 1em;
    text-align: center;
}

/* Top 1/3 */
.top-section {
    flex: 0 0 auto;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding-bottom: 1em;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 0.6rem;
    align-items: stretch;
}

.category-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    aspect-ratio: 4 / 3;
    padding: clamp(0.35rem, 1vw, 0.6rem);
    border-radius: 8px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: #fff;
    color: #333;
    font-weight: 600;
    cursor: pointer;
    transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease, border-color 120ms ease;
}

.category-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
    border-color: rgba(63, 81, 181, 0.4);
}

.category-button--selected {
    background: #3f51b5;
    color: #fff;
    border-color: #3f51b5;
    box-shadow: 0 4px 12px rgba(63, 81, 181, 0.4);
}

.category-button .label {
    font-size: clamp(0.75rem, 2vw, 1.5rem);
    text-align: center;
    line-height: 1.1;
    word-break: break-word;
}

/* Bottom 2/3 */
.bottom-section {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: 1.5rem;
    align-items: stretch;
}

.bottom-section > * {
    min-height: 0;
}

.inventory-display,
.add-form-panel {
    background: #fff;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
}

.inventory-display h2,
.add-form-panel h2 {
    font-size: 1.15rem;
    color: #3f51b5;
    margin-top: 0;
    margin-bottom: 1rem;
}

.inventory-display__placeholder,
.add-form__placeholder {
    color: #888;
    font-weight: normal;
}

.inventory-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.detail-row {
    display: flex;
    gap: 0.5rem;
}

.detail-label {
    font-weight: 600;
    min-width: 140px;
}

.detail-value {
    color: #333;
}

.detail-row--total {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #eee;
}

.gender-section {
    margin-bottom: 1.25rem;
}

.gender-section:last-child {
    margin-bottom: 0;
}

.gender-section__title {
    font-size: 1rem;
    color: #3f51b5;
    margin: 0 0 0.5rem 0;
}

.breakdown-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.breakdown-table th,
.breakdown-table td {
    padding: 0.4rem 0.6rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.breakdown-table th {
    background: #f5f5f5;
    font-weight: 600;
}

.breakdown-table th:last-child,
.breakdown-table td:last-child {
    text-align: right;
}

.inventory-display__empty,
.inventory-display__empty-gender {
    color: #888;
    font-size: 0.9rem;
    margin: 0.5rem 0 0 0;
}

.add-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.35rem;
    color: #333;
    font-weight: 500;
}

.form-group input[type="number"],
.form-group select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.form-actions--bottom {
    margin-top: auto;
    padding-top: 1rem;
    justify-content: flex-end;
}

.confirm-addition-btn {
    padding: 0.6rem 1.25rem;
    background: #4caf50;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.confirm-addition-btn:hover {
    background: #43a047;
}

/* Modals */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 1.5rem;
    border-radius: 8px;
    width: 90%;
    max-width: 420px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
    margin-top: 0;
    margin-bottom: 0.75rem;
}

.error-modal h2 {
    color: #c0392b;
}

.success-modal h2 {
    color: #27ae60;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1rem;
}

.save-button,
.cancel-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.save-button {
    background: #4caf50;
    color: #fff;
}

.cancel-button {
    background: #757575;
    color: #fff;
}

@media (max-width: 768px) {
    .bottom-section {
        grid-template-columns: 1fr;
    }
}
</style>
