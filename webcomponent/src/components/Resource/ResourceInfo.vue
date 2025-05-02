<script lang="ts" setup>
import { defineProps } from "vue";
import {
  LanguageIcon,
  UserGroupIcon,
  CheckIcon,
  CurrencyDollarIcon,
  MapPinIcon
} from "@heroicons/vue/24/solid";
import ResourceTag from "./ResourceTag.vue";
export interface ResourceInfoProps {
  index: number;
  title: {value: string, annotation: string};
  description: string;
  languages: string[];
  demographics: string[];
  eligibility: string;
  cost: string;
  locations: string[]
}
defineProps<ResourceInfoProps>();
</script>

<template>
  <div class="flex flex-auto flex-row justify-start">
    <div class="flex flex-auto flex-col">
        <div class="flex flex-auto flex-row gap-x-2">
            <h2 class="text-hrm-green">{{ index }}. {{ title.value }} </h2>
            <h2>{{ title.annotation }}</h2>
        </div>
      <p>{{ description }}</p>
      <div class="flex flex-auto flex-col justify-start">
        <ResourceTag
          category="Languages"
          :icon="LanguageIcon"
          :tags="languages"
          :onTagClicked="() => {}"
        />
        <ResourceTag
          category="Demographics"
          :icon="UserGroupIcon"
          :tags="demographics"
          :onTagClicked="() => {}"
        />
        <ResourceTag
          category="Elligibility"
          :icon="CheckIcon"
          :tags="[eligibility]"
          :onTagClicked="() => {}"
        />
        <ResourceTag
          category="Cost"
          :icon="CurrencyDollarIcon"
          :tags="[cost]"
          :onTagClicked="() => {}"
        />
        <ResourceTag
          category="Locations"
          :icon="MapPinIcon"
          :tags="locations"
          :onTagClicked="() => {}"
        />
      </div>
    </div>
  </div>
</template>
