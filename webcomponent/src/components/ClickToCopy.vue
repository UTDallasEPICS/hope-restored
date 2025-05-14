<script lang="ts" setup>
import { defineProps, ref } from "vue";
import PopUp from './PopUp.vue';
const showPopup = ref(false);
export interface ClickToCopyProps {
  text: string;
  tooltipPosition: string | null;
}
const props = defineProps<ClickToCopyProps>();

async function copyToClipboard(textToCopy:string) {
try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
        console.error('Copy failed:', err);
  }
};

function getTooltipPosition(){
    switch (props.tooltipPosition) {
        case 'top':
            return 'bottom-full left-0 mb-2';
        case 'bottom':
            return 'top-full left-0 mt-2';
        case 'left':
            return 'top-1/2 right-full transform -translate-y-1/2 mr-2';
        case 'right':
            return 'top-1/2 left-full transform -translate-y-1/2 ml-2';
        default:
            return '';
    }
};

const tooltipPosition = getTooltipPosition();
</script>
<template>
  <PopUp v-model:visible="showPopup">
    <p class='text-center'>Copied to Clipboard</p>
  </PopUp>
    <div class="relative group inline-block">
        <button class="hover:underline hover:text-hrm-dark-green text-hrm-green" @click="copyToClipboard(text); showPopup=true">
        {{ text }}
        </button>
        <div class="absolute bg-hrm-dark-green text-white text-sm whitespace-nowrap p-2 rounded z-10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    pointer-events-none"
             :class="tooltipPosition">
        Copy Text
        </div>
    </div>
</template>
