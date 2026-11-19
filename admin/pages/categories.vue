// Categories page form

<template>
  <div class="bg-gray-100 min-h-screen px-4 py-6 md:px-8 font-sans">
    <div class="max-w-4xl mx-auto flex flex-col gap-6">

      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h1 class="text-2xl font-bold text-indigo-600 mb-4">Create Category</h1>
        <p v-if="error" class="text-red-600 text-sm mb-3">{{ error }}</p>

        <form @submit.prevent="handleCreate" class="flex flex-col gap-3 max-w-md">
          <input v-model="catName" type="text" placeholder="Category name" class="field" />

          <select v-model="sizeType" class="field">
            <option value="">Select size type</option>
            <option v-for="s in sizeTypes" :key="s" :value="s">{{ s }}</option>
          </select>

          <div>
            <p class="text-sm mb-1">Genders (select any; leave all unchecked for unisex)</p>
            <label v-for="g in genderOptions" :key="g" class="mr-4 text-sm">
              <input type="checkbox" :value="g" v-model="selectedGenders" /> {{ g }}
            </label>
          </div>

          <button type="submit" class="btn">Create Category</button>
        </form>
      </section>

      <section class="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
        <h2 class="text-xl font-bold text-indigo-600 mb-4">Existing Categories</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b border-gray-200">
              <th class="py-2">Name</th><th>Size type</th><th>Genders</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in categories" :key="c.id" class="border-b border-gray-100">
              <td class="py-2">{{ c.catName }}</td>
              <td>{{ c.sizeType }}</td>
              <td>{{ c.genders.join(', ') || 'Unisex' }}</td>
              <td class="text-right">
                <button @click="removeCategory(c.id)" class="text-red-600 font-semibold">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// TEMP: API calls with backend

const sizeTypes = ["Lettered", "Numbered", "None"];
const genderOptions = ["Male", "Female", "Child"];

const catName = ref("");
const sizeType = ref("");
const selectedGenders = ref<string[]>([]);
const error = ref("");

const categories = ref([
  { id: 1, catName: "Backpacks", sizeType: "None", genders: [] as string[] },
  { id: 2, catName: "Coats", sizeType: "Lettered", genders: ["Male", "Female", "Child"] },
  { id: 3, catName: "Boots", sizeType: "Numbered", genders: ["Male", "Female"]},
]);

function handleCreate() {
  error.value = "";
  if (!catName.value.trim() || !sizeType.value) {
    error.value = "Name and size type are required.";
    return;
  }

    if (categories.value.some((c) => c.catName.toLowerCase() === catName.value.trim().toLowerCase())) {
    error.value = "That category already exists.";
    return;
  }
  
  categories.value.push({
    id: Date.now(),
    catName: catName.value.trim(),
    sizeType: sizeType.value,
    genders: [...selectedGenders.value],
  });
  catName.value = "";
  sizeType.value = "";
  selectedGenders.value = [];
}

function removeCategory(id: number) {
  categories.value = categories.value.filter((c) => c.id !== id);
}
</script>

<style scoped>
.field { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
.btn { padding: 0.7rem 1rem; font-weight: 600; color: #fff; background: #2563eb; border-radius: 0.375rem; }
.btn:hover { background: #1d4ed8; }
</style>