<template>
    <div
        class="grid grid-cols-4 gap-4 py-4 w-full bg-black/30 rounded-lg px-4"
    >
        <div
        :class="[
            'col-span-1',
            { skeleton: isImageCheckingProcessing },
        ]"
        data-test="cover"
        >
        <img
            v-if="isAnImage && !isImageCheckingProcessing"
            :src="cover"
            :alt="title"
            class="rounded-lg object-cover object-fit"
            data-test="cover-image"
        />
        <img
            v-if="!isAnImage && !isImageCheckingProcessing"
            src="../../assets/logo.png"
            :alt="title"
            class="object-cover object-center"
        />
        </div>
        <div class="col-span-3 flex flex-col justify-center">
            <p class="uppercase font-bold">{{ title }}</p>
            <p class="italic text-sm capitalize">{{ album }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

const props = defineProps({
    cover: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    album: {
        type: String,
        required: true,
    },
});

const isImageCheckingProcessing = ref(false);
const checkIfImageExists = (url: string): boolean => {
  const img = new Image();
  img.src = url;

  isImageCheckingProcessing.value = true;
  let isAnImage = false;
  if (img.complete) {
    isAnImage = true;
  } else {
    img.onload = () => {
      isAnImage = true;
    };

    img.onerror = () => {
      isAnImage = false;
    };
  }
  isImageCheckingProcessing.value = false;

  return isAnImage;
};

const isAnImage = ref(false);
onBeforeMount(() => {
    isAnImage.value = props.cover ? checkIfImageExists(props.cover) : false;
});
</script>

<style scoped>
.skeleton {
  animation: skeleton-loading 1.5s linear infinite alternate;
}

@keyframes skeleton-loading {
  from {
    background-color: hsl(200, 20%, 80%);
  }
  to {
    background-color: hsl(200, 20%, 95%);
  }
}
</style>