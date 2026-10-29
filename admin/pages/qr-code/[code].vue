<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-[calc(100vh-130px)] flex items-center justify-center">
    <div v-if="!item" class="bg-white rounded shadow p-6 max-w-md">
      <h1 class="text-xl font-semibold mb-2">Unknown item</h1>
      <p class="text-gray-600 mb-4">No item matches the code "{{ code }}".</p>
      <NuxtLink to="/qr-code" class="text-blue-600 underline">Back to QR codes</NuxtLink>
    </div>

    <form v-else class="bg-white rounded shadow p-6 max-w-md flex flex-col gap-4" @submit.prevent="confirmAddition">
      <h1 class="text-xl font-semibold">Add to inventory</h1>

      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt class="font-medium">Item type</dt><dd>{{ item.category }}</dd>
        <template v-if="item.size"><dt class="font-medium">Size</dt><dd>{{ item.size }}</dd></template>
        <template v-if="item.gender"><dt class="font-medium">Gender</dt><dd>{{ item.gender }}</dd></template>
      </dl>

      <label class="flex flex-col text-sm">
        Quantity
        <input v-model.number="quantity" type="number" min="1" step="1" class="border rounded px-2 py-1" />
      </label>

      <button
        type="submit"
        :disabled="submitting"
        class="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {{ submitting ? "Adding..." : "Add" }}
      </button>
    </form>

    <!-- Addition success popup -->
    <div
      v-if="showSuccessPopup"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="success-title"
      aria-describedby="success-message"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="success-title" class="text-lg font-semibold text-green-600">Success</h2>
        <p id="success-message" class="text-sm text-gray-700">
          Your addition has been added to the inventory.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            @click="showSuccessPopup = false"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <!-- Empty/invalid input error popup -->
    <div
      v-if="showEmptyInputError"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="error-title"
      aria-describedby="error-message"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="error-title" class="text-lg font-semibold text-red-600">Missing Information</h2>
        <p id="error-message" class="text-sm text-gray-700">
          Please enter a quantity of 1 or greater.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            @click="showEmptyInputError = false"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <!-- Add failed error popup -->
    <div
      v-if="addErrorMessage"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="add-error-title"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="add-error-title" class="text-lg font-semibold text-red-600">Could not add item</h2>
        <p class="text-sm text-gray-700">{{ addErrorMessage }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            @click="addErrorMessage = ''"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <!-- Addition confirmation popup -->
    <div
      v-if="showConfirmPopup && item"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="confirm-addition-title"
      aria-describedby="confirm-addition-message"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="confirm-addition-title" class="text-lg font-semibold text-gray-900">Confirm Addition</h2>
        <p id="confirm-addition-message" class="text-sm text-gray-700">
          Please confirm the following addition details are correct.
        </p>
        <ul class="mt-2 pl-5 list-disc text-sm text-gray-700">
          <li>
            <strong>{{ item.category }}</strong>
            <span v-if="item.gender"> - {{ item.gender }}</span>
            <span v-if="item.size"> - {{ item.size }}</span>
            : {{ quantity }}
          </li>
        </ul>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
            @click="showConfirmPopup = false"
          >
            Go Back
          </button>
          <button
            type="button"
            :disabled="submitting"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
            @click="addToInventory"
          >
            Confirm Addition
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatApiError } from "../../utils/format-api-error";

const route = useRoute();
const code = String(route.params.code);
const { data: catalog } = await useFetch<{ code: string; category: string; gender: string; size: string }[]>("/api/qr-codes");
const item = (catalog.value ?? []).find((i) => i.code === code);

const quantity = ref(1);
const submitting = ref(false);
const showConfirmPopup = ref(false);
const showSuccessPopup = ref(false);
const showEmptyInputError = ref(false);
const addErrorMessage = ref("");

// Validates the quantity, then asks the user to confirm
function confirmAddition() {
  if (!Number.isInteger(quantity.value) || quantity.value < 1) {
    showEmptyInputError.value = true;
    return;
  }
  showConfirmPopup.value = true;
}

async function addToInventory() {
  if (!item) return;
  submitting.value = true;
  try {
    await $fetch("/api/inventory/", {
      method: "POST",
      credentials: "include",
      body: {
        category: item.category,
        gender: item.gender,
        size: item.size,
        quantity: quantity.value,
      },
    });
    showConfirmPopup.value = false;
    quantity.value = 1;
    showSuccessPopup.value = true;
  } catch (err: unknown) {
    showConfirmPopup.value = false;
    addErrorMessage.value = formatApiError(err, "The item could not be saved. Please try again.");
  } finally {
    submitting.value = false;
  }
}
</script>
