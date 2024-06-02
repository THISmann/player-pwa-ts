<script setup lang="ts">
import { onMounted, ref, computed, watchEffect, watch } from "vue";
import { ModalsContainer, useModal } from "vue-final-modal";
import BluetoothModal from "../bleutooth/BluetoothModal.vue";
import axios from "axios";
import img from "./logo.png";
import pub from "./publicité.jpeg";
import { useRoute, useRouter } from "vue-router";
import { useRadioStore } from '@/store/radioStore';
import qrcode from "./qrcode.vue";
import historique from "./historique.vue";
import errorNoFound from "./errorNoFound.vue";
import InstallButton from "./installButton.vue";
import errorServer from "./errorServer.vue";

const radioStore = useRadioStore();
const chatSocket = ref<WebSocket | null>(null);
const publicitySocket = ref<WebSocket | null>(null);
const historyTrack = ref([]);
const route = useRoute();
const router = useRouter();
const backgroundImageUrl = ref('');
const PlayerArtist = ref('');
const PlayerTitle = ref('');
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

const advertStyle = computed(() => {
    return {
        'background-image': `url(${pub})`, 
        'background-position': 'center', 
        'background-size': 'cover',
    }
})

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
            PlayerTitle.value = await responseData.current_track.title;
            PlayerArtist.value = await responseData.current_track.artist_name;
            radioStore.currentRadio = await responseData;
            radioStore.currentTrack = await responseData.current_track
        }
        console.log("history", historyTrack.value);
    } catch (error) {
        console.error("Error fetching radio metadata:", error);
    }
}

// Watch for changes in currentRadio and update the other properties
watch(() => radioStore.currentRadio, (newValue) => {
    if (newValue && newValue.current_track) {
        PlayerArtist.value = newValue.current_track.artist_name;
        PlayerTitle.value = newValue.current_track.title;
        backgroundImageUrl.value = newValue.current_track.cover;
        STREAMING_LINK.value = newValue.radio_flux;
    }
}, { deep: true });

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

const modalHistorique = createUseModal(historique, "Qr Code");
const openModalHis = async () => await modalHistorique.open();

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
                    <div :class="[
            'flex',  'justify-between' 
        ]
        ">
                        <div class="py-4 lg:px-6 m-5 relative"  >
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
                                        <a :href="item.link" target="_blank"
                                            class="lg:p-1.5 hover:border-b hover:border-b-white py-1 px-0 block border-b-3 border-transparent hover:border-white">
                                            {{ item.title }}
                                        </a>
                                    </li>
                                    <li>

                                        <InstallButton />

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
                            <img :src="backgroundImageUrl ?? img"
                                @error="($event) => $event.target.src = img" :alt="radioStore.currentTrack.title"
                                class="w-96  rounded-lg mx-auto h-80 drop-shadow-2xl" />

                            <h1 class="mt-4 text-white text-sm text-center">
                                {{ PlayerArtist }}
                            </h1>
                            <h1 class="mt-4 text-white text-center text-sm">
                                {{ PlayerTitle }}
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
                    <div class="h-96 bg-gray-100 md:mx-80 rounded-lg" :style="advertStyle">
                        <div v-for="advert in radioStore.currentRadio.publicities" :key="advert.id"
                            v-show="advert === currentAdvert" class=" bg-gray-200 rounded-lg  shadow-2xl">
                            <img :src="advert.pub_image ?? img" class="h-96 w-full  rounded-lg"
                                @error="($event) => $event.target.src = img" />
                        </div>
                    </div>

                </div>

                <div class="row">
                    <div class="flex justify-between">
                        <div class="cursor-pointer my-4 md:mx-24 mx-8">
                            <Vbutton @click="openModal1()">
                                <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M14.2 9.5929L11 12V7.62345C11 6.66862 11 6.1912 11.3015 6.04C11.603 5.88879 11.9838 6.17524 12.7455 6.74814L14.2 7.84228C14.7333 8.24346 15 8.44405 15 8.71759C15 8.99112 14.7333 9.19171 14.2 9.5929Z"
                                            stroke="#ffffff" stroke-width="1.5"></path>
                                        <path
                                            d="M14.2 16.1577L12.7455 17.2519C11.9838 17.8248 11.603 18.1112 11.3015 17.96C11 17.8088 11 17.3314 11 16.3766V12L14.2 14.4071C14.7333 14.8083 15 15.0089 15 15.2824C15 15.5559 14.7333 15.7565 14.2 16.1577Z"
                                            stroke="#ffffff" stroke-width="1.5"></path>
                                        <path
                                            d="M8.48014 8.92383C8.16193 8.65866 7.68901 8.70165 7.42383 9.01986C7.15866 9.33807 7.20165 9.81099 7.51986 10.0762L8.48014 8.92383ZM11.4801 11.4238L8.48014 8.92383L7.51986 10.0762L10.5199 12.5762L11.4801 11.4238Z"
                                            fill="#ffffff"></path>
                                        <path
                                            d="M8.48014 15.0762C8.16193 15.3413 7.68901 15.2983 7.42383 14.9801C7.15866 14.6619 7.20165 14.189 7.51986 13.9238L8.48014 15.0762ZM11.4801 12.5762L8.48014 15.0762L7.51986 13.9238L10.5199 11.4238L11.4801 12.5762Z"
                                            fill="#ffffff"></path>
                                        <path
                                            d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                                            stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"></path>
                                    </g>
                                </svg>
                            </Vbutton>
                        </div>
                        <div class="p-2 border rounded-lg bg-blue-100 m-2 cursor-pointer flex md:mx-24 mx-8" @click="openModalHis">
                            <h3 class="text-center mx-1">Titres récents </h3>
                            <svg width="32px" height="32px" viewBox="0 0 24 24" id="_24x24_On_Light_Recent"
                                data-name="24x24/On Light/Recent" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <rect id="view-box" width="24" height="24" fill="none"></rect>
                                    <path id="Shape"
                                        d="M9.682,18.75a.75.75,0,0,1,.75-.75,8.25,8.25,0,1,0-6.189-2.795V12.568a.75.75,0,0,1,1.5,0v4.243a.75.75,0,0,1-.751.75H.75a.75.75,0,0,1,0-1.5H3a9.75,9.75,0,1,1,7.433,3.44A.75.75,0,0,1,9.682,18.75Zm2.875-4.814L9.9,11.281a.754.754,0,0,1-.22-.531V5.55a.75.75,0,1,1,1.5,0v4.889l2.436,2.436a.75.75,0,1,1-1.061,1.06Z"
                                        transform="translate(1.568 2.25)" fill="#141124"></path>
                                </g>
                            </svg>
                        </div>
 
                    </div>
                </div>

                <div class="row">
                    <div id="cards-section" v-show="isHistoryOpen" class="bg-gray-700 opacity-70 p-12 max-md:hidden">
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
                    <div class="p-1 mx-1 overflow-y-auto md:hidden" v-show="isHistoryOpen">
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
        </div>
    </div>
</template>

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