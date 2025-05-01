<script lang="ts" setup>
import { defineProps } from "vue";
export interface ClickToCopyProps {
  text: string;
}
defineProps<ClickToCopyProps>();

const copyToClipboard = (textToCopy) => {

};

</script>
<template>
    <button class="hover:underline" @click="copyToClipboard(text)">
      {{ text }}
    </button>
</template>
