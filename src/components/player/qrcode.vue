<template>
    <VueFinalModal class="flex justify-center items-center w-full p-1">
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-6 rounded-lg">
            <div class="justify-center items-center mx-14">
                <qrcode-vue :value="qrcodeUrl" level="H" />
            </div>
            <div class="flex justify-center items-center h-full">
                 <!-- <button @click="openQrCodeInBrowser">Open QR Code</button> -->
            <button class="bg-black rounded-md flex  p-1" @click="shareUrl"> <svg class="m-1" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 12C9 13.3807 7.88071 14.5 6.5 14.5C5.11929 14.5 4 13.3807 4 12C4 10.6193 5.11929 9.5 6.5 9.5C7.88071 9.5 9 10.6193 9 12Z" stroke="#ffffff" stroke-width="1.5"></path> <path d="M14 6.5L9 10" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> <path d="M14 17.5L9 14" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path> <path d="M19 18.5C19 19.8807 17.8807 21 16.5 21C15.1193 21 14 19.8807 14 18.5C14 17.1193 15.1193 16 16.5 16C17.8807 16 19 17.1193 19 18.5Z" stroke="#ffffff" stroke-width="1.5"></path> <path d="M19 5.5C19 6.88071 17.8807 8 16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5Z" stroke="#ffffff" stroke-width="1.5"></path> </g></svg> <span class="text-white my-1"> PARTAGER AUTREMENT </span>  </button>
            </div>
           
        </div>
    </VueFinalModal>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import QrcodeVue, { Level, RenderAs } from 'qrcode.vue';
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import { useRadioStore } from '@/store/radioStore';
import { VueFinalModal } from 'vue-final-modal';
const radioStore = useRadioStore();

// Define a reactive variable to hold the QR code URL
const qrcodeUrl = ref('');

// Generate the QR code URL for the specified URL
const url = `https://stream.radiowebapp.com:8040/${radioStore.radioName}`;
qrcodeUrl.value = url;

// Define the props this component accepts
const props = defineProps({
    qrUrl: String,
});


// Method to share the URL using the navigator.share API
const shareUrl = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Partagez l\'application',
                text: 'Découvrez cette application',
                url: qrcodeUrl.value,
            });
        } catch (error) {
            console.error('Erreur lors du partage de l\'URL:', error);
        }
    } else {
        console.error('navigator.share n\'est pas pris en charge');
    }
};


// Method to open the QR code URL in a new browser tab
const openQrCodeInBrowser = () => {
    window.open(qrcodeUrl.value, '_blank');
};
</script>