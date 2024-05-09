<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import { Howl } from "howler";
//import { useBluetooth } from '@vueuse/core'
import { ModalsContainer, useModal } from "vue-final-modal";
import BluetoothModal from "../bleutooth/BluetoothModal.vue";
import axios from "axios";
//import { useAdvertStore } from '@/store/advertStore';
import img from "./logo.png";
import themeColor from "./colorExtraction";
import { useRoute, useRouter } from "vue-router";
import InstallButton from "./installButton.vue";
//import { fetchAndProcessRadioData } from "./fetchAndProcessRadioData";
import { getHistoryTracks } from "./historyFetcher";
import { getImgTrack } from "./imageUtils";
import { useRadioStore } from '@/store/radioStore';
// import install from "@/services/installPrompt"

const radioStore = useRadioStore();
const chatSocket = ref<WebSocket | null>(null);
const publicitySocket = ref<WebSocket | null>(null);

const currentTrack = ref([]);
const historyTrack = ref([]);
const icecastImgUrl = ref(""); 
console.log("+++", currentTrack, historyTrack);


const route = useRoute();
const router = useRouter();
onBeforeMount(() => {
  let token = route.query.route_access_token as string
  if(!!token){
    localStorage.setItem("access-token", token);
  } else {
    token = localStorage.getItem("access-token")!; 
  }
  radioStore.radioToken = token
});


const getRadioByName = async (radioName: string) => {
  try {
    if (!radioName) {
      console.error("Radio name is missing in localStorage");
      return;
    }

    const response = await axios.get(
      `https://admin.radiowebapp.com/api/radios/name/${radioName}`,
      {
        // headers: {
        //   //'Authorization': `Ekila ${localStorage.getItem("access-token")}`
        //   Authorization: `Ekila ${localStorage.getItem("access-token")}`,
        // },
      }
    );

    console.log(response.data);
    const responseData = response.data;

    if (responseData) {
      radioStore.currentRadio = responseData;
      // localStorage.setItem("playerServerType", responseData.server_type);
      // localStorage.setItem("playerUrlFlux", responseData.url_flux_radio);
      // localStorage.setItem(
      //   "playerUrlApi",
      //   responseData.url_api_radio_current_song
      // );
      // localStorage.setItem(
      //   "playerUrlApiHistory",
      //   responseData.url_api_radio_history
      // );
      // localStorage.setItem("playerRadioID", responseData.id);
    }

    // Call updateBackgroundColor immediately
    updateMetadata();

    // Update every 2 minutes
    setInterval(updateMetadata, 1 * 60 * 1000); // 2 minutes in milliseconds

    console.log("history", historyTrack.value);
  } catch (error) {
    console.error("Failed to fetch radios:", error.message);
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.error("Unauthorized access:", error.response.data);
    } else {
      // Handle other errors
      console.error("other error:", error);
    }
  }
};

const updateMetadata = async () => {
  //localStorage.getItem("playerServerType") 
  switch (radioStore.currentRadio.server_type) {
    case "icecast":
      return currentTrack.value = {
        title: "indisponible",
        album: "indisponible",
        author: "indisponible",
        img_medium_url: "",
      };
    case "shoutcast":
      return currentTrack.value = {
        title: "indisponible",
        album: "indisponible",
        author: "indisponible",
        img_medium_url: "",
      };
      // currentTrack.value = await fetchAndProcessRadioData(
      //   localStorage.getItem("playerUrlApi")
      // );

      // icecastImgUrl.value = await getImgTrack(currentTrack.value.title);
      // alert("radio ")
      // getColorImg(icecastImgUrl.value, (bgColor) => {
      //   console.log("Background color:", bgColor);
      // });
      break;
    case "rcast":
    case "radioking":
    case "everestcast":
    case "everestpanel":
      return currentTrack.value = {
        title: "indisponible",
        album: "indisponible",
        author: "indisponible",
        img_medium_url: "",
      };
    case "azuracast":
    case "centovacast":
      currentTrack.value = await fetchAndProcessRadioData(
        //localStorage.getItem("playerUrlApi")
        radioStore.currentRadio.url_api_radio_current_song
      );
      getColorImg(currentTrack.value.img_medium_url, (bgColor) => {
        console.log("Background color:", bgColor);
      });
      historyTrack.value = await getHistoryTracks(
        // localStorage.getItem("playerUrlApiHistory"),
        // localStorage.getItem("playerServerType")
        radioStore.currentRadio.url_api_radio_history,
        radioStore.currentRadio.server_type
      );
      break;
  }
};

