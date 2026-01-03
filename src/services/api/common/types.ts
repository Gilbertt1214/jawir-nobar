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

export interface Season {
    id: number;
    name: string;
    episodeCount: number;
    year?: string;
    overview?: string;
    cover?: string;
    seasonNumber: number;
}

export interface Movie {
    id: string; // For anime, this can be the slug
    title: string;
    cover: string;
    rating?: number; // Optional for anime list
    genre: string[];
    country?: string; // Optional for anime
    year?: string; // Optional for anime
    synopsis?: string; // Optional for list view
    trailer?: string;
    backdrops?: string[];
    cast?: PersonCast[];
    crew?: PersonCrew[];
    type: "movie" | "series" | "anime";
    quality?: string;
    seasons?: Season[];
    // Anime specific fields
    slug?: string;
    latestEpisode?: string; // e.g., "Episode 11"
    status?: string;
    duration?: string;
    releaseDate?: string;
    studio?: string;
    totalEpisodes?: string;
}

export interface AnimeEpisode {
    title: string;
    slug: string;
    link: string;
}

export interface AnimeDetail extends Movie {
    episodes: AnimeEpisode[];
    studios?: string;
    producers?: string;
    totalEpisodes?: string;
}

export interface NekopoiJAV {
    id: string;
    title: string;
    cover: string;
    genre: string[];
    duration: string;
    synopsis: string;
    type: string;
    uploadDate: string;
    nekopoiUrl?: string;
    downloadLinks?: DownloadLink[];
    streamLinks?: StreamLink[];
}

// Alias for backward compatibility
export type NekopoiHentai = NekopoiJAV;

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
    airDate?: string;
    overview?: string;
    description?: string;
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
