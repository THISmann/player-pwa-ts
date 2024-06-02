<template>
    <VueFinalModal class="flex justify-center items-center w-full p-1">
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-6 rounded-lg">
            <qrcode-vue :value="qrcodeUrl" level="H" />
            <!-- <button @click="openQrCodeInBrowser">Open QR Code</button> -->
            <button @click="shareUrl"> Partagez l'application </button> 
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