// setInterval(async () => {
//     await updateMetadata();
// }, 3000);

// Function to handle WebSocket messages
const handleMessage = (e: MessageEvent) => {
  const data = JSON.parse(e.data);

  //localStorage.getItem("playerRadioID")
  if (radioStore.currentRadio.id == data.radio.id) {
    switch (data.action) {
      case "update":
        console.log("mise a jour");
        console.log(data.radio);
        localStorage.setItem("playerServerType", data.radio.server_type);
        localStorage.setItem("playerUrlFlux", data.radio.flux_radio);
        localStorage.setItem("playerUrlApi", data.radio.url_api_radio);
        localStorage.setItem(
          "playerUrlApiHistory",
          data.radio.url_api_radio_history
        );
        break;
      case "delete":
        console.log("suppression");
        console.log(data.radio);
        break;
    }
  }
};

const handleMessagePub = (e: MessageEvent) => {
  const data = JSON.parse(e.data);
  console.log("handle publicity :", data);
};

// Function to handle WebSocket close events
const handleClose = (e: CloseEvent) => {
  console.log(e);
  console.error("Chat socket closed unexpectedly");
};

// Function to handle WebSocket close events
const handleClosePub = (e: CloseEvent) => {
  console.log(e);
};

// Function to handle WebSocket open events
const handleOpen = () => {
  if (chatSocket.value) {
    chatSocket.value.send(
      JSON.stringify({
        action: "subscribe_to_radio_activity",
        request_id: new Date().getTime(),
      })
    );
  }
};

// Function to handle WebSocket open events
const handleOpenPub = () => {
  if (publicitySocket.value) {
    publicitySocket.value.send(
      JSON.stringify({
        action: "subscribe_to_publicity_activity",
        request_id: new Date().getTime(),
      })
    );
  }
};

const play = ref(true);
const playMobile = ref(true);
const STREAMING_LINK = radioStore.currentRadio.url_flux_radio;
// localStorage.getItem("playerUrlFlux");
const sound = new Howl({
  src: [STREAMING_LINK],
  autoplay: true,
  loop: false,
  volume: 1.0,
  html5: true,
});
const fluxData = ref({
  loading: true,
});

//window.location.reload();

// Clear listener after first call.
const loadFlux = ref(true);
// sound.once("load", function () {
//   loadFlux.value = false;
//   console.log("chargement");
//   sound.play(); 
// });

// // Fires when the sound finishes playing.
// sound.on("end", function () {
//   console.log("Finished!");
// });

// Listen for the 'loaderror' event on the Howl object
sound.on("loaderror", (id, error) => { 
  console.error("Load error:", error, "in the following Id ", id);
  alert(  "flux radio instable actuellement");
  // Handle the error, e.g., show a message to the user
});

// Listen for the 'loaderror' event on the Howl object
sound.on("playerror", (error) => { 
  console.error("player error:", error);
  alert(error);
  // Handle the error, e.g., show a message to the user
});

// Create a generic useModal function
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

const server_type = radioStore.currentRadio.server_type;
//ref(localStorage.getItem("playerServerType"));
const isPlaying = ref(false);
const volume = ref(1.0);
const serverTypes = ref([
  "icecast",
  "shoutcast",
  "everestcast",
  "everestpanel",
  "rcast",
  "centovacast",
  "azuracast",
  "radiocast",
  "radioking",
]);

const updateVolume = () => {
  sound.volume(volume.value);
};

const togglePlayback = () => {
  const shouldPlay = !isPlaying.value;
  if (shouldPlay) {
    sound.pause();
   
  } else {
    sound.play();
 
  }
  play.value = shouldPlay;
  playMobile.value = shouldPlay;
  isPlaying.value = shouldPlay;
};

const currentBgColor = ref("");

const logToServer = async (level: string, message: string) => {
  try {
    await axios.post("http://localhost:3000/logs", { level, message });
  } catch (error) {
    console.error("Error sending log to server:", error);
  }
};

const getColorImg = (source: string) => {
  const img = new Image();
  img.src = source;
  img.crossOrigin = "anonymous";
  img.onload = () => {
    themeColor(100, img, 40, SetColor);
  };
};

