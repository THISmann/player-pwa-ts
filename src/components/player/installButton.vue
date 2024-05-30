<template>
    <!-- Your template code -->
    <button class="  text-white font-bold  rounded" v-if="!installed" @click="installPWA">Installez l'App </button>
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
         alert('installez la pwa')
        if (!deferredPrompt) return;
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
  