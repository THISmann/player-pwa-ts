// import { defineStore } from "pinia";
// import { Ref, ref } from "vue";
// import axios from "axios";
// // import { User, UserDTO, UserRole, newNullUser } from "@/services/domain/User";
// import { BASE_URL } from "@/utils/env";

// export enum USER_STORED {
//   ROLE = "user-role",
//   ACCESS_TOKEN = "access-token",
//   REFRESH_TOKEN = "refresh-token",
// };

// type State = {
//     user: string;
//     me: User;
//     userEmail: string;
//     tokenAccess: string;
//     tokenRefresh: string;
//     accessTokenExpiration: string; 
//     isAuthenticated: boolean;
//     baseUrl: Ref; 
// }

// export interface IAPIError {
//   response: {
//     data: {
//       detail: string;
//     } | {
//       [key: string]: string[];
//     }
//   }
// }

// export const useAuthStore = defineStore("authStore", {
//   state: (): State => ({
//     user: "",
//     me: newNullUser(),
//     userEmail: "",
//     tokenAccess: "",
//     tokenRefresh: "",
//     accessTokenExpiration: "", 
//     isAuthenticated: false, 
//     baseUrl: ref(BASE_URL),
//   }),

//   getters: {
//     printAuthenticatedStatus(state) {
//       return state.isAuthenticated;
//     },
//     printTokenAccess(state) {
//       return state.tokenAccess;
//     },
//     printTokenRefresh(state) {
//       return state.tokenRefresh;
//     },
//     printUsername(state) {
//       return state.user;
//     },
//     printuserEmail(state) {
//       return state.userEmail;
//     },
//     getUserRole(): string {
//       return localStorage.getItem(USER_STORED.ROLE) ?? "";
//     },
//     isValidRole(): boolean {
//       return Object.values<string>(UserRole).includes(this.getUserRole);
//     },
//     isClient(): boolean {
//       return localStorage.getItem(USER_STORED.ROLE) === UserRole.client;
//     },
//     isAdmin(): boolean {
//       return localStorage.getItem(USER_STORED.ROLE) === UserRole.admin;
//     },
//     isRevendeur(): boolean {
//       return localStorage.getItem(USER_STORED.ROLE) === UserRole.revendeur;
//     }
//   },

//   actions: {
//      // write a email Action
//      login(newAccessToken: string, newRefreshToken: string) {
//       this.tokenAccess = newAccessToken;
//       this.tokenRefresh = newRefreshToken;
//       this.isAuthenticated = true;
//     },
//     // write a email Action
//     setToken(accessToken: string, refreshToken: string) {
//       this.tokenAccess = accessToken;
//       this.tokenRefresh = refreshToken;
//       this.isAuthenticated = true;

//       localStorage.setItem(`access-token`, accessToken);
//       localStorage.setItem(`refresh-token`, refreshToken);
//     },
//     clearTokens() {
//       this.tokenAccess = "";
//       this.tokenRefresh = "";
//       this.accessTokenExpiration = "";

//       localStorage.removeItem("access-token");
//       localStorage.removeItem("refresh-token");
//       localStorage.removeItem(USER_STORED.ROLE);
//     },
//     setUserName(newUsername: string) {
//       this.user = newUsername;
//     },
//     setUserEmail(newUserEmail: string) {
//       this.userEmail = newUserEmail;
//     },
//     setHost(newHost: string): void {
//       this.baseUrl = newHost;
//     },
//     async verifyToken(): Promise<boolean> {
//       let isWell = false;
//       try{
//         const response = await axios.post(`${BASE_URL}auth/token/verify/`,
//             {
//               token: localStorage.getItem("access-token"),
//             }
//       );
//       isWell = response.status === 200;
//     } catch(error) {
//       console.error(error);
//     }
//       return isWell;
//     },
//     async getRefreshToken() {
//       try{
//         const accessToken = await axios.post(`${BASE_URL}auth/token/refresh`,
//             {
//               refresh: localStorage.getItem("refresh-token"),
//             }
//         );
//         console.log(accessToken);
//         localStorage.setItem(USER_STORED.ACCESS_TOKEN, accessToken.data);
//       } catch(error) {
//         console.error(error)
//       }
//     },
//     async getUserData() {
//       try {
//         const userData = await axios.get<UserDTO>(`${process.env.VUE_APP_API_BASE_URL}/auth/me/`, {
//           headers: {
//             Authorization: `Ekila ${localStorage.getItem(USER_STORED.ACCESS_TOKEN)}`,
//           }
//         });
//         localStorage.setItem(USER_STORED.ROLE, userData.data.roles);
//         this.me = new User(userData.data);
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   },
// });
