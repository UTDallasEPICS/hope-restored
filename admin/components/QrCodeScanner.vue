<!-- components/QrCodeScanner.vue -->
<template>
    <div class="qr-code-scanner">
        <QrReader @decode="onDecode"
                  @init="onInit"
                  :paused="paused"
                  :constraints="constraints"
                  class="scanner-view" />
        <div v-if="initializing" class="scanner-info">
            Initializing Camera...
        </div>
        <div v-if="error" class="scanner-error">
            {{ error }}
        </div>

        <!-- Add Item Modal -->
        <div v-if="showAddItemModal" class="modal-overlay">
            <div class="modal-content">
                <h2>Add Scanned Item to Inventory</h2>
                <form @submit.prevent="addItem">
                    <!-- Display scanned code -->
                    <div class="form-group">
                        <label>Scanned Code:</label>
                        <p>{{ scannedCode }}</p>
                    </div>
                    <!-- Rest of the form fields -->
                    <div class="form-group">
                        <label for="category">Category:</label>
                        <input v-model="newItem.category" id="category" required />
                    </div>
                    <div class="form-group">
                        <label for="style">Style:</label>
                        <input v-model="newItem.style" id="style" required />
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender:</label>
                        <input v-model="newItem.gender" id="gender" required />
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
                                @click="cancelAddItem"
                                class="cancel-button">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import QrReader from 'vue3-qr-reader';

    const initializing = ref(true);
    const error = ref<string | null>(null);
    const paused = ref(false);
    const showAddItemModal = ref(false);
    const scannedCode = ref('');
    const constraints = ref({
        audio: false,
        video: {
            facingMode: 'environment',
        },
    });

    const newItem = ref({
        category: '',
        style: '',
        gender: '',
        size: '',
        quantity: 1,
        location: '',
    });

    function onDecode(decodedString: string) {
        // Handle the decoded QR code data
        console.log('Decoded string:', decodedString);
        scannedCode.value = decodedString;
        showAddItemModal.value = true;
        paused.value = true; // Pause the scanner after successful scan
    }

    function onInit(promise: Promise<void>) {
        promise
            .then(() => {
                initializing.value = false;
            })
            .catch((e) => {
                error.value = e.message || 'Cannot initialize QR reader';
            });
    }

    const addItem = () => {
        // Here you would typically send the new item to your backend API
        // For this example, we'll just log it to the console
        const itemToAdd = {
            scannedCode: scannedCode.value,
            ...newItem.value,
        };

        console.log('Item to add:', itemToAdd);

        // Reset the form and close the modal
        newItem.value = {
            category: '',
            style: '',
            gender: '',
            size: '',
            quantity: 1,
            location: '',
        };
        scannedCode.value = '';
        showAddItemModal.value = false;
        paused.value = false; // Resume scanning if needed
    };

    const cancelAddItem = () => {
        // Reset the form and close the modal
        newItem.value = {
            category: '',
            style: '',
            gender: '',
            size: '',
            quantity: 1,
            location: '',
        };
        scannedCode.value = '';
        showAddItemModal.value = false;
        paused.value = false; // Resume scanning if needed
    };
</script>

<style scoped>
    /* General Styling */
    .qr-code-scanner {
        position: relative;
        width: 100%;
        height: calc(100vh - 60px); /* Adjust based on your header/footer height */
        font-family: 'Open Sans', sans-serif;
    }

    .scanner-view {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .scanner-info,
    .scanner-error {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        color: white;
        text-align: center;
        padding: 10px;
    }

    .scanner-error {
        background-color: rgba(255, 0, 0, 0.7);
    }

    .scanner-info {
        background-color: rgba(0, 0, 0, 0.7);
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

        .form-group p {
            font-weight: bold;
            color: #555;
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
</style>
