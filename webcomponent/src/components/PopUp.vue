<template>
    <transition
    enter-active-class="transition-opacity transition-transform duration-200"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-show="visible"
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-6 max-w-xs w-1/2 z-30 scale-90"
    >
      <button
        @click="close"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        &times;
      </button>
      <slot>
      </slot>
    </div>
  </transition>
  </template>
  
  <script setup lang="ts">
  import { defineProps, defineEmits, watch } from 'vue'
  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()
  
  function close() {
    emit('update:visible', false)
  }

  watch (
  () => props.visible,
  (isVisible: boolean) => {
    if (isVisible) {
      setTimeout(() => {
        emit('update:visible', false)
      }, 2000)
    }
  }
)
  </script>
  