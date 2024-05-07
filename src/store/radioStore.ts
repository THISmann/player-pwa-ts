import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useRadioStore = defineStore("radioStore", {
  state: () => ({
    currentRadioId: 0,
    radioLists: [],
    currentRadio: {},
    radioName: "",
    radioToken: "",
  }),

  getters: {
    printRadioLists(state) {
      return state.radioLists;
    },
    printCurrentRadioId(state) {
      return state.currentRadioId;
    },
    printCurrentRadio(state) {
      return state.currentRadio;
    },
    printRadioName(state){
      return state.radioName;
    },
    printRadioToken(state){
      return state.radioToken;
    }
  },

  actions: {
    setCurrentRadio(currentRadio: {
      currentRadioId: number;
      url_server_radio: string;
      url_api_radio: string;
      url_api_radio_history: string;
      url_flux_radio: string;
      server_type: string;
    }) {
      this.currentRadio = currentRadio;
    },
  },
});
