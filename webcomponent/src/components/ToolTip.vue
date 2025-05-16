<script lang="ts" setup>
import { defineProps, ref } from "vue";

export interface ToolTipProps {
    text: string;
    relativePosition: string;
    styling: string
}
const props = defineProps<ToolTipProps>();

function getTooltipPosition(){
    switch (props.relativePosition) {
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
const tooltipClass = "absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none " + tooltipPosition + " " + props.styling
</script>
<template>
    <div class="relative group inline-block h-full inline-flex flex items-center justify-center">
        <!-- Tooltip div -->
        <div :class="tooltipClass"
            >
            {{text}}
        </div>
        <slot />
    </div>
</template>