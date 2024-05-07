import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useAdvertStore = defineStore("advertStore", {
  state: () => ({
    currentAdvertId: 0, 
    advertLists: [],
  }),

  getters: {
    printuserAdvertId(state) {
      return state.currentAdvertId;
    },
    printuserAdvertLists(state) {
      return state.advertLists;
    }, 
  },

  actions: {
      // Méthode pour définir l'ID de l'annonce actuelle
      setCurrentAdvertId(id: number) {
        this.currentAdvertId = id;
      },
  
      // Méthode pour obtenir l'ID de l'annonce actuelle
      getCurrentAdvertId() {
        return this.currentAdvertId;
      },
  },
});
