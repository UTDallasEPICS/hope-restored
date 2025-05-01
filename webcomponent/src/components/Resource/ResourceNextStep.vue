<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { ChevronDownIcon } from "@heroicons/vue/20/solid";
import { defineProps } from "vue";
import ClickToCopy  from "../ClickToCopy.vue"
export interface ResourceNextStepProps {
  icon: any;
  flavorText: string;
  items: string[];
}
const props = defineProps<ResourceNextStepProps>();

function splitInfoAndValues(list: string[]): { value: string; info: string }[] {
  return list.map(item => {
    const infoMatch = item.match(/\[(.*?)\]/);
    const info: string = infoMatch ? infoMatch[1].trim() : '';
    const value: string = item.replace(/\s*\[.*?\]\s*/g, '').trim();

    return { value, info };
  });
}

const splitItems = splitInfoAndValues(props.items);

</script>

<template>
  <Disclosure v-slot="{ open }">
    <div class="flex flex-col">
      <DisclosureButton class="flex flex-initial flex-row justify-between">
        <div class="flex flex-auto flex-row items-center gap-x-2">
          <component :is="icon" class="w-4 h-4" />
          <span>{{ flavorText }}</span>
        </div>
        <ChevronDownIcon
          class="w-4 h-4"
          :class="open && 'rotate-180 transform'"
        />
      </DisclosureButton>
      <transition
        enter-active-class="transition-all duration-100 overflow-hidden"
        enter-from-class="transform scaley-y-95 opacity-0 max-h-0"
        enter-to-class="transform scale-y-100 opacity-100 max-h-full"
        leave-active-class="transition-all duration-100 overflow-hidden"
        leave-from-class="transform scale-y-100 opacity-100 max-h-full"
        leave-to-class="transform scale-y-95 opacity-0 max-h-0"
      >
        <DisclosurePanel>
          <ul class="flex flex-auto flex-col gap-y-2">
            <li v-for="item in splitItems" :key="item.value">
                <ClickToCopy
                    :text="item.value"
                />
                <span> [{{item.info}}]</span>
            </li>
          </ul>
        </DisclosurePanel>
      </transition>
    </div>
  </Disclosure>
</template>
