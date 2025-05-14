<script lang="ts" setup>
import { defineProps, ref } from "vue";
import PopUp from './PopUp.vue';
<<<<<<< HEAD
const showPopup = ref(false);
=======
import WrapWithTooltip from './ToolTip.vue'
const showPopup = ref(false)
>>>>>>> 99cb4d9e117d344200e4faa56091f8459bce8d8c
export interface ClickToCopyProps {
  text: string;
  tooltipPosition: string;
}
const props = defineProps<ClickToCopyProps>();

async function copyToClipboard(textToCopy:string) {
try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
        console.error('Copy failed:', err);
  }
};


</script>
<template>
    <PopUp 
        v-model:visible="showPopup" 
        :timeout=4000
        styling="bg-black rounded-lg shadow-lg shadow-gray-700 border-4 border-hrm-green text-white-neutral p-6 max-w-xs w-1/2 z-30 scale-90"
        closeButtonStyling="hover:text-gray-400"
        >
        <p class='text-center'>Copied to Clipboard</p>
    </PopUp>
    <WrapWithTooltip 
        text="Copy Text" 
        :relativePosition="tooltipPosition"
        styling="bg-hrm-dark-green text-white text-sm whitespace-nowrap p-2 rounded z-10"
    >
        <button class="hover:underline hover:text-hrm-dark-green text-hrm-green" @click="copyToClipboard(text); showPopup=true">
            {{ text }}
        </button>
    </WrapWithTooltip>
</template>
