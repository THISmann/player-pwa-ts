import axios from "axios"; // Import axios if not already imported

export const getHistoryTracks = async (
  url: string,
  serverType: string
): Promise<any[]> => {
  let historyTrack: any[] = [];
  try {
    const response = await axios.get(url);
    const responseData = response.data;
    const dataArray = [
      responseData.results,
      responseData.items,
      responseData.song_history,
    ];

    for (const data of dataArray) {
      if (Array.isArray(data)) {
        parseHistoryData(data, serverType, historyTrack);
        break; // Stop the loop once we find the first array
      }
    }

    return historyTrack; // Return the historyTrack array after parsing
  } catch (error) {
    console.error(error);
    return []; // Return an empty array in case of error
  }
};

const parseHistoryData = (
  data: any[],
  serverType: string,
  historyTrack: any[]
) => {
  for (const item of data) {
    let title = "";
    let img_url = "";
    switch (serverType) {
      case "shoutcast":
        title = item.title;
        img_url = item.img_url;
        break;
      case "radioking":
        title = item.title;
        img_url = item.cover_url;
        break;
      case "azuracast":
        title = item.song.title;
        img_url = item.song.art;
        break;
      case "centovacast":
        title = item.title;
        img_url = item.enclosure.url;
        break;
      case "everestcast":
      case "icecast":
        title = item.title;
        img_url = item.img_url;
        break;
      default:
        break;
    }
    historyTrack.push({ title: title, img_url: img_url });
  }
};
