<template>
  <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
    <h1 class="text-2xl font-semibold mb-4">QR Codes</h1>

    <div class="flex flex-wrap gap-4 mb-6">
      <label class="flex flex-col text-sm">
        Clothing type
        <select v-model="category" class="border rounded px-2 py-1 bg-white">
          <option value="">Select type</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label class="flex flex-col text-sm">
        Gender
        <select v-model="gender" class="border rounded px-2 py-1 bg-white">
          <option value="">Select gender</option>
          <option v-for="g in genders" :key="g" :value="g">{{ g }}</option>
        </select>
      </label>
    </div>

    <p v-if="pending">Loading QR codes...</p>
    <p v-else-if="error" class="text-red-600">Could not load QR codes.</p>
    <p v-else-if="!category || !gender" class="text-gray-600">
      Choose a clothing type and gender to view QR codes.
    </p>
    <p v-else-if="!filtered.length" class="text-gray-600">No QR codes found.</p>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <figure v-for="item in filtered" :key="item.code" class="bg-white rounded p-2 text-center shadow">
        <img :src="`/qr-code/${item.code}.png`" :alt="`QR code for ${item.category} ${item.gender} ${item.size}`" class="w-full" />
        <figcaption class="text-sm font-medium">{{ item.size || 'One size' }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
type QRItem = { code: string; category: string; gender: string | null; size: string | null }

const { data, pending, error } = await useFetch<QRItem[]>('/api/qr-codes')
const category = ref('')
const gender = ref('')

const items = computed(() => data.value ?? [])
const categories = computed(() => [...new Set(items.value.map((i) => i.category))].sort())
const genders = computed(() =>
  [...new Set(items.value.filter((i) => !category.value || i.category === category.value).map((i) => i.gender).filter(Boolean))] as string[]
)
watch(category, () => { gender.value = '' })

// API returns items already sorted so the grid reads smallest to largest
const filtered = computed(() =>
  items.value.filter((i) => i.category === category.value && i.gender === gender.value)
)
</script>
