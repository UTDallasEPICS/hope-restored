<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <form class="bg-white rounded shadow p-6 max-w-md flex flex-col gap-4" @submit.prevent="confirmCreation">
      <h1 class="text-xl font-semibold">New item type</h1>

      <p v-if="loadError" class="text-red-600 text-sm" role="alert">{{ loadError }}</p>
      <p v-else-if="!available.length" class="text-gray-600 text-sm">Every item type already has QR codes.</p>

      <template v-else>
        <label class="flex flex-col text-sm">
          Item type
          <select v-model="category" class="border rounded px-2 py-1" required>
            <option value="">Select type</option>
            <option v-for="c in available" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <fieldset class="text-sm">
          <legend class="mb-1">Sizes</legend>
          <label v-for="p in presets" :key="p.value" class="flex items-center gap-2">
            <input v-model="sizePreset" type="radio" :value="p.value" /> {{ p.label }}
          </label>
        </fieldset>

        <fieldset class="text-sm">
          <legend class="mb-1">Genders (leave empty for none)</legend>
          <label v-for="g in qrGenderOptions" :key="g" class="flex items-center gap-2">
            <input v-model="genders" type="checkbox" :value="g" /> {{ g }}
          </label>
        </fieldset>

        <button type="submit" :disabled="submitting || !category" class="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50">
          {{ submitting ? "Creating..." : "Create QR codes" }}
        </button>
      </template>

      <NuxtLink to="/qr-code" class="text-blue-600 underline text-sm">Back to QR codes</NuxtLink>
    </form>

    <!-- Success popup -->
    <div
      v-if="successMessage"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="success-title"
      aria-describedby="success-message"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="success-title" class="text-lg font-semibold text-green-600">Success</h2>
        <p id="success-message" class="text-sm text-gray-700">{{ successMessage }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            @click="successMessage = ''"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <!-- Create failed error popup -->
    <div
      v-if="errorMessage"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="create-error-title"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="create-error-title" class="text-lg font-semibold text-red-600">Could not create QR codes</h2>
        <p class="text-sm text-gray-700">{{ errorMessage }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
            @click="errorMessage = ''"
          >
            Ok
          </button>
        </div>
      </div>
    </div>

    <!-- Creation confirmation popup -->
    <div
      v-if="showConfirmPopup"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="confirm-create-title"
      aria-describedby="confirm-create-message"
    >
      <div class="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
        <h2 id="confirm-create-title" class="text-lg font-semibold text-gray-900">Confirm New Item Type</h2>
        <p id="confirm-create-message" class="text-sm text-gray-700">
          Please confirm the following details are correct. QR codes will be created for every size and gender listed.
        </p>
        <ul class="mt-2 pl-5 list-disc text-sm text-gray-700">
          <li><strong>Item type:</strong> {{ category }}</li>
          <li><strong>Sizes:</strong> {{ presetLabel }}</li>
          <li><strong>Genders:</strong> {{ genders.length ? genders.join(", ") : "None" }}</li>
          <li><strong>QR codes to create:</strong> {{ codeCount }}</li>
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
            @click="submit"
          >
            {{ submitting ? "Creating..." : "Confirm" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSizesForPreset, qrGenderOptions, type QRSizePreset } from "../../composables/inventorySizes";

const presets = [
  { value: "apparel", label: "Apparel (XS - 4XL+)" },
  { value: "shoes", label: "Shoes (5 - 14.5)" },
  { value: "one-size", label: "One size" },
];

const available = ref<string[]>([]);
const loadError = ref("");
const category = ref("");
const sizePreset = ref("apparel");
const genders = ref<string[]>([]);
const submitting = ref(false);
const showConfirmPopup = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const presetLabel = computed(() => presets.find((p) => p.value === sizePreset.value)?.label ?? "");
const codeCount = computed(
  () => Math.max(genders.value.length, 1) * getSizesForPreset(sizePreset.value as QRSizePreset).length,
);

async function loadAvailable() {
  try {
    const res = await $fetch<{ available: string[] }>("/api/qr-codes/types", { credentials: "include" });
    available.value = res.available;
  } catch (err: any) {
    loadError.value = err?.data?.message ?? "Could not load item types.";
  }
}
await loadAvailable();

// Asks the user to confirm before creating anything
function confirmCreation() {
  if (!category.value) return;
  showConfirmPopup.value = true;
}

async function submit() {
  submitting.value = true;
  try {
    const res = await $fetch<{ count: number }>("/api/qr-codes/types", {
      method: "POST",
      credentials: "include",
      body: { category: category.value, sizePreset: sizePreset.value, genders: genders.value },
    });
    showConfirmPopup.value = false;
    successMessage.value = `Created ${res.count} QR code(s) for ${category.value}.`;
    category.value = "";
    genders.value = [];
    await loadAvailable();
  } catch (err: any) {
    showConfirmPopup.value = false;
    errorMessage.value = err?.data?.message ?? "Could not create the QR codes. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
