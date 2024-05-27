<script setup lang="ts">
import { onMounted, ref, computed, watchEffect } from "vue";
import { ModalsContainer, useModal } from "vue-final-modal";
import BluetoothModal from "../bleutooth/BluetoothModal.vue";
import axios from "axios";
import img from "./logo.png";
import { useRoute, useRouter } from "vue-router";
import { useRadioStore } from '@/store/radioStore';
import qrcode from "./qrcode.vue";
import errorNoFound from "./errorNoFound.vue";
import errorServer from "./errorServer.vue";

const radioStore = useRadioStore();
const chatSocket = ref<WebSocket | null>(null);
const publicitySocket = ref<WebSocket | null>(null);
const historyTrack = ref([]);
const route = useRoute();
const router = useRouter();
const backgroundImageUrl = ref('');
const STREAMING_LINK = ref<string>('');
const audioElement = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(true);
const isHistoryOpen = ref(false);
const play = ref(true);
const playMobile = ref(true);
const currentBgColor = ref('');
const currentAdIndex = ref(0);
const currentAdvert = ref(0);
const advertLists = ref([]);
const isMenuOpen = ref(false);
const isShareOpen = ref(false);
const loading = ref(true);
const message = ref('');

const hideLoading = () => {
    loading.value = false;
}

const showLoading = () => {
    loading.value = true;
}

// Background style computation
const divStyle = computed(() => {
    return {
        'background-color': currentBgColor.value || '#FF6503',
        'background-image': `url(${backgroundImageUrl.value})`,
        'background-size': 'cover',
        'background-attachment': 'fixed',
        'background-position': 'center',
        'filter': 'blur(0px)',
    };
});

const errorMsg = ref('');
// Fetch radio metadata
const getRadioMetaDataOnMounted = async (radioName: string) => {
    try {
        if (!radioName) {
            console.error("Radio name is missing in localStorage");
            return;
        }

        const response = await axios.get(`https://admin.radiowebapp.com/api/radios/metadata/${radioName}`);

        console.log(response.data);
        const responseData = response.data;

        if (!response.data.is_api_available) {
            radioStore.radioErrMsg = "Impossible de récupérer les données, veuillez verifier les informations de votre radio";
            openServerNoF();

        }

        // Vérification si response.data est vide
        if (!response.data || Object.keys(response.data).length === 0) {
            radioStore.radioErrMsg = "Impossible de récupérer les données, veuillez verifier les informations de votre radio"
            openServerErr();
            return;
        }

        if (responseData) {
            backgroundImageUrl.value = await responseData.current_track.cover;
            STREAMING_LINK.value = await responseData.radio_flux;
            radioStore.currentRadio = await responseData;
            radioStore.currentTrack = await responseData.current_track
        }
        console.log("history", historyTrack.value);
    } catch (error) {
        console.error("Error fetching radio metadata:", error);
    }
}

const getRadioMetaData = async (radioName: string) => {
    try {
        if (!radioName) {
            console.error("Radio name is missing in localStorage");
            return;
        }

        const response = await axios.get(`https://admin.radiowebapp.com/api/radios/metadata/${radioName}`);

        console.log(response.data);
        const responseData = response.data;

        if (responseData) {
            backgroundImageUrl.value = responseData.current_track.cover;
            STREAMING_LINK.value = responseData.radio_flux;
            radioStore.currentRadio = responseData;
        }
        console.log("history", historyTrack.value);
    } catch (error) {
        console.error("Error fetching radio metadata:", error);
    }
}

