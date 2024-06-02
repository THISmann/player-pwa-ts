<template>
    <VueFinalModal   class="flex justify-center items-center w-full p-8">
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-3 rounded-lg  m-12">
            <!-- <button class="ml-4 text-gray-500 hover:text-gray-700" @click="emitEventGeneral">  
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button> -->
            <div class="row">
                <div id="cards-section"  class="bg-gray-700 opacity-70 p-12 max-md:hidden">
                    <div class="p-1 mx-7 flex flex-wrap gap-3 overflow-y-hidden hide-scrollbar">
                        <div v-for="data in radioStore.currentRadio.song_history" :key="data.title"
                            class="lg:w-2/5 md:w-1/2 h-44 flex items-center px-4 shadow shadow-[#F76507] rounded-md text-ellipsis overflow-x-hidden bg-gray-700">
                            <img :src="data.cover ?? img" class="rounded-lg h-40" :alt="data.title"
                                @error="($event) => $event.target.src = img" />
                            <div class="h-full w-80">
                                <h1
                                    class="text-left mx-6 text-md text-white m-0 rounded-lg truncate text-nowrap overflow-hidden">
                                    {{ data.artist_name }}
                                </h1>
                                <h1
                                    class="text-left mx-6 text-md text-white m-0 rounded-lg truncate text-nowrap overflow-hidden">
                                    {{ data.title }}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-1 mx-1 overflow-y-auto md:hidden"  >
                    <div class="flex gap-y-3 sm:w-full sm:h-28 border-black-300/75 bg-gray-700 opacity-70 rounded-lg shadow-2xl p-1 m-1 scroll overflow-x-hidden"
                        v-for="data in radioStore.currentRadio.song_history" :key="data.id">
                        <img :src="data.cover ?? img" class="rounded-lg w-1/2 h-24" :alt="data.title"
                            @error="($event) => $event.target.src = img" />
                        <div class="w-1/2 p-1">
                            <h1
                                class="text-left my-1 mx-1 text-sm w-full text-gray-100 text-ellipsis text-nowrap overflow-hidden">
                                {{ data.title }}
                            </h1>
                            <h4
                                class="text-left my-1 mx-1 text-xs w-full text-gray-400 text-ellipsis text-nowrap overflow-hidden">
                                {{ data.artist_name }}
                            </h4>
                        </div>

                    </div>
                </div>
            </div>
        </div>

    </VueFinalModal>

</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import QrcodeVue, { Level, RenderAs } from 'qrcode.vue';
import { onBeforeMount, onMounted, onUnmounted, ref ,defineEmits } from "vue";
import { useRadioStore } from '@/store/radioStore';
import { VueFinalModal } from 'vue-final-modal';
const radioStore = useRadioStore();
import img from "./logo.png";

const showModal = ref(true);
const emit = defineEmits(['close-event'])

const emitEventGeneral = () => {
  emit('close-event');
};

 

</script>