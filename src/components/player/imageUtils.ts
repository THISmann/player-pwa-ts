// imageUtils.ts

import axios from "axios";
import themeColor from "./colorExtraction";

export const getImgTrack = async (
  title: string
) => {
  try {
    const response = await axios.get("https://itunes.apple.com/search", {
      params: {
        term: title,
      },
    });
    return response.data.results[0].artworkUrl100;
    //getColorImg(icecastImgUrl);
  } catch (error) {
    
    if (axios.isAxiosError(error)) {
      // Axios error handling
    } else {
      // Non-Axios error handling
    }
  } finally {
    // Optional: any cleanup code or finalization logic
  }
};

const SetColor = (
  colorArr: number[][]
) => {
  const bgc = `rgb(${Math.floor(colorArr[0][0])},${Math.floor(
    colorArr[0][1]
  )},${Math.floor(colorArr[0][2])})`;
  // currentBgColor = bgc;
  return bgc;
};

export const getColorImg = (source: string) => {
  const img = new Image();
  img.src = source;
  img.crossOrigin = "anonymous";
  img.onload = () => {
    themeColor(100, img, 40, SetColor);
};
};