// Function to check the status of the URL
const checkUrlStatus = async () => {
    try {
        const response = await fetch('https://radio4.pro-fhi.net:19017/stream');

        // Check if the status is not 404
        if (response.status !== 404) {
            console.log(`URL is accessible with status ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to fetch the URL:", error);
    }
};

// checkUrlStatus();

// Update metadata every minute
setInterval(() => {
    getRadioMetaData(localStorage.getItem("radio_name") || '');
}, 1 * 30 * 1000);

getRadioMetaData(localStorage.getItem("radio_name") || '');
// Play/Pause functionality
console.log(audioElement.value, "audio");
const togglePlay = () => {
    if (audioElement.value) {
        if (audioElement.value.paused) {
            audioElement.value.play();
        } else {
            audioElement.value.pause();
        }
        isPlaying.value = audioElement.value.paused;
        play.value = audioElement.value.paused;
    }
}

// Modal management
const createUseModal = (component: any, title: string) => {
    const { open, close, options, patchOptions } = useModal({
        defaultModelValue: false,
        keepAlive: false,
        component,
        attrs: {
            title: title,
            clickToClose: true,
            escToClose: true,
            onBeforeOpen() {
                /* on before open */
            },
            onOpened() {
                /* on opened */
            },
            onBeforeClose() {
                /* on before close */
            },
            onClosed() {
                /* on closed */
            },
        },
    });

    return { open, close, options, patchOptions };
};

const modal1 = createUseModal(BluetoothModal, "Bluetooth settings");
const openModal1 = async () => await modal1.open();

const modalQR = createUseModal(qrcode, "Qr Code");
const openModalQR = async () => await modalQR.open();

const modalErrorServer = createUseModal(errorServer, errorMsg.value);
const openServerErr = async () => await modalErrorServer.open();

const modalNoFound = createUseModal(errorNoFound, errorMsg.value);
const openServerNoF = async () => await modalNoFound.open();

const fluxStatus = ref('');

// const 
// Advertisements
const showNextAdvert = () => {
    if (radioStore.currentRadio.publicities && radioStore.currentRadio.publicities.length > 0) {
        currentAdIndex.value = (currentAdIndex.value + 1) % radioStore.currentRadio.publicities.length;
        currentAdvert.value = radioStore.currentRadio.publicities[currentAdIndex.value];
    }
};

// Show the first advert initially if available
if (radioStore.currentRadio.publicities && radioStore.currentRadio.publicities.length > 0) {
    currentAdvert.value = radioStore.currentRadio.publicities[currentAdIndex.value];
}

// History toggle
const toggleHistory = () => {
    isHistoryOpen.value = !isHistoryOpen.value;
}

// Menu toggle
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

// Share toggle
const toggleShare = () => {
    isShareOpen.value = !isShareOpen.value;
};

// Mounted lifecycle hook
onMounted(async () => {

    let radio_name = route.params.radio_name as string;
    let radioSet = !!radio_name
    if (radioSet) {
        localStorage.setItem("radio_name", radio_name);
    } else {
        radio_name = localStorage.getItem("radio_name")!
    }

    document.title = radio_name;
    radioStore.radioName = radio_name;
    await getRadioMetaDataOnMounted(radio_name);
    if (STREAMING_LINK.value !== '') {
        audioElement.value?.play().catch(error => { loading.value = true; console.error('Failed to play audio:', error) });
    }
    setInterval(showNextAdvert, 10000);
    setTimeout(hideLoading, 10000); // 10000 milliseconds = 10 seconds
});

// Watch for changes in streamingLink and play the audio when it's updated
watchEffect(() => {
    if (STREAMING_LINK.value !== '') {
        audioElement.value?.play().catch(error => { loading.value = true; console.error('Failed to play audio:', error) });
    }
});
</script>
<template>
    <div class="sm:overscroll-none" :style="divStyle">
        <div class="container-fluid m-0 p-2 content bg-gray-700 opacity-80">
            <div class="container-fluid space-y-7 lg:space-y-10 min-h-screen">
                <ModalsContainer />
                <BluetoothModal :show="modal1.isOpen" @close="modal1.close" />
                <div class="row">
                    <div :class="
                        [
                            'flex', 
                            radioStore.currentRadio.menu?.length ? 'justify-between' : 'justify-end'
                        ]">
                        <div class="py-4 lg:px-6 m-5 relative" v-if="radioStore.currentRadio.menu?.length">
                            <div class="block">
                                <button @click="toggleMenu" class="text-white focus:outline-none">
                                    <svg fill="#ffffff" width="40px" height="40px" viewBox="0 0 32 32" version="1.1"
                                        xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round">
                                        </g>
                                        <g id="SVGRepo_iconCarrier">
                                            <title>menu</title>
                                            <path d="M8 24h16v-4h-16v4zM8 18.016h16v-4h-16v4zM8 12h16v-4h-16v4z"></path>
                                        </g>
                                    </svg> </button>
                            </div>
                            <nav class="bg-black p-2 absolute" v-show="isMenuOpen">
                                <ul class="text-base text-white space-y-3 min-w-32 max-w-96 lg:pt-0">
                                    <li v-for="(item, index) in radioStore.currentRadio.menu" :key="index">
                                        <a
                                            :href="item.link" target="_blank"
                                            class="lg:p-1.5 hover:border-b hover:border-b-white py-1 px-0 block border-b-3 border-transparent hover:border-white"
                                        >
                                            {{ item.title }}
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                            
                        </div>

                        <div class="py-4 lg:px-6 m-5">
                            <div class="align-self: flex-end ">
                                <button @click="openModalQR()" class="text-white focus:outline-none ">
                                    <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round">
                                        </g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z"
                                                fill="#1C274C"></path>
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="flex overflow-hidden items-center justify-center">
                        <div>
                            <h1
                                class="align-center text-gray-100 w-full   text-center text-4xl m-1 p-2 drop-shadow-2xl">
                                {{ radioStore.radioName }}
                            </h1>
                            <img 
                                :src="radioStore.currentTrack.cover ?? img"
                                @error="($event) => $event.target.src = img"  
                                :alt="radioStore.currentTrack.title"
                                class="w-96  rounded-lg mx-auto h-80 drop-shadow-2xl" 
                            />

                            <h1 class="mt-4 text-white text-sm text-center">
                                {{ radioStore.currentTrack.artist_name }}
                            </h1>
                            <h1 class="mt-4 text-white text-center text-sm">
                                {{ radioStore.currentTrack.title }}
                            </h1>
                            <audio :src="STREAMING_LINK" oncanplay="console.log('play')"
                                oncanplaythrough="console.log('ready to play')" error="console.log('error')"
                                onloadeddata="console.log('laoding now')" ref="audioElement"></audio>
                            <div class="mt-3 mx-80">
                                <Vbutton v-if="play" @click="togglePlay">
                                    <svg class="fill-white" width="44px" height="44px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round">
                                        </g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                d="M20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L7.59662 21.6145C5.53435 22.736 3 21.2763 3 18.9671L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258Z"
                                                stroke="#1C274C" stroke-width="1.5"></path>
                                        </g>
                                    </svg>
                                </Vbutton>

                                <VButton v-if="!play" @click="togglePlay">
                                    <svg class="fill-white" width="44px" height="44px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round">
                                        </g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path
                                                d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2C7.88562 2 8.82843 2 9.41421 2.58579C10 3.17157 10 4.11438 10 6V18C10 19.8856 10 20.8284 9.41421 21.4142C8.82843 22 7.88562 22 6 22C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V6Z"
                                                stroke="#1C274C" stroke-width="1.5"></path>
                                            <path
                                                d="M14 6C14 4.11438 14 3.17157 14.5858 2.58579C15.1716 2 16.1144 2 18 2C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V6Z"
                                                stroke="#1C274C" stroke-width="1.5"></path>
                                        </g>
                                    </svg>
                                </VButton>
                                <div v-show="loading"
                                    class="m-2  h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                                    role="status">
                                    <span
                                        class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="h-96 p-1 bg-gray-100 md:mx-80">
                        <div v-for="advert in radioStore.currentRadio.publicities" :key="advert.id"
                            v-show="advert === currentAdvert" class="p-1 bg-gray-200 rounded-lg m-3 shadow-2xl">
                            <img :src="advert.pub_image ?? img" class="h-80 w-full m-1 rounded-lg" @error="($event) => $event.target.src = img"  />
                        </div>
                    </div>

                </div>

                <div class="row">
                    <div class="flex justify-between">
                        <div class="cursor-pointer">
                            <Vbutton @click="openModal1()">
                                <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path d="M7 17L17 7L12 2V22L17 17L7 7" stroke="#000000" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round"></path>
                                    </g>
                                </svg>
                            </Vbutton>
                        </div>
                        <div class="p-2 border rounded-lg bg-blue-100 m-2 cursor-pointer" @click="toggleHistory">
                            <h3 class="text-center">Titres récents</h3>
                        </div>

                        <div class="cursor-pointer">
                            <Vbutton>
                                <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink" width="32px" height="32px"
                                    viewBox="0 0 32 32" xml:space="preserve">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <g>
                                            <g>
                                                <path
                                                    d="M6.501,6.249c0.44,0.335,0.892,0.654,1.361,0.939C7.623,7.764,7.411,8.372,7.221,9h1.927 c0.11-0.322,0.215-0.649,0.34-0.955C10.381,8.454,11.312,8.766,12.267,9h7.471c0.967-0.235,1.912-0.554,2.812-0.972 c0.125,0.31,0.229,0.644,0.343,0.972h1.891c-0.189-0.629-0.4-1.235-0.641-1.812c0.471-0.285,0.924-0.604,1.36-0.939 c0.84,0.818,1.572,1.743,2.179,2.751h2.688c-2.604-5.318-8.057-9-14.368-9C9.689,0,4.238,3.682,1.635,9h2.686 C4.929,7.992,5.661,7.065,6.501,6.249z M24.109,5.073c-0.246,0.176-0.493,0.349-0.75,0.509c-0.319-0.587-0.666-1.144-1.041-1.646 C22.95,4.266,23.544,4.651,24.109,5.073z M21.794,6.422c-0.808,0.371-1.64,0.67-2.496,0.88c-0.239-1.728-0.584-3.396-1.075-4.672 C19.605,3.329,20.829,4.655,21.794,6.422z M15.82,2.379c0.061-0.001,0.12-0.008,0.182-0.008s0.121,0.007,0.182,0.008 c0.438,0.717,0.965,2.507,1.354,5.229c-0.509,0.06-1.021,0.098-1.535,0.098c-0.517,0-1.028-0.038-1.535-0.098 C14.855,4.886,15.382,3.096,15.82,2.379z M13.771,2.658c-0.485,1.272-0.827,2.927-1.065,4.645c-0.843-0.206-1.661-0.5-2.453-0.86 C11.214,4.692,12.421,3.366,13.771,2.658z M9.684,3.936C9.31,4.438,8.965,4.996,8.642,5.582C8.386,5.423,8.139,5.25,7.893,5.074 C8.459,4.651,9.052,4.266,9.684,3.936z">
                                                </path>
                                                <path
                                                    d="M25.503,25.752c-0.438-0.336-0.894-0.654-1.36-0.941c0.237-0.574,0.45-1.182,0.641-1.811h-1.891 c-0.109,0.328-0.216,0.66-0.341,0.971c-0.901-0.418-1.848-0.734-2.813-0.971h-7.47c-0.955,0.234-1.885,0.547-2.778,0.955 C9.364,23.648,9.26,23.32,9.149,23H7.223c0.189,0.629,0.401,1.236,0.64,1.812c-0.47,0.285-0.921,0.604-1.361,0.938 C5.663,24.934,4.931,24.008,4.325,23H1.638c2.603,5.316,8.054,9,14.366,9c6.312,0,11.764-3.684,14.367-9h-2.688 C27.075,24.008,26.343,24.934,25.503,25.752z M7.893,26.928c0.246-0.176,0.494-0.35,0.749-0.508 c0.323,0.586,0.668,1.143,1.042,1.645C9.052,27.734,8.459,27.35,7.893,26.928z M10.251,25.559c0.792-0.356,1.61-0.653,2.453-0.858 c0.238,1.719,0.58,3.368,1.065,4.645C12.421,28.635,11.214,27.307,10.251,25.559z M16.184,29.621 c-0.061,0.002-0.12,0.008-0.182,0.008s-0.121-0.006-0.182-0.008c-0.438-0.717-0.966-2.508-1.354-5.229 c0.507-0.06,1.019-0.099,1.535-0.099c0.517,0,1.028,0.039,1.536,0.099C17.146,27.113,16.622,28.904,16.184,29.621z M18.223,29.369 c0.491-1.275,0.836-2.943,1.075-4.672c0.856,0.211,1.688,0.51,2.496,0.881C20.829,27.346,19.605,28.672,18.223,29.369z M22.318,28.064c0.375-0.504,0.722-1.062,1.041-1.646c0.257,0.16,0.504,0.334,0.75,0.51C23.544,27.35,22.95,27.734,22.318,28.064z ">
                                                </path>
                                                <path
                                                    d="M4.795,19.18l0.637-2.236c0.169-0.596,0.299-1.183,0.416-1.977h0.026c0.13,0.78,0.247,1.354,0.403,1.977l0.598,2.236 h1.859l1.95-6.355H8.748l-0.546,2.521c-0.143,0.729-0.273,1.443-0.364,2.171H7.812c-0.13-0.729-0.299-1.441-0.468-2.158 l-0.637-2.534h-1.56l-0.676,2.612c-0.156,0.623-0.338,1.353-0.468,2.08H3.977c-0.104-0.729-0.234-1.431-0.364-2.094l-0.507-2.601 H1.09l1.846,6.357h1.859V19.18z">
                                                </path>
                                                <path
                                                    d="M18.314,15.344c-0.145,0.729-0.272,1.443-0.362,2.172h-0.027c-0.129-0.729-0.299-1.442-0.467-2.159l-0.64-2.534h-1.56 l-0.676,2.612c-0.156,0.624-0.338,1.353-0.468,2.081h-0.026c-0.104-0.729-0.234-1.432-0.364-2.095l-0.507-2.601h-2.015 l1.846,6.357h1.859l0.637-2.235c0.169-0.599,0.299-1.184,0.416-1.978h0.026c0.13,0.78,0.248,1.354,0.404,1.978l0.598,2.235h1.859 l1.947-6.357h-1.938L18.314,15.344z">
                                                </path>
                                                <path
                                                    d="M28.43,15.344c-0.144,0.729-0.273,1.443-0.363,2.172h-0.025c-0.129-0.729-0.3-1.442-0.469-2.159l-0.637-2.534h-1.562 l-0.677,2.612c-0.155,0.624-0.338,1.353-0.469,2.081h-0.024c-0.104-0.729-0.233-1.432-0.363-2.095l-0.508-2.601h-2.017 l1.849,6.357h1.856l0.64-2.235c0.168-0.599,0.299-1.184,0.416-1.978h0.024c0.129,0.78,0.246,1.354,0.402,1.978l0.598,2.235h1.859 l1.949-6.357h-1.938L28.43,15.344z">
                                                </path>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </Vbutton>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div id="cards-section" v-show="isHistoryOpen" class="bg-gray-700 opacity-70 p-12 max-md:hidden">
                        <div class="p-1 mx-7 flex flex-wrap gap-3 overflow-y-hidden hide-scrollbar">
                            <div v-for="data in radioStore.currentRadio.song_history" :key="data.title"
                                class="lg:w-2/5 md:w-1/2 h-44 flex items-center px-4 shadow shadow-[#F76507] rounded-md text-ellipsis overflow-x-hidden bg-gray-700"
                            >
                                <img 
                                    :src="data.cover ?? img" 
                                    class="rounded-lg h-40" 
                                    :alt="data.title" 
                                    @error="($event) => $event.target.src = img" 
                                />
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
                    <div class="p-1 mx-1 overflow-y-auto md:hidden" v-show="isHistoryOpen">
                        <div class="flex gap-y-3 sm:w-full sm:h-28 border-black-300/75 bg-gray-700 opacity-70 rounded-lg shadow-2xl p-1 m-1 scroll overflow-x-hidden"
                            v-for="data in radioStore.currentRadio.song_history" :key="data.id">
                            <img :src="data.cover ?? img" class="rounded-lg w-1/2 h-24" :alt="data.title" @error="($event) => $event.target.src = img" />
                            <div class="w-1/2 p-1">
                                <h1 class="text-left my-1 mx-1 text-sm w-full text-gray-100 text-ellipsis text-nowrap overflow-hidden">
                                    {{ data.title }}
                                </h1>
                                <h4 class="text-left my-1 mx-1 text-xs w-full text-gray-400 text-ellipsis text-nowrap overflow-hidden">
                                    {{ data.artist_name }}
                                </h4>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<!-- <template>
    <div :style="divStyle">
        <div class="container-fluid m-0 p-2 content">
            <div class="container-fluid min-h-screen">
                <ModalsContainer />
                <BluetoothModal :show="modal1.isOpen" @close="modal1.close" />
                <div class="row">
                    <div class="flex justify-between">
                        <div class="py-4 px-6 m-5">n
                            <div class="block">
                                <button @click="toggleMenu" class="text-white focus:outline-none">
                                n
                                </button>
                            </div> 
                            <nav v-show="isMenuOpen">
                                <ul class="items-center justify-between text-base text-white pt-4 w-96 lg:pt-0">
                                    <li v-for="(item, index) in radioStore.currentRadio.menu" :key="index">
                                        <a :href="item.link" class="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-white">
                                            SITE {{ item.title }}
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        <div class="py-4 px-6 m-5"> 
                            <div class="align-self: flex-end">
                                <button @click="openModalQR()" class="text-white focus:outline-none">
                                       </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <marquee behavior="" direction="">
                        <h1 class="text-gray-100 text-lg">{{ errorMsg }}</h1>
                    </marquee>
                </div>

              <div class="row">
                    <div class="flex overflow-hidden items-center justify-center">
                        <div>
                            <h1 class="align-center text-gray-100 w-auto sm:w-auto bg-gray-700 opacity-50 text-center text-5xl m-1 p-2 drop-shadow-2xl">
                                {{ radioStore.radioName }}
                            </h1>
                            <img :src="radioStore.currentRadio.cover || img" alt="" class="w-96 rounded-lg mx-auto h-80 drop-shadow-2xl" />
                            <h1 class="mt-4 text-white text-sm text-center">{{ radioStore.currentRadio.artist_name }}</h1>
                            <h1 class="mt-4 text-white text-center text-sm">{{ radioStore.currentRadio.title }}</h1>
                            <audio :src="STREAMING_LINK" ref="audioElement"></audio>
                            <div class="mt-3 mx-80">
                                <VButton v-if="play" @click="togglePlay"> 
                                </VButton>

                                <VButton v-if="!play" @click="togglePlay"> 
                                </VButton>
                            </div>
                        </div>
                    </div>
                </div> 

                <div class="row">
                    <div v-for="advert in radioStore.currentRadio.publicities" :key="advert.id" v-show="advert === currentAdvert" class="p-1 bg-gray-200 rounded-lg m-3 shadow-2xl">
                        <img :src="advert.image || img" class="h-80 w-full rounded-lg" alt="" />
                        <marquee behavior="" direction="" class="text-left mx-1 text-md text-gray-100 bg-gray-500/25 p-1 mt-1 rounded-lg">
                            <h1>{{ advert.description }}</h1>
                        </marquee>
                    </div>
                </div>

                <div class="row">
                    <div class="flex justify-between">
                        <div>
                            <VButton @click="openModal1()"> 
                            </VButton>
                        </div>
                        <div class="p-2 border rounded-lg bg-blue-100 m-2" @click="toggleHistory">
                            <h1 class="text-center">Titres récents</h1>
                        </div>

                        <div>
                            <VButton> 
                            </VButton>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div id="cards-section" v-show="isHistoryOpen" class="bg-gray-700 opacity-50 p-12 max-md:hidden">
                        <div class="p-1 mx-7 flex flex-wrap flow-x-scroll hide-scrollbar">
                            <div v-for="data in radioStore.currentRadio.song_history" :key="data.title" class="lg:w-2/5 md:w-1/2 h-44 flex px-4 m-1">
                                <img :src="data.cover || img" class="rounded-lg h-40" alt="" />
                                <div class="w-80">
                                    <h1 class="text-left mx-12 text-md text-gray-100 p-1 m-0 rounded-lg overflow-hidden overflow-ellipsis whitespace-nowrap">
                                        {{ data.artist_name }}
                                    </h1>
                                    <h1 class="text-left mx-12 text-md text-gray-100 p-1 m-0 rounded-lg overflow-hidden overflow-ellipsis whitespace-nowrap">
                                        {{ data.title }}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>  
                     <div class="p-1 mx-7 overflow-y-auto md:hidden" v-show="isHistoryOpen">
                        <div class="flex sm:w-full sm:h-28 border-black-300/75 bg-gray-700 opacity-50 rounded-lg shadow-2xl p-1 m-1 scroll" v-for="data in radioStore.currentRadio.song_history" :key="data.id">
                            <img :src="data.cover || img" class="rounded-lg w-24 h-24" alt="" />
                            <h1 class="text-left my-4 mx-1 text-sm text-gray-400 p-2">{{ data.title }}</h1>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template> -->

<style>
/* Hide scrollbar for large screens */
@media (min-width: 769px) {
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .hide-scrollbar {
        -ms-overflow-style: none;
        /* IE and Edge */
        scrollbar-width: none;
        /* Firefox */
    }
}

/* Prevent horizontal scrolling on mobile devices */
@media (max-width: 768px) {
    #cards-section {
        overflow-x: hidden;
        /* Prevent horizontal scrolling */
    }
}
</style>