<script setup lang="ts">
    import { defineProps, defineEmits, watch } from 'vue'
    import { ChevronDoubleRightIcon, ChevronDoubleLeftIcon } from "@heroicons/vue/24/solid";
    import ToolTip from "./ToolTip.vue"
    export interface SidebarProps {
        visible: boolean
        styling: string
        closedStyling: string
        headerStyling: string
        buttonStyling: string
        headerText: string
        sidebarWidth: number
    }
    const props = defineProps<SidebarProps>()
    const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>()

    function close() {
        emit('update:visible', false)
    }

    function open() {
        emit('update:visible', true)
    }
    const sidebarStyling = props.styling + " w-" +  props.sidebarWidth
</script>
<template>
    <!-- Sidebar when closed -->
    <div 
        v-show="!visible"
        :class="closedStyling"
    >
        <button
            @click="open"
            :class=buttonStyling
        >
            <ToolTip    
                text="Edit Search Settings" 
                relativePosition="right"
                styling="bg-hrm-dark-green text-white text-sm whitespace-nowrap p-2 rounded z-10"
            >
                <ChevronDoubleRightIcon class="w-5 h-5"/>
            </ToolTip>
        </button>
    </div>

    <!-- Sidebar when opened -->
    <transition
        enter-active-class="transition-transform duration-200"
        enter-from-class="translate-x-[-90%]"
        enter-to-class="translate-x-0"
        leave-active-class="transition-all duration-200"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-[-90%]"
    >
        <div
            v-show="visible"
            :class="sidebarStyling"
        >
            <header 
                class="flex justify-end gap-x-10"
                :class=headerStyling
            >
                <p>{{headerText}}</p>
                <button
                    @click="close"
                    :class=buttonStyling
                >
                    <ChevronDoubleLeftIcon class="w-5 h-5"/>
                </button>
            </header>
            <slot />
        </div>
    </transition>
</template>
  