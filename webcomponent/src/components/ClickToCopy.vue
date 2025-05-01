<script lang="ts" setup>
import { defineProps } from "vue";
export interface ClickToCopyProps {
  text: string;
}
defineProps<ClickToCopyProps>();

async function copyToClipboard(textToCopy:string) {
try {
    await navigator.clipboard.writeText(textToCopy);
    alert('Copied to clipboard!');
  } catch (err) {
        console.error('Copy failed:', err);
  }
};

</script>
<template>
    <button class="hover:underline" @click="copyToClipboard(text)">
      {{ text }}
    </button>
</template>
