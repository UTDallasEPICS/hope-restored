<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <div v-if="!item" class="bg-white rounded shadow p-6 max-w-md">
      <h1 class="text-xl font-semibold mb-2">Unknown item</h1>
      <p class="text-gray-600 mb-4">No item matches the code "{{ code }}".</p>
      <NuxtLink to="/qr-code" class="text-blue-600 underline">Back to QR codes</NuxtLink>
    </div>

    <form v-else class="bg-white rounded shadow p-6 max-w-md flex flex-col gap-4" @submit.prevent="addToInventory">
      <h1 class="text-xl font-semibold">Add to inventory</h1>

      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt class="font-medium">Clothing type</dt><dd>{{ item.category }}</dd>
        <dt class="font-medium">Size</dt><dd>{{ item.size }}</dd>
        <dt class="font-medium">Gender</dt><dd>{{ item.gender }}</dd>
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

      <p v-if="message" class="text-green-600 text-sm" role="status">{{ message }}</p>
      <p v-if="errorMessage" class="text-red-600 text-sm" role="alert">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { getQRCatalog } from "../../composables/inventorySizes";

const route = useRoute();
const code = String(route.params.code);
const item = getQRCatalog().find((i) => i.code === code);

const quantity = ref(1);
const submitting = ref(false);
const message = ref("");
const errorMessage = ref("");

async function addToInventory() {
  if (!item) return;
  message.value = "";
  errorMessage.value = "";

  if (!Number.isInteger(quantity.value) || quantity.value < 1) {
    errorMessage.value = "Quantity must be a whole number of at least 1.";
    return;
  }

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
    message.value = `Added ${quantity.value} to ${item.gender} ${item.category} (${item.size}).`;
    quantity.value = 1;
  } catch (err: any) {
    errorMessage.value = err?.data?.message ?? "Could not add the item. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
