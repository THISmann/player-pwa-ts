<template>
    <div class="min-h-screen max-h-screen">
        <div v-if="isDataLoading" class="min-h-screen max-h-screen flex items-center justify-center">
          <LoadingData />
        </div>
        <div 
            v-else 
            class="min-h-screen max-h-screen text-white backdrop-blur-md backdrop-sepia bg-black/40"
        >
            <div class="">
                <div class="relative flex justify-center items-center py-2">
                    <img 
                        :src="cover" 
                        :alt="currentRadio?.current_track.album_title"
                        class="h-[5rem] w-[5rem] rounded-lg object-fit object-center"
                    />
                    <button 
                        class="absolute py-2 px-3 bg-white rounded-lg top-4 right-4"
                        @click.prevent="shouldDisplayQrcode = true"
                    >
                        <ShareIcon class="w-6 h-6 stroke-black" />
                    </button>
                </div>
                <div class="max-h-44 md:max-h-60 lg:max-h-64">
                    <img 
                        :src="cover" 
                        :alt="currentRadio?.current_track.album_title"
                        class="rounded-lg mx-auto max-h-44 md:max-h-60 lg:max-h-64 object-fit object-cover"
                    />
                </div>
                <div class="text-center mt-2">
                    <h1 class="uppercase font-bold text-lg">
                        {{ currentRadio?.current_track.album_title }}
                    </h1>
                    <h2 class="text-md font-normal">
                        {{ currentRadio?.current_track.title }}
                    </h2>
                    <div class="flex justify-center items-center mt-2">
                        <PlayAndPause 
                            class="h-16 w-16 cursor-pointer" 
                            :isPlaying="isPlaying"
                            @click.prevent="toggleAudio"
                        />
                        <audio ref="audioPlayer" hidden>
                            <source :src="streamingLink">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            </div>
            <footer class="absolute bottom-6 w-full">
                <div class="px-4 space-y-4">
                    <h3 class="font-bold">Dernier titre diffusé</h3>
                    <div v-if="currentRadio?.song_history.length">
                        <HistoryCard
                            class="md:hidden shadow-xl mt-3"
                            :cover="currentRadio?.song_history[0].cover ?? ''"
                            :title="currentRadio?.song_history[0].title ?? ''"
                            :album="currentRadio?.song_history[0].album_title ?? ''"
                        />
                        <div class="hidden md:flex lg:hidden">
                            <HistoryCard 
                                v-for="(history, index) in currentRadio?.song_history.slice(0, 2)"
                                :key="history.title"
                                :cover="history.cover"
                                :title="history.title"
                                :album="history.album_title"
                                :class="['rounded-none shadow-xl my-3', index ? 'rounded-r-lg' : 'rounded-l-lg']"
                            />
                        </div>

                        <div class="hidden lg:flex">
                            <HistoryCard 
                                v-for="(history, index) in currentRadio?.song_history.slice(0, 3)"
                                :key="history.title"
                                :cover="history.cover"
                                :title="history.title"
                                :album="history.album_title"
                                :class="['rounded-none shadow-xl my-3', {
                                    'rounded-l-lg': index === 0,
                                    'rounded-r-lg': index === 2
                                }]"
                            />
                        </div>
                    </div>
                    <div v-else class="w-full text-sm font-medium">
                        Pas de titres diffusé
                    </div>
                    <div>
                        <div class="flex justify-between">
                            <div></div>
                            <button 
                                class="uppercase bg-white text-black text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-x-1"
                                @click.prevent="shouldDisplayRecentsTitle = true"
                            >
                                <ClockIcon class="stroke-black h-5 w-5" />
                                <span>Titres diffusés</span>
                            </button>
                            <button 
                                class="bg-white px-2.5 py-1 rounded-lg" 
                                @click.prevent="shouldDisplayMenus = true"
                            >
                                <MenuIcon class="h-7 w-7 stroke-black" />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
    <Teleport to="#modal">
        <div 
            v-if="shouldDisplayQrcode || shouldDisplayMenus || shouldDisplayRecentsTitle"
            class="fixed z-20 max-h-screen h-screen top-0 pb-3 w-full flex items-center justify-center overflow-y-auto"
        >
       <div 
            class="relative bg-white rounded-lg bg-opacity-40 backdrop-blur-[20px] space-y-8 w-4/5 lg:w-3/5 max-w-[100%]"
        >
            <button 
                class="absolute right-0 top-0 text-right duration-200 ease text-white hover:text-red-600"
                @click.prevent="closeModal"
            >
                <div class="cursor-pointer p-2.5">
                    <CrossIcon class="h-7 w-7" />
                </div>
            </button>
            <div class="py-4 px-10" v-if="shouldDisplayQrcode">
                <h2 class="font-bold text-center text-xl">Partager</h2>
                <div class="space-y-3">
                    <QrcodeVue class="mx-auto md:hidden" :value="qrCodeUrl" :size="200" />
                    <QrcodeVue class="mx-auto hidden md:block lg:hidden" :value="qrCodeUrl" :size="300" />
                    <QrcodeVue class="mx-auto hidden lg:block" :value="qrCodeUrl" :size="200" />
                    <button 
                        class="px-4 py-3 bg-black rounded-lg mx-auto text-white uppercase flex gap-x-2 items-center justify-center"
                        @click="shareElseWhere"
                    >
                        <ShareIcon class="h-5 w-5" />
                        <span>partager autrement</span>
                    </button>
                </div>
            </div>
            <div v-if="shouldDisplayMenus" class="py-4 px-8 space-y-6">
                <h1 class="font-bold text-xl">Menu</h1>
                <div class="divide-y divide-2">
                    <div v-if="currentRadio?.menu.length === 0">Pas de menu</div>
                    <a 
                        class="block w-full flex justify-between items-center"
                        v-for="menu in currentRadio?.menu"
                        :key="menu.id"
                        :href="menu.link"
                        target="_blank"
                    >
                        <span class="text-sm font-semibold leading-6 text-black uppercase">
                            {{ menu.title }}
                        </span>
                        <ArrowRight class="h-6 w-6 stroke-white" />
                    </a>
                </div>
            </div>
            <div v-if="shouldDisplayRecentsTitle" class="py-4 px-8 space-y-4">
                <h1 class="font-bold text-xl">Historique</h1>
                <div class="">
                    <div v-if="currentRadio?.song_history.length === 0">Pas d'historique</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 auto-rows-auto gap-2 text-white">
                        <HistoryCard
                            v-for="history in currentRadio?.song_history"
                            :key="history.title"
                            :cover="history.cover"
                            :title="history.title"
                            :album="history.album_title"
                            class="bg-transparent col-span-1"
                        />
                    </div>
                </div>
            </div>
       </div>
    </div>
    </Teleport>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import LoadingData from "@/components/player/loader/LoadingData.vue";
