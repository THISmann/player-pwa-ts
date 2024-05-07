import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useAdminStore = defineStore("adminStore", {
  state: () => ({
    currentUserId: 0, 
    userLists: [],
    currentUser: {}
  }),

  getters: {  
    printuserusersLists(state) {
      return state.userLists;
    },
    printuserCurrentId(state){
        return state.currentUserId;
    },
    printcurrentUser(state){
      return state.currentUser;
    }
  },

  actions: {
    // write a email Action
  },
});
