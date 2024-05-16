// public interface IRadioProvider{
//    getNowPlaying():  Promise<NowPlayingInfo> ;
// }

// interface NowPlayingInfo{
//     title: string,
//     album: string,
//     author: string,
//     img_medium_url: string | null
// }

// public class IcecastProvider implements IRadioProvider {

//     constructor(url: string) {
//         this.url = url;
        
//     }
//     async  getNowPlaying(): Promise<NowPlayingInfo> {
//         let responce = await fetch(this.url);
//         let json = await responce.data()

//         return JSON.parse(JSON.stringify(data?.icestats.source[0], null, 2)) as NowPlayingInfo
//     }
// }

// class RadioProviderFactory{
//     public getProvider(type: string, url: string): IRadioProvider{
//         switch (type) {
//             case "icecast":
//                 return new IcecastProvider(url)
        
//             default:
//                 break;
//         }
//     }
// }

// let provider = RadioProviderFactory().getProvider("icecast", "url")
// provider.getNowPlaying()