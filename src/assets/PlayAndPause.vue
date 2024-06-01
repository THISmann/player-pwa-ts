<template>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="{1.5}" stroke="none" className="w-6 h-6">
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
            v-show="!isPlaying"
        >
        </path>
        <path 
            fillRule="evenodd" 
            d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" 
            clipRule="evenodd" 
            v-show="isPlaying"
        >
    </path>
    </svg>
</template>
<script setup lang="ts">
defineProps({
    isPlaying: Boolean,
});
</script>