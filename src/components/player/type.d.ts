export interface Welcome {
    radio_flux:       string;
    current_track:    CurrentTrack;
    song_history:     CurrentTrack[];
    is_api_available: boolean;
    publicities:      Publicity[];
    menu:             Menu[];
}

export interface CurrentTrack {
    title:       string;
    album_title: string;
    cover:       string;
    artist_name: string;
}

export interface Menu {
    id:    number;
    title: string;
    link:  string;
    radio: number;
}

export interface Publicity {
    id:            number;
    pub_image:     string;
    description:   string;
    is_enable:     boolean;
    is_created_at: Date;
    is_updated_at: Date;
}