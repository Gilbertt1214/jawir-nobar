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

// Represents a JAV/Hentai entry from Nekopoi or similar sources
export interface NekopoiJAV {
    id: string;          // Unique slug or ID extracted from source URL
    title: string;       // Original title from the provider
    cover: string;       // Poster image URL
    genre: string[];     // Array of genres/tags
    duration: string;    // Episode duration (if available)
    synopsis: string;    // Brief summary of the content
    type: string;        // Typically "hentai"
    uploadDate: string;  // Upload timestamp or info string
    nekopoiUrl?: string; // Original source link (for detail fetching)
    seriesSlug?: string; // Parent series slug
    seriesTitle?: string; // Parent series title
    downloadLinks?: DownloadLink[]; // Optional download mirrors
    streamLinks?: StreamLink[];     // Optional streaming mirrors
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
    id?: string;
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

// Manga / Comic types
export interface Manga {
    id: string; // slug
    title: string;
    cover: string;
    type?: string; // Manga, Manhwa, Manhua
    status?: string;
    latestChapter?: string;
    rating?: string;
    slug?: string;
}

export interface Chapter {
    title: string;
    slug: string;
    releaseDate?: string;
}

export interface MangaDetail {
    id: string;
    title: string;
    cover: string;
    alternativeTitle?: string;
    author?: string;
    artist?: string;
    synopsis?: string;
    genres: string[];
    status?: string;
    type?: string;
    chapters: Chapter[];
    rating?: string;
}

export interface ChapterPage {
    index: number;
    url: string;
}
