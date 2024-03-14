<script setup lang="ts">
import { useBluetooth } from '@vueuse/core'
import { VueFinalModal } from 'vue-final-modal';
const {
  isConnected,
  isSupported,
  device,
  requestDevice,
  error,
} = useBluetooth({
  acceptAllDevices: true,
})
</script>

<template>
  <VueFinalModal class="flex justify-center items-center w-full p-1">


    <div class="grid grid-cols-1 gap-x-4 gap-y-4 bg-white p-6 rounded-lg">
      <div>{{ isSupported ? 'Bluetooth Web API Supported' : 'Your browser does not support the Bluetooth Web API' }}</div>

      <div v-if="isSupported">
        <button @click="requestDevice()">
          <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M7 17L17 7L12 2V22L17 17L7 7" stroke="#000000" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round"></path>
            </g>
          </svg>
          <title> Request Bluetooth </title>
        </button>
      </div>

      <div v-if="device">
        <p>Device Name: {{ device.name }}</p>
      </div>

      <div v-if="isConnected" class="bg-green-500 text-white p-3 rounded-md">
        <p>Connected</p>
      </div>

      <div v-if="!isConnected" class="bg-orange-800 text-white p-3 rounded-md">
        <p>Not Connected</p>
      </div>

      <div v-if="error">
        <div>Errors:</div>
        <pre>
      <code class="block p-5 whitespace-pre">{{ error }}</code>
    </pre>
      </div>
    </div>
  </VueFinalModal>
</template>