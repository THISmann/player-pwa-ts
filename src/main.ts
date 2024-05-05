import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import "./assets/tailwind.css";
import 'vue-final-modal/style.css';
import { createVfm } from 'vue-final-modal'


const vfm = createVfm();

createApp(App).use(vfm).use(router).mount("#app");
