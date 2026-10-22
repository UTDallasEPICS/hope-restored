<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <form class="bg-white rounded shadow p-6 max-w-md flex flex-col gap-4" @submit.prevent="submit">
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

      <p v-if="message" class="text-green-600 text-sm" role="status">{{ message }}</p>
      <p v-if="errorMessage" class="text-red-600 text-sm" role="alert">{{ errorMessage }}</p>
      <NuxtLink to="/qr-code" class="text-blue-600 underline text-sm">Back to QR codes</NuxtLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { qrGenderOptions } from "../../composables/inventorySizes";

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
const message = ref("");
const errorMessage = ref("");

async function loadAvailable() {
  try {
    const res = await $fetch<{ available: string[] }>("/api/qr-codes/types", { credentials: "include" });
    available.value = res.available;
  } catch (err: any) {
    loadError.value = err?.data?.message ?? "Could not load item types.";
  }
}
await loadAvailable();

async function submit() {
  message.value = "";
  errorMessage.value = "";
  submitting.value = true;
  try {
    const res = await $fetch<{ count: number }>("/api/qr-codes/types", {
      method: "POST",
      credentials: "include",
      body: { category: category.value, sizePreset: sizePreset.value, genders: genders.value },
    });
    message.value = `Created ${res.count} QR code(s) for ${category.value}.`;
    category.value = "";
    genders.value = [];
    await loadAvailable();
  } catch (err: any) {
    errorMessage.value = err?.data?.message ?? "Could not create the QR codes. Please try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