const currentAdIndex = ref(0);
const currentAdvert = ref(0);
const advertLists = ref([]);

const showNextAdvert = () => {
  currentAdIndex.value = (currentAdIndex.value + 1) % advertLists.value.length;
  currentAdvert.value = advertLists.value[currentAdIndex.value];
};

// Show the first advert initially
currentAdvert.value = advertLists.value[currentAdIndex.value];

const getAdvert = async () => {
  try {
    axios
      .get(`https://admin.radiowebapp.com/api/publicities/`, {
        headers: {
          'Authorization': `Ekila ${localStorage.getItem("access-token")}`,
          // Authorization:
          //   "Ekila eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzEzMjgwMTAyLCJpYXQiOjE3MTMyNzY1MDIsImp0aSI6IjJhZTE1ODAyZGJiNTQxZDM5NGNhYmMyNjA3ZWU2ZThjIiwidXNlcl9pZCI6Mn0.aNVuLfNuEoPeChZjoWAkje0oP5_N1yXXCF4zZSOdLGI",
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        //console.log('adverts ', response.data.results);
        advertLists.value = response.data.results;
        console.log(advertLists.value);
      });
  } catch (error) {
    alert(error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Handle unauthorized error
        //refreshToken();
      } else if (error.message.includes("Network Error")) {
        // Handle network error
        console.warn("There was a network error!");
        // Optionally, display a notification to the user
      } else {
        console.log("An unexpected error occurred:", error);
        alert(error);
      }
    } else {
      console.log("An unknown error occurred:", error);
      alert(error);
    }
  } finally {
    //console.log('end !!')
  }
};

const SetColor = (colorArr: number[][]): string => {
  const bgc = `rgb(${Math.floor(colorArr[0][0])},${Math.floor(
    colorArr[0][1]
  )},${Math.floor(colorArr[0][2])})`;
  currentBgColor.value = bgc;
  return bgc;
};
const message = ref("");
const loading = ref(true);

