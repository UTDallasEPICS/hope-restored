<template>
  <button
    type="button"
    :class="buttonClass"
    :aria-pressed="variant === 'tile' ? selected : undefined"
    :aria-current="variant === 'tile' && selected ? 'true' : undefined"
    :aria-selected="variant === 'menu' ? selected : undefined"
    v-bind="$attrs"
    @click="$emit('click')"
  >
    <i
      v-if="showIcon && variant === 'tile'"
      class="fas fa-box"
      aria-hidden="true"
      :class="selected ? 'text-white' : 'text-indigo-600'"
    ></i>
    <span
      class="text-center leading-tight break-words max-w-full w-full"
      :class="textClass"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    selected?: boolean;
    variant?: "tile" | "menu";
    showIcon?: boolean;
  }>(),
  {
    selected: false,
    variant: "tile",
    showIcon: true,
  },
);

defineEmits<{
  (e: "click"): void;
}>();

const buttonClass = computed(() =>
  props.variant === "tile"
    ? [
        "flex flex-col items-center justify-center gap-1.5 h-20 min-h-[5rem] px-2 rounded-lg border-2 font-semibold transition hover:-translate-y-0.5 hover:shadow-md",
        props.selected
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
          : "bg-white text-gray-900 border-gray-200 hover:border-indigo-300",
      ]
    : [
        "w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 hover:bg-gray-50",
        props.selected ? "bg-indigo-600 text-white hover:bg-indigo-600" : "",
      ],
);

const textClass = computed(() =>
  props.variant === "tile"
    ? props.selected
      ? "text-white"
      : "text-gray-900 text-[clamp(0.55rem,1.2vw+0.45rem,1.25rem)]"
    : "text-left",
);
</script>