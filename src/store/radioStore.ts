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
    radioFlux: "",
    radioErrMsg: "",
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
    },
    printRadioFlux(state){
      return state.radioFlux;
    },
    printRadioErrorMsg(state){
      return state.radioErrMsg;
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