onMounted(async () => {

  // Fetch metadata when the component is mounted 
  //const { route_access_token, route_current_radio_id, route_url_api_radio_history, route_url_api_radio, route_url_flux_radio, route_server_type } = route.query;
  
  const route = useRoute();

  let radio_name = route.params.radio_name as string;
  let radioSet = !!radio_name
  if (radioSet) {
    localStorage.setItem("radio_name", radio_name);
  } else {
    radio_name = localStorage.getItem("radio_name")!
  }
  document.title = radio_name;
  radioStore.radioName = radio_name;
  await getRadioByName(radio_name);

  loading.value = true;

  await getAdvert();
  setInterval(showNextAdvert, 10000);

  // chatSocket.value = new WebSocket(
  //   "wss://www.admin.radiowebapp.com:443/sync/ws/radio/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzExNjkwMjM1LCJpYXQiOjE3MTE2ODY2MzUsImp0aSI6ImE5ZTAwZmE2NDdmZTQ4OGRiMGY5YzI2Y2RmZmQ5NWM5IiwidXNlcl9pZCI6Mn0.UQ_IBTGCUG5_S0c_7gfvV5_2dVzwWoiIAae7N-jmXRM"
  // );

  // publicitySocket.value = new WebSocket(
  //   "wss://www.admin.radiowebapp.com:443/sync/ws/publicity/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzExNjkwMjM1LCJpYXQiOjE3MTE2ODY2MzUsImp0aSI6ImE5ZTAwZmE2NDdmZTQ4OGRiMGY5YzI2Y2RmZmQ5NWM5IiwidXNlcl9pZCI6Mn0.UQ_IBTGCUG5_S0c_7gfvV5_2dVzwWoiIAae7N-jmXRM"
  // );

  // if (chatSocket.value) {
  //   chatSocket.value.onmessage = handleMessage;
  //   chatSocket.value.onclose = handleClose;
  //   chatSocket.value.onopen = handleOpen;
  // }

  // if (publicitySocket.value) {
  //   publicitySocket.value.onmessage = handleMessagePub;
  //   publicitySocket.value.onclose = handleClosePub;
  //   publicitySocket.value.onopen = handleOpenPub;
  // }
});

 const getCurrentTrack = async (
  historyTrack: any,
  items: any,
  currentTrack: any
) => {
  const playerServerType = radioStore.currentRadio.server_type;
  //localStorage.getItem("playerServerType");
  const playerUrlApi = radioStore.currentRadio.url_api_radio_current_song;
  //localStorage.getItem("playerUrlApi");
  const playerUrlApiHistory = radioStore.currentRadio.url_api_radio_history;
  //localStorage.getItem("playerUrlApiHistory");

  try {
    if (!playerServerType || !playerUrlApi || !playerUrlApiHistory) {
      console.error("Missing required parameters");
      return;
    }

    // const fetchDataAndSetInterval = async () => {
    //   await fetchAndProcessRadioData(playerUrlApi);
    //   setInterval(async () => {
    //     await fetchAndProcessRadioData(playerUrlApi);
    //   }, 30000);
    // };

    switch (playerServerType) {
      case "shoutcast":
      case "icecast":
      case "everestcast":
      case "everestpanel":
      case "rcast":
      case "centovacast":
      case "azuracast":
      case "radioking":
        await fetchAndProcessRadioData(playerUrlApi);
        await getHistoryTracks(playerUrlApiHistory, playerServerType);
        break;
      default:
        console.error("Invalid player server type");
        break;
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
};


const fetchAndProcessRadioData = async (url: string) => {
    let currentTrack: any = {}; // Create an empty object for currentTrack
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = radioStore.currentRadio.server_type !== 'shoutcast' ? await response.json() : null;

        switch (radioStore.currentRadio.server_type) {
            case 'icecast':
                currentTrack = JSON.parse(JSON.stringify(data?.icestats.source[0], null, 2));
                console.log('++++++', currentTrack);
                break;
            case 'rcast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.nowplaying, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.coverart, null, 2))
                };
               // console.log('++++++', currentTrack);
                break;
            case 'centovacast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.data[0].track.title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data?.data[0].track.album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data?.data[0].track.artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.data[0].track.imageurl, null, 2)),
                };
                break;
            case 'azuracast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.now_playing.song.title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data?.now_playing.song.album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data?.now_playing.song.artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.now_playing.song.art, null, 2)),
                };
                // console.log('++++++', currentTrack);
                break;
            case 'radioking':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data[0].title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data[0].album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data[0].artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data[0].cover_url, null, 2)),
                }; 
                break;
            case 'everestcast':
                currentTrack = {
                    "title": data.results[0].title,
                    "album": data.results[0].album,
                    "author": data.results[0].author,
                    "img_medium_url": data.results[0].img_url,
                }; 
                break;

            case 'shoutcast':
                currentTrack = { "title": await response.text() }; 
                break;
            default:
                break;
        }
        //getColorImg(currentTrack.img_medium_url);
        return currentTrack; // Return the currentTrack object
    } catch (error) {
        console.error('Fetch failed:', error);
    }
};

onUnmounted(() => {
  if (sound) {
    sound.stop(); // Arrêtez le son
    sound.unload(); // Déchargez la ressource audio
  }

  
});
</script>