import { useRadioStore } from "@/store/radioStore";
import { Welcome } from './type';
import axios from 'axios';
import ShareIcon from '@/assets/ShareIcon.vue';
import MenuIcon from '@/assets/MenuIcon.vue';
import ClockIcon from '@/assets/ClockIcon.vue';
import CrossIcon from '@/assets/CrossIcon.vue';
import PlayAndPause from '@/assets/PlayAndPause.vue';
import ArrowRight from '@/assets/ArrowRight.vue';
import HistoryCard from "@/components/player/HistoryCard.vue";
import QrcodeVue from 'qrcode.vue';

const isDataLoading = ref(true);
const currentRadio = ref<Welcome>();
const streamingLink = ref("");
const cover = ref("https://ekila1.pro-fhi.net/assets/logo/logoEkila1_Site.png");
const getRadioMetaData = async (radioName: string) => {
    try {
        const response = await axios.get(
            `https://admin.radiowebapp.com/api/radios/metadata/${radioName}`
        );

        currentRadio.value = response.data as Welcome;

        if (!response.data.is_api_available) {
            radioStore.radioErrMsg = "Impossible de récupérer les données, veuillez verifier les informations de votre radio";
        }

        if (!response.data || Object.keys(response.data).length === 0) {
            radioStore.radioErrMsg = "Impossible de récupérer les données, veuillez verifier les informations de votre radio"
            return;
        }

        if (currentRadio.value) {
            streamingLink.value = await currentRadio.value.radio_flux;
            radioStore.currentRadio = await currentRadio.value;
            radioStore.currentTrack = await currentRadio.value.current_track
        }
    } catch (error: unknown) {
        console.error("Error fetching radio metadata:", error);
    } finally {
        const url = currentRadio.value?.current_track.cover ?? cover.value;
        cover.value = url;
        setRadioIcon(url);
        setBackgroundImage(url);
    }
}

const setRadioIcon = (url: string): void => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = "icon";
        link.sizes = "16x16 32x32";
        document.head.appendChild(link);
    }
    link.href = url;
};

const setBackgroundImage = (url: string): void => {
    document.body.style.backgroundImage = `url(${url})`;
};

const radioStore = useRadioStore();
const route = useRoute();
const qrCodeUrl = ref("`https://stream.radiowebapp.com:8040");
onBeforeMount(async () => {
    let radioName = route.params.radio_name as string;
    if (radioName) {
        localStorage.setItem("radio_name", radioName);
    } else {
        radioName = localStorage.getItem("radio_name")!
    }
    document.title = radioName;
    radioStore.radioName = radioName;

    isDataLoading.value  = true;
    await getRadioMetaData(radioName);
    isDataLoading.value  = false;

    qrCodeUrl.value = qrCodeUrl.value + `/${radioName}`;
});

const audioPlayer = ref<HTMLAudioElement>();
const isPlaying = ref(false);
const toggleAudio = (): void => {
    if (isPlaying.value)
        audioPlayer.value?.pause();
    else
        audioPlayer.value?.play();

    isPlaying.value = !isPlaying.value;
};

const shouldDisplayQrcode = ref(false);
const shareElseWhere = async (): Promise<void> => {
    if (!navigator.canShare) {
        console.warn("Fonctionnalite non disponible sur votre appareil");
        return;
    }
    try {
        await navigator.share({
            text: radioStore.radioName,
            url: qrCodeUrl.value,
        });
    } catch(error) {
        console.log(error);
    }
};

const shouldDisplayMenus = ref(false);
const shouldDisplayRecentsTitle = ref(false);
const closeModal = (): void => {
    shouldDisplayQrcode.value = false;
    shouldDisplayMenus.value = false;
    shouldDisplayRecentsTitle.value = false;
};

setInterval(() => {
    getRadioMetaData(localStorage.getItem("radio_name") || '');
}, 30_000);
</script>
<style>
body {
    @apply bg-no-repeat bg-cover bg-fixed bg-center;

    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>