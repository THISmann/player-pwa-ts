<template>
    <!-- Your template code -->
    <button class="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" v-if="!installed" @click="installPWA">Install App </button>
  </template>
  
  <script lang="ts">
  interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

  import { ref, onMounted } from 'vue';
  
  export default {
    setup() {
      const installed = ref(false);
      let deferredPrompt: BeforeInstallPromptEvent | null = null;
  
      onMounted(() => {
        window.addEventListener('beforeinstallprompt', (event) => {
          event.preventDefault();
          deferredPrompt = event;
          // You can now decide when to show the install prompt
          // For example, after the user performs certain actions
          // showInstallPromotion();
        });
      });
  
      const installPWA = async () => { 
        if (!deferredPrompt) return;
        alert('install')
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          installed.value = true;
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      };
  
      return { installed, installPWA };
    },
  };
  </script> */
  