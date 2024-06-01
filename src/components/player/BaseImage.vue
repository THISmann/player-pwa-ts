<template>
  <img
    :src="getImageUrl"
    :alt="alt ?? 'image'"
    loading="eager"
    :fetchpriority="fetchPriority"
  />
</template>

<script setup lang="ts">
import { PropType, computed } from "vue";

type Priority = "low" | "high" | "auto";

const props = defineProps({
  path: {
    type: String,
  },
  alt: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  fetchPriority: {
    type: String as PropType<Priority>,
    default: "auto",
    validator(value: string): boolean {
      return ["low", "high", "auto"].includes(value);
    },
  },
});

const getPathUrl = computed<string>(() =>
  props.path ? `${props.path}/${props.name}` : props.name
);
const getImageUrl = computed(
  (): string =>
    new URL(`../../assets/${getPathUrl.value}.png`, import.meta.url).href
);
</script>
