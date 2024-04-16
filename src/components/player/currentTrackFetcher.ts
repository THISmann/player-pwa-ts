// currentTrackFetcher.ts

import { fetchAndProcessRadioData } from "./fetchAndProcessRadioData";
import { getHistoryTracks } from "./historyFetcher";

export const getCurrentTrack = async (
  historyTrack: any,
  items: any,
  currentTrack: any
) => {
  const playerServerType = localStorage.getItem("playerServerType");
  const playerUrlApi = localStorage.getItem("playerUrlApi");
  const playerUrlApiHistory = localStorage.getItem("playerUrlApiHistory");

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
