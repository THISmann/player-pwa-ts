<template>
    <VueFinalModal class="flex justify-center items-center w-full p-1">
        <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-6 rounded-lg">
            <qrcode-vue :value="qrcodeUrl" level="H" />
            <button @click="openQrCodeInBrowser">Open QR Code</button>
        </div>
    </VueFinalModal>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { ref } from "vue";
import { useRadioStore } from '@/store/radioStore';
import { VueFinalModal } from 'vue-final-modal';
const radioStore = useRadioStore();

// Define a reactive variable to hold the QR code URL
const qrcodeUrl = ref('');

// Generate the QR code URL for the specified URL
const url = `https://stream.radiowebapp.com:8040/${radioStore.radioName}`;
qrcodeUrl.value = url;

// Method to open the QR code URL in a new browser tab
const openQrCodeInBrowser = () => {
    window.open(qrcodeUrl.value, '_blank');
};
</script>