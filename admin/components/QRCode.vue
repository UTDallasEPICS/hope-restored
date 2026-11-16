<template>
<div>
    <h1>{{ props.value }}</h1>
    <img v-if="src" :src="src" alt="QR code" />
</div>
  
</template>


<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{ value: string }>()
const src = ref('')

const requestUrl = useRequestURL()

const fullUrl = computed(() => {
  const path = props.value.replace(/^\/+/, '')
  return `${requestUrl.origin}/qr-code/${encodeURIComponent(path)}`
})

watchEffect(async () => {
  src.value = await QRCode.toDataURL(fullUrl.value, { width: 512, margin: 2 })
})
</script>

