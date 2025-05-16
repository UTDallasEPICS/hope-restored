<script setup lang="ts">
    import { defineProps, defineEmits, watch } from 'vue'
    import { XMarkIcon } from "@heroicons/vue/24/solid";
    export interface PopupProps {
        visible: boolean
        timeout: number
        styling: string
        closeButtonStyling: string

    }
    const props = defineProps<PopupProps>()
    const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>()

    function close() {
        emit('update:visible', false)
    }

    watch ( 
        () => props.visible, 
        (isVisible: boolean) => {
            if (isVisible) {
                setTimeout(() => { emit('update:visible', false)}, props.timeout)
            }
        }
    )
</script>
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
            class="fixed bottom-4 left-1/2 transform -translate-x-1/2"
            :class="styling"
        >
            <button
                @click="close"
                class="absolute top-2 right-2"
                :class=closeButtonStyling
            >
                <XMarkIcon class="w-5 h-5"/>
            </button>
            <slot>
            </slot>
        </div>
  </transition>
</template>
  