<template>
  <div :style="{ 'background-color': currentBgColor || '#FF6503' }">
    <div class="container-fluid m-0 p-2">
      <div class="container-fluid max-md:hidden min-h-screen">
        <ModalsContainer />
        <BluetoothModal :show="modal1.isOpen" @close="modal1.close" />  
        <div class="grid grid-cols-12">
          <div class="col-span-9 bg-slate-100/25 rounded-lg m-1">
            <div v-for="advert in advertLists" :key="advert.id" v-show="advert === currentAdvert"
              class="p-1 bg-gray-200 rounded-lg m-3 shadow-2xl">
              <img :src="advert.pub_image ? advert.pub_image : './assets/pub.jpg'" class="h-80 w-full rounded-lg" alt=""
                srcset="" />
              <marquee behavior="" direction=""
                class="text-left mx-1 text-md text-gray-100 bg-gray-500/25 p-1 mt-1 rounded-lg">
                <h1>{{ advert.description }}</h1>
              </marquee>
            </div>
            <div id="cards-section" class="">
              <div class="p-1 mx-7 flex flex-wrap overSVGRepo_iconCarrierflow-x-scroll hide-scrollbar">
                <div v-for="data in historyTrack" :key="data.id"
                  class="w-48 h-64 border-black-300/75 rounded-lg shadow-2xl px-4 m-1">
                  <img :src="data.img_url" class="rounded-lg h-40" alt="" srcset="" />
                  <h1
                    class="text-left mx-1 text-md text-gray-100 bg-gray-500/25 p-1 mt-1 rounded-lg md:h-14 overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {{ data.title }}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3 bg-slate-100/25 rounded-lg m-1">
            <div class="m-6 p-1 rounded-lg bg-gray-200">
              <img :src="currentTrack.img_medium_url || img || icecastImgUrl" alt="" class="w-full h-32 rounded-lg" />
            </div>
            <div class="p-3">
              <hr class="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
              <h1 class="text-white text-left m-1">Titre</h1>

              <div>
                <h4 class="text-white text-left m-1">
                  {{ currentTrack.title }}
                </h4>
              </div>

              <hr class="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
              <h1 class="text-white text-left m-1 bg-gray-600 p-1 rounded-lg">
                Album
              </h1>
              <div>
                <h4 class="text-white text-left m-1">
                  {{ currentTrack.album }}
                </h4>
              </div>

              <hr class="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
              <h1 class="text-white text-left m-1">Auteur</h1>
              <div>
                <h4 class="text-white text-left m-1">
                  {{ currentTrack.author }}
                </h4>
              </div>
              <hr class="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
              <h1 class="text-white text-left m-1">description</h1>

              <div v-for="serverType in serverTypes" :key="serverType">
                <h4 v-if="server_type === '' ||
    (server_type === serverType && serverType === 'icecast')
    " class="text-white text-left m-1">
                  {{
    currentTrack.server_description === null
      ? "default"
      : currentTrack.server_description
  }}
                </h4>
                <h4 v-if="server_type === '' ||
    (server_type === serverType && serverType === 'shoutcast')
    " class="text-white text-left m-1">
                  {{
    currentTrack.genre === null ? "default" : currentTrack.genre
  }}
                </h4>
                <h4 v-if="server_type === '' ||
    server_type === serverType ||
    server_type === 'centovacast'
    " class="text-white text-left m-1">
                  {{
    currentTrack.genre === null ? "default" : currentTrack.genre
  }}
                </h4>
              </div>
              <hr class="my-1 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
              <InstallButton />
              <!-- <button> install pwa </button> -->
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 bg-slate-100/25 rounded-lg m-1">
          <div class="col-span-3" id="audioMetaD">
            <div class="flex p-1">
              <div id="cardPlayer" class="p-1 m-1 bg-gray-200 rounded-lg">

                <div>
                  <!-- <video controls autoplay>
                    <source :srcObject="STREAMING_LINK" type="audio/mpeg">
                  </video> -->
                  <!-- <video :srcObject="STREAMING_LINK"   autoplay></video> -->
                  <!-- <img :src="icecastImgUrl || img" v-if="server_type === 'icecast'"
                                        class="max-md:w-48 max-md:h-28" alt="" srcset="">
                                    <img :src="icecastImgUrl || img" v-if="server_type === 'shoutcast'"
                                        class="max-md:w-48 max-md:h-28" alt="" srcset="">
                                    <img :src="currentTrack.img_medium_url || img"
                                        v-if="server_type === 'everestcast' || server_type === 'rcast' || server_type === 'centovacast' || server_type === 'radioking' || server_type === 'azuracast'"
                                        class="max-md:w-14 md:w-20 md:h-20 max-md:h-14" alt="" srcset=""> -->
                  <img :src="currentTrack.img_medium_url || img || icecastImgUrl"
                    class="max-md:w-14 md:w-20 md:h-20 max-md:h-14" alt="" srcset="" />
                </div>
              </div>
              <div class="p-4">
                <div>
                  <h1 class="text-gray-200 text-xl text-left">
                    {{ currentTrack.title }}
                  </h1>

                  <!-- <h3 v-if="server_type === serverType && serverType === 'icecast'"
                                        class="text-gray-200 text-md text-left"> {{ currentTrack.server_description }}
                                    </h3>

                                    <h3 v-if="server_type === serverType && serverType === 'shoutcast' || serverType === 'everest_cast'"
                                        class="text-gray-200 text-md text-left"> {{ currentTrack.metadata }}</h3> -->
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-6 flex-col items-center justify-center">
            <div class="mt-7">
              <div v-if="!play" class="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-600">
                <div class="h-2 bg-white" style="width: 50%"></div>

                <div role="status_flux" class="m-1" v-if="loadFlux">
                  <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor" />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill" />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
              <div v-if="play" class="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-600"></div>
            </div>
            <div class="mt-3 mx-80">
              <Vbutton v-if="play" @click="togglePlayback">
                <svg class="fill-white" width="44px" height="44px" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M20.4086 9.35258C22.5305 10.5065 22.5305 13.4935 20.4086 14.6474L7.59662 21.6145C5.53435 22.736 3 21.2763 3 18.9671L3 5.0329C3 2.72368 5.53435 1.26402 7.59661 2.38548L20.4086 9.35258Z"
                      stroke="#1C274C" stroke-width="1.5"></path>
                  </g>
                </svg>
              </Vbutton>

              <VButton v-if="!play" @click="togglePlayback">
                <svg class="fill-white" width="44px" height="44px" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
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
            </div>
          </div>
          <div class="col-span-3 flex items-center justify-center" id="audioControl">
            <!-- <h3> audio Control </h3> -->
            <div>
              <div class="flex ml-12 mb-4" id="controlOption">
                <VButton class="m-1">
                </VButton>
                  <!-- <VButton class="m-1">
                  <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z"
                        fill="#fcfcfc"></path>
                    </g>
                  </svg>
                </VButton>   -->
                <VButton class="m-1" @click="openModal1()">
                  <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M7 17L17 7L12 2V22L17 17L7 7" stroke="#fcfcfc" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    </g>
                  </svg>
                </VButton>
              </div>
              <div class="flex" id="volumeControl">
                <VButton>
                  <svg width="44px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M10.0012 8.99984H9.1C8.53995 8.99984 8.25992 8.99984 8.04601 9.10883C7.85785 9.20471 7.70487 9.35769 7.60899 9.54585C7.5 9.75976 7.5 10.0398 7.5 10.5998V13.3998C7.5 13.9599 7.5 14.2399 7.60899 14.4538C7.70487 14.642 7.85785 14.795 8.04601 14.8908C8.25992 14.9998 8.53995 14.9998 9.1 14.9998H10.0012C10.5521 14.9998 10.8276 14.9998 11.0829 15.0685C11.309 15.1294 11.5228 15.2295 11.7143 15.3643C11.9305 15.5164 12.1068 15.728 12.4595 16.1512L15.0854 19.3023C15.5211 19.8252 15.739 20.0866 15.9292 20.1138C16.094 20.1373 16.2597 20.0774 16.3712 19.9538C16.5 19.811 16.5 19.4708 16.5 18.7902V5.20948C16.5 4.52892 16.5 4.18864 16.3712 4.04592C16.2597 3.92233 16.094 3.86234 15.9292 3.8859C15.7389 3.9131 15.5211 4.17451 15.0854 4.69733L12.4595 7.84843C12.1068 8.27166 11.9305 8.48328 11.7143 8.63542C11.5228 8.77021 11.309 8.87032 11.0829 8.93116C10.8276 8.99984 10.5521 8.99984 10.0012 8.99984Z"
                        stroke="#fcfcfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </g>
                  </svg>
                </VButton>
                <input class="bg-gray-200 rounded-lg appearance-none cursor-all-scroll dark:bg-white" type="range"
                  v-model="volume" @input="updateVolume" min="0" max="1" step="0.01" name="volume" id="volume" />
              </div>
            </div>
          </div>
        </div>

        <!-- <button @click="update"> Click </button> -->
      </div>
      <div class="md:hidden container-fluid ">
        <!-- <h1> mobile </h1> -->
        <div class="mx-11 mt-4 p-1 rounded-lg bg-gradient-to-r from-gray-200/25 to-gray-100 w-72 h-80 ">
          <div class="m-5 h-72">
            <!-- <img :src="icecastImgUrl || img" alt="" class="rounded-lg h-60"> -->
            <!-- <img :src="currentTrack.img_large_url || img" v-if="server_type === 'shoutcast'" alt=""
                        class="rounded-lg h-60"> -->

                        <img :src="currentTrack.img_medium_url || img || icecastImgUrl" alt="" class="w-full h-32 rounded-lg" />

            <h1 class="mt-4 text-white text-left text-sm bg-gray-400 m-1 p-1">
              {{ currentTrack.title }}

            </h1>

            <!-- <span><svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin"
                                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="#E5E7EB" />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentColor" />
                            </svg>
                            chargement ... </span> -->
            <h1 class="mt-4 text-white text-left text-sm">{{ message }}</h1>
          </div>
        </div>
        <div class="mx-11">
          <!-- <div class="mt-4">
                    <h1 class="text-white text-left text-lg"> {{ message }} </h1>
                </div>   -->
          <div class="mt-4 flex">
            <h1 class="text-white text-left text-md">{{ message }}</h1>
            <div class="flex ml-48">
              <!-- <VButton class="m-1">
                <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z"
                      fill="#fcfcfc"></path>
                  </g>
                </svg>
              </VButton>    -->
              <VButton class="m-1" @click="openModal1()">
                <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M7 17L17 7L12 2V22L17 17L7 7" stroke="#fcfcfc" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
                  </g>
                </svg>
              </VButton>
            </div>
          </div>

          <div v-if="!playMobile" class="mt-2 h-1 w-full bg-gray-400 dark:bg-neutral-600">
            <div class="h-1 bg-white" style="width: 50%"></div>
          </div>
          <div v-if="playMobile" class="mt-2 h-1 w-full bg-gray-400 dark:bg-neutral-600"></div>
        </div>
        <div class="mx-40 mt-3">
          <VButton v-if="playMobile" @click="togglePlayback">
            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.6935 15.8458L15.4137 13.059C16.1954 12.5974 16.1954 11.4026 15.4137 10.941L10.6935 8.15419C9.93371 7.70561 9 8.28947 9 9.21316V14.7868C9 15.7105 9.93371 16.2944 10.6935 15.8458Z"
                  fill="#b5b5b5"></path>
              </g>
            </svg>
          </VButton>

          <VButton v-if="!playMobile" @click="togglePlayback">
            <svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM8.07612 8.61732C8 8.80109 8 9.03406 8 9.5V14.5C8 14.9659 8 15.1989 8.07612 15.3827C8.17761 15.6277 8.37229 15.8224 8.61732 15.9239C8.80109 16 9.03406 16 9.5 16C9.96594 16 10.1989 16 10.3827 15.9239C10.6277 15.8224 10.8224 15.6277 10.9239 15.3827C11 15.1989 11 14.9659 11 14.5V9.5C11 9.03406 11 8.80109 10.9239 8.61732C10.8224 8.37229 10.6277 8.17761 10.3827 8.07612C10.1989 8 9.96594 8 9.5 8C9.03406 8 8.80109 8 8.61732 8.07612C8.37229 8.17761 8.17761 8.37229 8.07612 8.61732ZM13.0761 8.61732C13 8.80109 13 9.03406 13 9.5V14.5C13 14.9659 13 15.1989 13.0761 15.3827C13.1776 15.6277 13.3723 15.8224 13.6173 15.9239C13.8011 16 14.0341 16 14.5 16C14.9659 16 15.1989 16 15.3827 15.9239C15.6277 15.8224 15.8224 15.6277 15.9239 15.3827C16 15.1989 16 14.9659 16 14.5V9.5C16 9.03406 16 8.80109 15.9239 8.61732C15.8224 8.37229 15.6277 8.17761 15.3827 8.07612C15.1989 8 14.9659 8 14.5 8C14.0341 8 13.8011 8 13.6173 8.07612C13.3723 8.17761 13.1776 8.37229 13.0761 8.61732Z"
                  fill="#a9aaad"></path>
              </g>
            </svg>
          </VButton>
        </div>
        <div class="p-1 mx-7 overflow-y-auto">
          <div class="flex sm:w-full sm:h-28 border-black-300/75 rounded-lg shadow-2xl p-1 m-1 scroll"
            v-for="data in historyTrack" :key="data.id">
            <img :src="data.img_url" class="rounded-lg w-24 h-24" alt="" srcset="" />
            <h1 class="text-left my-4 mx-1 text-sm text-gray-400 p-2">
              {{ data.title }}
            </h1>
          </div>
        </div>
        <div class="flex p-1 mx-7 overflow-x-auto">
          <!-- <InstallButton /> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
<!-- localStorage.setItem("access-token", route.params["access-token"]) -->
