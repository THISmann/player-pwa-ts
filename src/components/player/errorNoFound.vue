<template>
    <VueFinalModal class="flex justify-center items-center w-full p-1">
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-6 rounded-lg">
            <h1 class="text-red-500"> {{ radioStore.radioErrMsg }} </h1>
        </div>
    </VueFinalModal>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import { VueFinalModal } from 'vue-final-modal';
import { useRadioStore } from '@/store/radioStore';

// Define the props this component accepts
const radioStore = useRadioStore();
const props = defineProps<{
    title?: string;
    id?: number;
}>();


</script>