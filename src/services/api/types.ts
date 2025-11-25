// Type definitions for API responses

export interface PersonCast {
    id: string;
    name: string;
    character?: string;
    profile?: string;
}

export interface PersonCrew {
    id: string;
    name: string;
    job?: string;
    profile?: string;
}

export interface Movie {
    id: string;
    title: string;
    cover: string;
    rating: number;
    genre: string[];
    country: string;
    year: string;
    synopsis: string;
    trailer?: string;
    backdrops?: string[];
    cast?: PersonCast[];
    crew?: PersonCrew[];
    type: "movie" | "series";
    quality?: string;
}

export interface NekoBoccHentai {
    type: string;
    id: string;
    title: string;
    cover: string;
    genre: string[];
    duration: string;
    synopsis: string;
    downloadLinks?: DownloadLink[];
    streamLinks?: StreamLink[];
}

export interface NekopoiHentai {
    id: string;
    title: string;
    cover: string;
    genre: string[];
    duration: string;
    synopsis: string;
    type: string;
    uploadDate: string;
    downloadLinks?: DownloadLink[];
    streamLinks?: StreamLink[];
}

export interface DownloadLink {
    quality: string;
    size: string;
    url: string;
    type: string;
}

export interface StreamLink {
    quality: string;
    url: string;
    provider: string;
}

export interface Episode {
    id: string;
    title: string;
    episodeNumber: number;
    seasonNumber: number;
    cover: string;
    streamUrl: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    totalPages: number;
    totalItems: number;
}

export interface StreamingProvider {
    name: string;
    url: string;
    available: boolean;
    quality?: string;
    language?: string;
    tier?: number;
}

// Internal API types
export interface NekopoiItem {
    title: string;
    img: string;
    url: string;
    type: string;
    upload_date: string;
    genre?: string[];
    duration?: string;
    synopsis?: string;
}

export interface NekopoiDetail {
    title: string;
    img: string;
    genre: string[];
    duration: string;
    synopsis: string;
    download_links?: Array<{
        quality: string;
        size: string;
        links: Array<{
            server: string;
            url: string;
        }>;
    }>;
    stream_links?: Array<{
        server: string;
        url: string;
    }>;
}

export interface NekopoiSearchResult {
    title: string;
    url: string;
    type: string;
    thumb: string;
}
