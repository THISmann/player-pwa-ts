import { getImgTrack, getColorImg } from './imageUtils'; // Import necessary helper functions

export const fetchAndProcessRadioData = async (url: string) => {
    let currentTrack: any = {}; // Create an empty object for currentTrack
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = localStorage.getItem("playerServerType") !== 'shoutcast' ? await response.json() : null;

        switch (localStorage.getItem("playerServerType")) {
            case 'icecast':
                currentTrack = JSON.parse(JSON.stringify(data?.icestats.source[0], null, 2));
                console.log('++++++', currentTrack);
                break;
            case 'rcast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.nowplaying, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.coverart, null, 2))
                };
               // console.log('++++++', currentTrack);
                break;
            case 'centovacast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.data[0].track.title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data?.data[0].track.album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data?.data[0].track.artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.data[0].track.imageurl, null, 2)),
                };
                break;
            case 'azuracast':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data?.now_playing.song.title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data?.now_playing.song.album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data?.now_playing.song.artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data?.now_playing.song.art, null, 2)),
                };
                // console.log('++++++', currentTrack);
                break;
            case 'radioking':
                currentTrack = {
                    "title": JSON.parse(JSON.stringify(data[0].title, null, 2)),
                    "album": JSON.parse(JSON.stringify(data[0].album, null, 2)),
                    "author": JSON.parse(JSON.stringify(data[0].artist, null, 2)),
                    "img_medium_url": JSON.parse(JSON.stringify(data[0].cover_url, null, 2)),
                }; 
                break;
            case 'everestcast':
                currentTrack = {
                    "title": data.results[0].title,
                    "album": data.results[0].album,
                    "author": data.results[0].author,
                    "img_medium_url": data.results[0].img_url,
                }; 
                break;

            case 'shoutcast':
                currentTrack = { "title": await response.text() }; 
                break;
            default:
                break;
        }
        //getColorImg(currentTrack.img_medium_url);
        return currentTrack; // Return the currentTrack object
    } catch (error) {
        console.error('Fetch failed:', error);
    }
};
