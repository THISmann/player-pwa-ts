import { defineStore } from "pinia";

// Créez un store nommé MyStore
export const useMyStore = defineStore("myStore", {
  // State (état) du store
  state: () => ({
    count: 0,
    message: "Hello, Pinia!",
    token: "",
  }),

  // Getters (accesseurs) pour accéder à l'état
  getters: {
    doubleCount(state) {
      return state.count * 2;
    },
  },

  // Actions pour modifier l'état
  actions: {
    increment() {
      this.count++;
    },

    setMessage(newMessage: string) {
      this.message = newMessage;
    },

    setToken(newToken: string){
      this.token = newToken
    }

  },
});
